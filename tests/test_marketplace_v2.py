"""Regression coverage for AgentVerse buyer workspace and fair contract flows."""
from datetime import datetime
import pytest
from fastapi.testclient import TestClient
import agentverse.app as mod


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(mod, 'DB_PATH', tmp_path / 'v2.db')
    monkeypatch.setattr(mod, 'DEMO', True)
    monkeypatch.setattr(mod, 'SECRET', 'a-test-secret-only-never-deploy')
    monkeypatch.delenv('AGENTVERSE_MODEL_KEY', raising=False)
    mod.seed()
    with TestClient(mod.app) as c:
        yield c


def auth(c, email):
    r=c.post('/api/auth/login',json={'email':email,'password':'demo1234'})
    assert r.status_code==200, r.text
    return {'Authorization':'Bearer '+r.json()['token']}


def test_customer_onboarding_catalog_quote_and_activation(client):
    assert client.get('/start').status_code==200
    catalog=client.get('/api/catalog')
    assert catalog.status_code==200
    assert catalog.json()['transactions_are_simulated'] is True
    assert 'PRIVATE' not in str(catalog.json())
    assert 'owner_id' not in str(catalog.json())
    assert client.post('/api/auth/register',json={'name':'Example Tester','email':'a@b.example','password':'shortpass'}).status_code==422
    signed=client.post('/api/auth/register',json={'name':'Example Tester','email':'a@b.example','password':'a-strong-test-passcode!','kind':'buyer'})
    assert signed.status_code==200,signed.text
    headers={'Authorization':'Bearer '+signed.json()['token']}
    assert client.get('/api/agents/av_002/activation',headers=headers).status_code==403
    quoted=client.get('/api/agents/av_002/sale-quote',headers=headers)
    assert quoted.status_code==200
    assert quoted.json()['price_is_real'] is False
    assert quoted.json()['seller_proceeds']+quoted.json()['platform_fee']+sum(quoted.json()['trainer_rewards'].values())==quoted.json()['gross']
    transfer=client.post('/api/agents/av_002/buy',headers=headers)
    assert transfer.status_code==200
    assert transfer.json()['cash_transferred'] is False
    activation=client.get('/api/agents/av_002/activation',headers=headers).json()
    assert activation['assignment']=='owned_idle'
    assert activation['remote_mcp_connected'] is False
    workspace=client.get('/api/workspace',headers=headers).json()
    assert any(a['id']=='av_002' for a in workspace['owned'])
    assert workspace['remote_chatgpt_claude_connection_active'] is False
    history=client.get('/api/agents/av_002/history',headers=headers).json()
    assert history['transfers'][0]['transfer_kind']=='sale'
    assert 'new_owner' not in str(history)
    assert not any(a['id']=='av_002' for a in client.get('/api/catalog').json()['items'])


def test_workplace_notes_isolated_from_new_owner_and_renter(client):
    admin=auth(client,'admin@agentverse.test')
    professor=auth(client,'professor@agentverse.test')
    company=auth(client,'company@agentverse.test')
    assert client.post('/api/agents/av_001/memory',headers=admin,json={'note':'OWNER LOCAL WORKBENCH NOTE'}).status_code==200
    assert 'OWNER LOCAL WORKBENCH NOTE' in str(client.get('/api/agents/av_001/context',headers=admin).json())
    rented=client.post('/api/agents/av_001/rent',headers=company,json={'months':1}).json()
    assert client.get('/api/agents/av_001/activation',headers=admin).status_code==403
    assert client.post('/api/agents/av_001/memory',headers=admin,json={'note':'owner should be locked out'}).status_code==403
    ctx=client.get('/api/agents/av_001/context',headers=company).json()
    assert ctx['employer_context']==[]
    client.post('/api/agents/av_001/memory',headers=company,json={'note':'COMPANY TOP SECRET KNOWLEDGE'})
    dashboard=client.get('/api/dashboard',headers=professor).json()
    assert 'COMPANY' not in str(dashboard)
    client.post('/api/contracts/'+rented['contract_id']+'/end',headers=company)
    new_rent=client.post('/api/agents/av_001/rent',headers=professor,json={'months':1})
    assert new_rent.status_code==200
    assert client.get('/api/agents/av_001/context',headers=professor).json()['employer_context']==[]
    client.post('/api/contracts/'+new_rent.json()['contract_id']+'/end',headers=professor)
    assert 'OWNER LOCAL WORKBENCH NOTE' in str(client.get('/api/agents/av_001/context',headers=admin).json())
    assert 'COMPANY TOP SECRET' not in str(client.get('/api/agents/av_001/context',headers=admin).json())


def test_owner_approved_contract_renewal_and_rejection(client):
    co=auth(client,'company@agentverse.test');owner=auth(client,'admin@agentverse.test')
    rent=client.post('/api/agents/av_003/rent',headers=co,json={'months':1}).json()
    before=client.get('/api/contracts',headers=co).json()[0]['expires']
    r=client.post('/api/contracts/'+rent['contract_id']+'/renew-request',headers=co,json={'months':3})
    assert r.status_code==200, r.text
    rid=r.json()['request_id']
    assert client.post('/api/contracts/'+rent['contract_id']+'/renew-request',headers=co,json={'months':1}).status_code==409
    assert client.post('/api/renewals/'+rid+'/decide',headers=co,json={'approved':True}).status_code==403
    appr=client.post('/api/renewals/'+rid+'/decide',headers=owner,json={'approved':True})
    assert appr.status_code==200,appr.text
    after=client.get('/api/contracts',headers=co).json()[0]
    assert datetime.fromisoformat(after['expires'])>datetime.fromisoformat(before)
    assert after['months']==4
    assert appr.json()['cash_transferred'] is False
    assert client.post('/api/renewals/'+rid+'/decide',headers=owner,json={'approved':True}).status_code==409
    next_request=client.post('/api/contracts/'+rent['contract_id']+'/renew-request',headers=co,json={'months':1}).json()
    rejected=client.post('/api/renewals/'+next_request['request_id']+'/decide',headers=owner,json={'approved':False})
    assert rejected.status_code==200
    assert rejected.json()['status']=='rejected'


