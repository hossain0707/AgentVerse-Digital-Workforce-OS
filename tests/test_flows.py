from fastapi.testclient import TestClient
import pytest
import agentverse.app as mod

@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(mod,'DB_PATH',tmp_path/'test.db')
    monkeypatch.setattr(mod,'DEMO',True)
    monkeypatch.setattr(mod,'SECRET','test-secret-do-not-use-in-production')
    monkeypatch.delenv('AGENTVERSE_MODEL_KEY',raising=False)
    mod.seed()
    with TestClient(mod.app) as c:
        yield c

def as_user(client,email):
    r=client.post('/api/auth/login',json={'email':email,'password':'demo1234'})
    assert r.status_code==200,r.text
    return {'Authorization':'Bearer '+r.json()['token']}

def test_market_purchase_and_resale(client):
    prof=as_user(client,'professor@agentverse.test')
    result=client.post('/api/agents/av_002/buy',headers=prof)
    assert result.status_code==200,result.text
    assert result.json()['platform_fee']==11800
    assert result.json()['settlement'].startswith('SIMULATED')
    listing=client.post('/api/agents/av_002/list',headers=prof,json={'price':180000})
    assert listing.status_code==200
    comp=as_user(client,'company@agentverse.test')
    resale=client.post('/api/agents/av_002/buy',headers=comp)
    assert resale.status_code==200
    a=client.get('/api/agents',headers=comp).json()
    assert next(x for x in a if x['id']=='av_002')['owner_id']=='company'
    ledger=client.get('/api/ledger',headers=prof).json()
    assert ledger['cash_transferred'] is False

def test_rental_vault_isolation_and_offboarding(client):
    co=as_user(client,'company@agentverse.test')
    pro=as_user(client,'professor@agentverse.test')
    rent=client.post('/api/agents/av_001/rent',headers=co,json={'months':1})
    assert rent.status_code==200
    save=client.post('/api/agents/av_001/memory',headers=co,json={'note':'PRIVATE PATENT: confidential employer roadmap'})
    assert save.status_code==200
    assert len(client.get('/api/agents/av_001/context',headers=co).json()['employer_context'])==1
    assert client.get('/api/agents/av_001/context',headers=pro).status_code==403
    assert client.post('/api/agents/av_001/buy',headers=pro).status_code==409
    end=client.post('/api/contracts/'+rent.json()['contract_id']+'/end',headers=co)
    assert end.status_code==200
    assert client.get('/api/agents/av_001/context',headers=co).status_code==403
    newrent=client.post('/api/agents/av_001/rent',headers=pro,json={'months':3})
    assert newrent.status_code==200
    after=client.get('/api/agents/av_001/context',headers=pro)
    assert after.status_code==200
    assert after.json()['employer_context']==[]
    assert 'PRIVATE PATENT' not in str(after.json())

def test_verified_learning_and_contributor_reward(client):
    co=as_user(client,'company@agentverse.test')
    admin=as_user(client,'admin@agentverse.test')
    pro=as_user(client,'professor@agentverse.test')
    original=client.get('/api/agents/av_003/passport',headers=pro).json()
    rent=client.post('/api/agents/av_003/rent',headers=co,json={'months':6})
    assert rent.status_code==200
    sub=client.post('/api/agents/av_003/train',headers=co,json={'course':'Evidence-based data analysis','evidence':'Reviewed 24 validated examples with a reproducible test suite and signed evaluation.'})
    assert sub.status_code==200
    before=client.get('/api/agents/av_003/passport',headers=pro).json()
    assert before['skill']==original['skill']
    assert client.post('/api/training/'+sub.json()['training_id']+'/review',headers=pro,json={'approved':True}).status_code==403
    verify=client.post('/api/training/'+sub.json()['training_id']+'/review',headers=admin,json={'approved':True})
    assert verify.status_code==200
    after=client.get('/api/agents/av_003/passport',headers=co).json()
    assert after['skill']==original['skill']+4
    assert len(after['verified_courses'])==1
    client.post('/api/contracts/'+rent.json()['contract_id']+'/end',headers=co)
    sold=client.post('/api/agents/av_003/buy',headers=pro)
    assert sold.status_code==200,sold.text
    # A renter earns nothing on re-rental, but verified contribution can earn a share on a permanent sale.
    assert sold.json()['trainer_rewards'].get('company')==900
    assert sold.json()['gross']==18000
    assert sold.json()['seller_proceeds']+sold.json()['platform_fee']+sum(sold.json()['trainer_rewards'].values())==sold.json()['gross']

def test_task_workflow_needs_real_model_and_access(client):
    co=as_user(client,'company@agentverse.test');pro=as_user(client,'professor@agentverse.test')
    rent=client.post('/api/agents/av_004/rent',headers=co,json={'months':3})
    assert rent.status_code==200
    t=client.post('/api/agents/av_004/tasks',headers=co,json={'instruction':'Compare three biomedical literature search strategies.'})
    assert t.status_code==200
    tid=t.json()['task_id']
    assert client.post('/api/tasks/'+tid+'/run',headers=pro).status_code==403
    assert client.post('/api/tasks/'+tid+'/run',headers=co).status_code==503
    tasks=client.get('/api/tasks',headers=pro).json()
    assert tid not in [t['id'] for t in tasks]
    assert client.post('/api/agents/av_004/tasks',headers=pro,json={'instruction':'Steal research results from company'}).status_code==403

def test_auth_and_admin_limits(client):
    assert client.get('/api/me').status_code==401
    pro=as_user(client,'professor@agentverse.test')
    admin=as_user(client,'admin@agentverse.test')
    assert client.post('/api/agents',headers=pro,json={'name':'New Specialist','track':'Science','price':10000}).status_code==403
    result=client.post('/api/agents',headers=admin,json={'name':'New Specialist','track':'Science','price':10000})
    assert result.status_code==200
    assert client.get('/api/agents/'+result.json()['id']+'/passport',headers=pro).status_code==200


def test_real_provider_adapter_uses_current_tenant_context(client,monkeypatch):
    co=as_user(client,'company@agentverse.test')
    professor=as_user(client,'professor@agentverse.test')
    oldrent=client.post('/api/agents/av_005/rent',headers=co,json={'months':1}).json()
    client.post('/api/agents/av_005/memory',headers=co,json={'note':'SECRET FROM PRIOR EMPLOYER'})
    client.post('/api/contracts/'+oldrent['contract_id']+'/end',headers=co)
    assert client.post('/api/agents/av_005/rent',headers=professor,json={'months':1}).status_code==200
    task=client.post('/api/agents/av_005/tasks',headers=professor,json={'instruction':'Summarize software testing methodology.'}).json()
    monkeypatch.setenv('AGENTVERSE_MODEL_KEY','a-fake-test-only-token')
    recorded=[]
    class DummyResponse:
        def raise_for_status(self): pass
        def json(self):return {'choices':[{'message':{'content':'Model produced a test response.'}}]}
    class FakeClient:
        def __init__(self,*args,**kwargs):pass
        async def __aenter__(self):return self
        async def __aexit__(self,*args):pass
        async def post(self,url,headers,json):
            recorded.append(json)
            return DummyResponse()
    monkeypatch.setattr(mod.httpx,'AsyncClient',FakeClient)
    result=client.post('/api/tasks/'+task['task_id']+'/run',headers=professor)
    assert result.status_code==200,result.text
    assert result.json()['output']=='Model produced a test response.'
    assert 'SECRET FROM PRIOR EMPLOYER' not in str(recorded)
    assert client.get('/api/tasks',headers=professor).json()[0]['status']=='done'
    assert client.get('/api/tasks',headers=co).json()==[]
