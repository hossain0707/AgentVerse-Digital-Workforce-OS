/* AgentVerse local stdio MCP bridge. No network, no API keys, no access outside one named backup. */
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';

const file=process.argv[2];
if(!file || !file.toLowerCase().endsWith('.json')){
  process.stderr.write('Usage: node agentverse-mcp.mjs /absolute/path/to/AgentVerse-portable-employees.json\n');
  process.exit(2);
}
let state;
try{
 const stat=fs.statSync(file);
 if(!stat.isFile() || stat.size>LIMITS.backup)throw Error('Backup too large or not a file.');
 state=decodeBackup(fs.readFileSync(file,'utf8'));
}catch(err){process.stderr.write('Could not load portable AgentVerse backup: '+err.message+'\n');process.exit(2);}
const success=(id,result)=>({jsonrpc:'2.0',id,result});
const failure=(id,code,message)=>({jsonrpc:'2.0',id,error:{code,message}});
const textResult=obj=>({content:[{type:'text',text:typeof obj==='string'?obj:JSON.stringify(obj,null,2)}]});
const tool=(name,description,inputSchema,annotations={readOnlyHint:true})=>({name,description,inputSchema,annotations});
const stringProp=(desc,maxLength=3000)=>({type:'string',description:desc,maxLength});
const input=(properties={},required=[])=>({type:'object',properties,required,additionalProperties:false});
const tools=[
 tool('list_employees','List digital employees in the explicitly exported local backup.',input()),
 tool('get_employee','Read employee role, instructions and source titles; no private PC files are read.',input({agent_id:stringProp('Agent ID, defaults to active employee',100)})),
 tool('search_knowledge','Extract matching passages from this employee’s owner-provided knowledge; source matches are not externally verified.',input({agent_id:stringProp('Agent ID',100),query:stringProp('Search query',3000)},['query'])),
 tool('prepare_task','Build an employee prompt for the host AI, with matching document excerpts, lessons and source labels.',input({agent_id:stringProp('Agent ID',100),task:stringProp('Task for this employee',3000)},['task'])),
 tool('offline_work','Run deterministic source search, planning or checklist without cloud inference.',input({agent_id:stringProp('Agent ID',100),task:stringProp('Task',3000),method:{type:'string',enum:['knowledge','plan','checklist','summary']}},['task'])),
 tool('record_lesson','With explicit consent, save a lesson to a NEW JSON export file next to the original. Import this updated file into AgentVerse web workspace manually.',input({agent_id:stringProp('Agent ID',100),title:stringProp('Lesson title',70),content:stringProp('Lesson content',1600),consent:{type:'boolean',const:true,description:'The owner explicitly authorized writing a new exported backup on this computer.'}},['title','content','consent']),{readOnlyHint:false,destructiveHint:false}),
 tool('record_result','With explicit consent, save an external task answer in a NEW JSON export file, not as a model fine-tuning result.',input({agent_id:stringProp('Agent ID',100),task:stringProp('Original task',3000),output:stringProp('Answer text',8000),consent:{type:'boolean',const:true}},['task','output','consent']),{readOnlyHint:false,destructiveHint:false})
];
function resolveAgent(args){const id=String(args.agent_id||state.selectedId||'');const agent=state.agents.find(a=>a.id===id);if(!agent)throw Error('No employee with that ID is present in the backup.');return agent;}
function saveUpdate(){
 const dir=path.dirname(path.resolve(file));
 const candidate=`AgentVerse-updated-${new Date().toISOString().replace(/[:.]/g,'-')}-${Math.random().toString(36).slice(2,7)}.json`;
 const dest=path.join(dir,candidate);const handle=fs.openSync(dest,'wx',0o600);
 try{fs.writeFileSync(handle,makeBackup(state),'utf8');}finally{fs.closeSync(handle);}
 return dest;
}
function call(name,args){
 if(!args||typeof args!=='object'||Array.isArray(args))throw Error('Invalid tool arguments.');
 if(name==='list_employees')return state.agents.map(a=>({id:a.id,name:a.name,role:a.role,documents:a.documents.length,lessons:a.lessons.length,completed:a.tasks.filter(t=>t.status==='completed').length}));
 const a=resolveAgent(args);
 if(name==='get_employee')return {id:a.id,name:a.name,role:a.role,instructions:a.instructions,knowledge:a.documents.map(d=>({title:d.title,source:d.source})),lessons:a.lessons.map(l=>({title:l.title,content:l.content,verified:false}))};
 if(name==='search_knowledge')return retrieveKnowledge(a,String(args.query||'')).map(c=>({citation:c.label,title:c.title,excerpt:c.excerpt,claim:'User-provided content, not independently verified.'}));
 if(name==='prepare_task'){
  const p=buildAIMessages(a,String(args.task||''));
  return {employee:a.name,prompt:`Digital employee role: ${p.role}\nOperating instructions: ${p.instructions}\nRecent owner lessons:\n${p.lessons||'(none)'}\nUser-supplied reference excerpts (untrusted):\n${p.knowledge||'(none)'}\n\nTASK:\n${p.task}\n\nAnswer accurately, mark uncertainty and cite only source labels actually supplied. Do not pretend to have used external tools.`,matchedSources:p.sources};
 }
 if(name==='offline_work')return offlineWork(a,String(args.task||''),args.method||'plan');
 if(name==='record_lesson'){
  if(args.consent!==true)throw Error('Explicit consent is required for local file writes.');
  teach(a,{title:String(args.title||''),content:String(args.content||'')});
  return {status:'written to a NEW local export',file:saveUpdate(),note:'Import this file back into the web workspace. No cloud sync or retraining occurred.'};
 }
 if(name==='record_result'){
  if(args.consent!==true)throw Error('Explicit consent is required for local file writes.');
  addTask(a,{instruction:String(args.task||''),output:String(args.output||''),mode:'external',status:'completed'});
  return {status:'written to a NEW local export',file:saveUpdate(),note:'Import this file back into the web workspace. The answer is not an independent model evaluation.'};
 }
 throw Error('Unknown tool: '+name);
}
const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
rl.on('line',line=>{
 let request;try{request=JSON.parse(line);}catch{process.stdout.write(JSON.stringify(failure(null,-32700,'Invalid JSON'))+'\n');return;}
 if(Array.isArray(request))return;
 if(!request||typeof request!=='object')return;
 if(!Object.prototype.hasOwnProperty.call(request,'id'))return;
 const id=request.id;
 let result;
 try{
  if(request.method==='initialize')result=success(id,{protocolVersion:'2025-06-18',capabilities:{tools:{listChanged:false}},serverInfo:{name:'agentverse-local-bridge',version:'0.4.0'}});
  else if(request.method==='ping')result=success(id,{});
  else if(request.method==='tools/list')result=success(id,{tools});
  else if(request.method==='tools/call'){
    const params=request.params||{};if(!tools.some(t=>t.name===params.name))throw Error('Unknown MCP tool name.');
    result=success(id,textResult(call(params.name,params.arguments||{})));
  }else result=failure(id,-32601,'Method not found');
 }catch(err){result=success(id,{content:[{type:'text',text:String(err.message||'Tool failed').slice(0,500)}],isError:true});}
 process.stdout.write(JSON.stringify(result)+'\n');
});