def test_permanent_buyout_requires_owner_offer_and_keeps_skills(client):
    company=auth(client,'company@agentverse.test');prof=auth(client,'professor@agentverse.test');owner=auth(client,'admin@agentverse.test')
    rent=client.post('/api/agents/av_003/rent',headers=company,json={'months':6}).json()
    cid=rent['contract_id']
    assert client.post('/api/contracts/'+cid+'/buyout-accept',headers=company).status_code==409
    assert client.post('/api/contracts/'+cid+'/buyout-offer',headers=company,json={'price':10000}).status_code==403
    submission=client.post('/api/agents/av_003/train',headers=company,json={'course':'Reliable Evaluation Course','evidence':'Signed baseline plus 120 repeatable test runs and score calculations'}).json()
    assert client.post('/api/training/'+submission['training_id']+'/review',headers=owner,json={'approved':True}).status_code==200
    skill=client.get('/api/agents/av_003/passport',headers=prof).json()['skill']
    offered=client.post('/api/contracts/'+cid+'/buyout-offer',headers=owner,json={'price':170000})
    assert offered.status_code==200
    assert client.post('/api/contracts/'+cid+'/buyout-offer',headers=owner,json={'price':171000}).status_code==409
    assert client.get('/api/contracts/'+cid+'/buyout-offer',headers=prof).status_code==403
    done=client.post('/api/contracts/'+cid+'/buyout-accept',headers=company)
    assert done.status_code==200,done.text
    assert done.json()['gross']==170000
    assert done.json()['cash_transferred'] is False
    assert done.json()['seller_proceeds']+done.json()['platform_fee']+sum(done.json()['trainer_rewards'].values())==170000
    assert client.post('/api/contracts/'+cid+'/buyout-accept',headers=company).status_code==409
    assert client.get('/api/agents/av_003/activation',headers=company).json()['assignment']=='owned_idle'
    assert client.get('/api/agents/av_003/passport',headers=prof).json()['skill']==skill
    assert client.get('/api/agents/av_003/history',headers=company).json()['transfers'][0]['transfer_kind']=='buyout'


def test_owner_task_during_idle_and_abort_if_contract_changes_mid_completion(client,monkeypatch):
    owner=auth(client,'admin@agentverse.test');company=auth(client,'company@agentverse.test')
    idle=client.post('/api/agents/av_001/tasks',headers=owner,json={'instruction':'Draft a reproducible test plan for R&D.'})
    assert idle.status_code==200
    taskid=idle.json()['task_id']
    monkeypatch.setenv('AGENTVERSE_MODEL_KEY','not-real')
    class Response:
        def raise_for_status(self):pass
        def json(self):return {'choices':[{'message':{'content':'Should never save after owner access is revoked'}}]}
    class Client:
        def __init__(self,*args,**kwargs):pass
        async def __aenter__(self):return self
        async def __aexit__(self,*a):pass
        async def post(self,*a,**kw):
            # Simulate a concurrent contract being recorded while the provider is working.
            # A nested TestClient call from the async HTTP stub is not thread-safe.
            with mod.db() as c:
                start=mod.now()
                end=(mod.datetime.now(mod.timezone.utc)+mod.timedelta(days=30)).isoformat()
                c.execute('INSERT INTO contracts VALUES(?,?,?,?,?,?,?,?,?)',
                          ('concurrent_contract','av_001','company','platform',1,1000,start,end,'active'))
            return Response()
    monkeypatch.setattr(mod.httpx,'AsyncClient',Client)
    result=client.post('/api/tasks/'+taskid+'/run',headers=owner)
    assert result.status_code==409,result.text
    tasks=client.get('/api/tasks',headers=owner).json()
    assert next(t for t in tasks if t['id']==taskid)['output'] is None


def test_non_demo_registration_defaults_closed(client, monkeypatch):
    monkeypatch.setattr(mod,'DEMO',False)
    monkeypatch.delenv('AGENTVERSE_ALLOW_REGISTRATION',raising=False)
    r=client.post('/api/auth/register',json={'name':'Test Person','email':'test@example.invalid','password':'a-perfectly-good-long-password'})
    assert r.status_code==503


def test_prior_employer_can_export_and_delete_own_memories_after_offboarding(client):
    employer=auth(client,'company@agentverse.test')
    other=auth(client,'professor@agentverse.test')
    contract=client.post('/api/agents/av_006/rent',headers=employer,json={'months':1}).json()
    client.post('/api/agents/av_006/memory',headers=employer,json={'note':'Keep this confidential between employers'})
    client.post('/api/contracts/'+contract['contract_id']+'/end',headers=employer)
    exported=client.get('/api/me/export',headers=employer).json()
    assert exported['portable'] is False
    assert len(exported['employer_notes'])==1
    note_id=exported['employer_notes'][0]['id']
    assert client.delete('/api/me/memories/'+note_id,headers=other).status_code==404
    assert client.delete('/api/me/memories/'+note_id,headers=employer).json()['deleted'] is True
    assert client.get('/api/me/export',headers=employer).json()['employer_notes']==[]