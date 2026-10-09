from subprocess import Popen,PIPE
from pathlib import Path
import json,tempfile
from sys import argv
root=Path(__file__).parents[1]
with tempfile.TemporaryDirectory() as tmp:
 f=Path(tmp)/'AgentVerse-portable.json'
 f.write_text(json.dumps({'format':'agentverse-workspace-v1','version':2,'selectedId':'av_test_123','agents':[{'id':'av_test_123','name':'Test employee','role':'Research assistant','instructions':'Cite references','createdAt':'2026-10-09T00:00:00Z','updatedAt':'2026-10-09T00:00:00Z','lessons':[],'tasks':[],'documents':[{'id':'doc_123','title':'Battery guide','text':'Inspect battery cells for corrosion near battery terminals and check for overheating.','source':'user-upload','createdAt':'2026-10-09T00:00:00Z'}]}]}),encoding='utf8')
 proc=Popen(['node',str(root/'public/downloads/agentverse-mcp.mjs'),str(f)],stdin=PIPE,stdout=PIPE,stderr=PIPE,text=True)
 def call(id,method,params=None):
  proc.stdin.write(json.dumps({'jsonrpc':'2.0','id':id,'method':method,'params':params or {}})+'\n');proc.stdin.flush()
  return json.loads(proc.stdout.readline())
 a=call(1,'initialize',{'protocolVersion':'2025-06-18'})
 assert a['result']['serverInfo']['name']=='agentverse-local-bridge'
 b=call(2,'tools/list')
 assert len(b['result']['tools'])==7
 c=call(3,'tools/call',{'name':'list_employees','arguments':{}})
 assert 'Test employee' in c['result']['content'][0]['text']
 d=call(4,'tools/call',{'name':'search_knowledge','arguments':{'query':'corrosion battery terminals'}})
 assert 'Battery guide' in d['result']['content'][0]['text']
 e=call(5,'tools/call',{'name':'prepare_task','arguments':{'task':'Plan battery inspection for corrosion'}})
 assert '[Source 1]' in e['result']['content'][0]['text']
 denied=call(6,'tools/call',{'name':'record_lesson','arguments':{'title':'Safety','content':'Inspect battery cells daily','consent':False}})
 assert denied['result']['isError']==True
 g=call(7,'tools/call',{'name':'record_lesson','arguments':{'title':'Safety','content':'Inspect battery cells daily and document any corrosion','consent':True}})
 result=json.loads(g['result']['content'][0]['text'])
 output=Path(result['file'])
 assert output.is_file() and output!=f
 saved=json.loads(output.read_text())
 assert saved['agents'][0]['lessons'][0]['title']=='Safety'
 assert len(json.loads(f.read_text())['agents'][0]['lessons'])==0,'original backup was modified'
 proc.stdin.close();proc.wait(timeout=4)
 assert proc.returncode==0,proc.stderr.read()
 print('MCP stdio integration passed: initialize, tools listing, local knowledge, prompt, consent, non-destructive export.')