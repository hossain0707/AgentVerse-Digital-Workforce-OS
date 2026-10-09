/* AgentVerse free local-first engine. Copyright (c) 2026 Md Najmul Hossain. */
export const FORMAT = 'agentverse-workspace-v1'; // keep compatibility with v0.3 exports
export const VERSION = 2;
export const LIMITS = Object.freeze({
  agents:24,lessons:80,tasks:80,documents:12,name:70,role:100,brief:1400,
  lesson:1600,task:3000,output:8000,documentText:60000,totalDocumentText:2000000,
  backup:6000000,context:3900,feedback:700
});
const now = () => new Date().toISOString();
const clean = (x,n) => String(x ?? '').trim().slice(0,n);
const ident = () => globalThis.crypto?.randomUUID?.() || `av-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const validDate = x => {const d=new Date(x); return Number.isFinite(d.getTime())?d.toISOString():now();};
const plainObject = obj => obj && typeof obj==='object' && !Array.isArray(obj);
export const PRESETS=Object.freeze([
  {id:'research',name:'Astra Nova',role:'Research assistant',description:'Research plans, source reviews, uncertainty checks',instructions:'Act as a careful research assistant. Separate source-supported statements from hypotheses. Summarize evidence, track open questions, identify limitations and never invent citations.',starterTitle:'Research quality checklist',starter:'Research workflow: (1) clarify the research question and scope; (2) collect permitted materials; (3) summarize each source independently; (4) compare methods and uncertainties; (5) cite exact supplied evidence; (6) ask for review before publication. This is a platform-authored example process, not a scholarly source.'},
  {id:'software',name:'Orion Dev',role:'Software engineer',description:'Architecture, code reviews and test planning',instructions:'Act as a pragmatic software engineer. Ask about language and runtime constraints. Explain risks, provide runnable minimal examples where appropriate, and distinguish tested code from untested suggestions.',starterTitle:'Software delivery checklist',starter:'Build process: define acceptance criteria, outline interfaces, identify security and privacy requirements, design tests, implement small changes, review dependencies and deployment configuration, record remaining risks. Never claim code ran unless an actual tool executed it.'},
  {id:'data',name:'Atlas Data',role:'Data analyst',description:'Metrics, data quality and interpretation',instructions:'Act as a rigorous data analyst. Validate assumptions, explain calculations, avoid misleading conclusions and request datasets before making claims about actual results.',starterTitle:'Data analysis checklist',starter:'Start by defining target metrics, units, data ownership and missing-value rules. Inspect outliers and sampling bias. Reproduce calculations and report uncertainty. Never invent measurements or pretend to have examined files you have not received.'},
  {id:'support',name:'Lumi Care',role:'Customer support assistant',description:'Support drafts, triage and escalation',instructions:'Act as a polite support drafting assistant. Do not promise refunds, changes or account actions. Ask for policies when missing. Route sensitive issues to a human.',starterTitle:'Support safety guidelines',starter:'Classify incoming requests, locate approved company policy, draft a concise response, flag privacy or security concerns, and seek human approval before sending or performing external actions. Avoid collecting unnecessary personal details.'},
  {id:'education',name:'Mira Tutor',role:'Education and training assistant',description:'Lessons, practice questions and feedback',instructions:'Act as a patient tutor. Teach incrementally, check understanding with questions, reveal reasoning at a useful level and distinguish learner feedback from formal qualifications.',starterTitle:'Teaching cycle',starter:'Teaching cycle: assess current understanding, define a small learning objective, present an example, guide independent practice, review with a rubric, provide corrective feedback and track what still needs work. These are locally recorded exercises, not accredited credentials.'},
  {id:'security',name:'Kairo Shield',role:'Cybersecurity defense assistant',description:'Defensive audits, incident checklists and risk analysis',instructions:'Act as a defensive cybersecurity analyst. Prioritize authorized assessment, least privilege, privacy and remediation. Avoid assuming a vulnerability exists without evidence.',starterTitle:'Defensive review checklist',starter:'Defensive security review: establish written authorization and scope, inventory assets, identify threats, review access controls and dependencies, propose mitigations, and validate findings with human-approved tests. Do not execute active attacks or access systems without authorization.'}
]);
export function createAgent({name,role,instructions=''}){
  const n=clean(name,LIMITS.name),r=clean(role,LIMITS.role);
  if(n.length<2||r.length<2)throw Error('Enter an employee name and role, at least two characters each.');
  const at=now();
  return {id:ident(),name:n,role:r,instructions:clean(instructions,LIMITS.brief),createdAt:at,updatedAt:at,lessons:[],documents:[],tasks:[]};
}
export function addDocument(agent,{title,text,source='uploaded'}){
  if(agent.documents.length>=LIMITS.documents)throw Error(`This employee can hold up to ${LIMITS.documents} knowledge documents.`);
  const t=clean(title,LIMITS.name),body=clean(text,LIMITS.documentText);
  if(t.length<2 || body.length<20)throw Error('A document needs a title and at least 20 characters of readable text.');
  if(typeof text !== 'string' || text.length>LIMITS.documentText)throw Error('Document text exceeds the 60,000-character limit. Split it into smaller documents.');
  const record={id:ident(),title:t,text:body,source:source==='starter'?'starter':'user-upload',createdAt:now()};
  agent.documents.unshift(record);agent.updatedAt=now();return record;
}
export function createFromPreset(id){
  const preset=PRESETS.find(p=>p.id===id);if(!preset)throw Error('Unknown employee template.');
  const employee=createAgent(preset);
  addDocument(employee,{title:preset.starterTitle,text:preset.starter,source:'starter'});
  return employee;
}
export function initialState(){
  const research=createFromPreset('research'),software=createFromPreset('software');
  return {format:FORMAT,version:VERSION,selectedId:research.id,agents:[research,software]};
}
export function teach(agent,{title,content}){
  if(agent.lessons.length>=LIMITS.lessons)throw Error('Lesson limit reached. Export a backup before removing old lessons.');
  const t=clean(title,LIMITS.name),c=clean(content,LIMITS.lesson);
  if(t.length<2||c.length<10)throw Error('Provide a title and at least ten characters of teaching content.');
  const record={id:ident(),title:t,content:c,createdAt:now(),source:'owner-supplied',verified:false};
  agent.lessons.unshift(record);agent.updatedAt=now();return record;
}
export function addTask(agent,{instruction,mode,output,status,sources=[]}){
  if(!['ai','offline','external'].includes(mode))throw Error('Invalid work mode.');
  const i=clean(instruction,LIMITS.task),o=clean(output,LIMITS.output);
  if(i.length<5||!['completed','failed'].includes(status))throw Error('Invalid task result.');
  const record={id:ident(),instruction:i,mode,output:o,status,createdAt:now(),sources:Array.isArray(sources)?sources.slice(0,6).map(s=>clean(s,LIMITS.name)):[],review:null};
  agent.tasks.unshift(record);agent.tasks=agent.tasks.slice(0,LIMITS.tasks);agent.updatedAt=now();return record;
}
export function reviewTask(agent,taskId,{rating,note=''}){
  const t=agent.tasks.find(x=>x.id===taskId);if(!t)throw Error('Task not found.');
  const n=Number(rating);if(!Number.isInteger(n)||n<1||n>5)throw Error('Choose a rating between 1 and 5.');
  t.review={rating:n,note:clean(note,LIMITS.feedback),at:now(),label:'owner assessment—not an independent verification'};
  agent.updatedAt=now();return t.review;
}
const STOPS=new Set('a an the and or to of in on at by with for from is are was were what which who how why when can could should would please this that these those i you we they it as do does did about our their your my make create write draft help give show need want using use based into across than then not all'.split(' '));
function terms(text){return [...new Set(clean(text,8000).toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)?.filter(x=>!STOPS.has(x))||[])].slice(0,70);}
export function retrieveKnowledge(agent,query,{maxChunks=4,maxChars=LIMITS.context}={}){
  const keywords=terms(query+' '+agent.role),chunks=[];
  for(const doc of agent.documents||[]){
    for(let offset=0;offset<doc.text.length;offset+=750){
      const excerpt=doc.text.slice(offset,offset+900),words=terms(excerpt),wordSet=new Set(words);
      let score=keywords.reduce((acc,t)=>acc+(wordSet.has(t)?2:0),0);
      const titleTerms=new Set(terms(doc.title)); score+=keywords.reduce((acc,t)=>acc+(titleTerms.has(t)?3:0),0);
      chunks.push({documentId:doc.id,title:doc.title,source:doc.source,excerpt,score,offset});
      if(chunks.length>=400)break;
    }
  }
  chunks.sort((a,b)=>b.score-a.score||a.offset-b.offset);
  const selected=[],seen=new Set();let total=0;
  for(const c of chunks){
    if(c.score===0)break;
    const maxForThis=Math.min(1000,maxChars-total-180);
    if(selected.length>=maxChunks||maxForThis<110)break;
    const key=c.documentId+':'+c.offset;if(seen.has(key))continue;
    const snippet=c.excerpt.slice(0,maxForThis);
    selected.push({...c,excerpt:snippet,label:`[Source ${selected.length+1}]`});total+=snippet.length+180;seen.add(key);
  }
  return selected;
}
export function buildAIMessages(agent,assignment){
  const task=clean(assignment,LIMITS.task);if(task.length<5)throw Error('Enter an assignment of at least five characters.');
  const matches=retrieveKnowledge(agent,task);
  const instructionLessons=(agent.lessons||[]).slice(0,7).map(x=>`${clean(x.title,70)}: ${clean(x.content,200)}`).join('\n');
  const feedback=(agent.tasks||[]).filter(x=>x.review?.note).slice(0,3).map(x=>`Owner feedback (${x.review.rating}/5): ${clean(x.review.note,180)}`).join('\n');
  const lessons=[instructionLessons,feedback].filter(Boolean).join('\n').slice(0,2200);
  const knowledge=matches.map(x=>`${x.label} ${x.title} (user/author-provided; not verified)\n${x.excerpt}`).join('\n\n').slice(0,LIMITS.context);
  return {role:clean(agent.role,LIMITS.role),instructions:clean(agent.instructions,LIMITS.brief),lessons,knowledge,task,sources:matches.map(m=>m.title)};
}
export function offlineWork(agent,instruction,method='plan'){
  const task=clean(instruction,LIMITS.task);if(task.length<5)throw Error('Describe your task using at least five characters.');
  const sentences=task.replace(/\s+/g,' ').match(/[^.!?\n]+[.!?]?/g)?.map(x=>x.trim()).filter(Boolean)||[];
  const pre=`Employee: ${agent.name} | ${agent.role}\nExecution: Offline structured tool (NOT generative AI)\nTask: ${task}\n`;
  if(method==='knowledge'){
    const found=retrieveKnowledge(agent,task);
    return pre+'\nLocal knowledge search (extractive; no model):\n'+(found.length?found.map(x=>`${x.label} ${x.title}\n${x.excerpt}`).join('\n\n'):'No relevant passages were found. Add your own knowledge documents under Knowledge or try a different question.')+'\n\nThese are user-provided documents, not externally verified facts.';
  }
  if(method==='summary')return pre+'\nExtractive summary of supplied task text:\n'+(sentences.slice(0,3).join(' ')||task)+'\n\nNo external research or verification was performed.';
  if(method==='checklist')return pre+'\nEditable checklist:\n'+(sentences.slice(0,6).map(x=>'☐ '+x).join('\n')||'☐ '+task)+'\n☐ Verify evidence\n☐ Ask for human approval';
  return pre+'\nDraft work plan:\n1. Define the deliverable and audience.\n2. Identify available inputs and constraints.\n3. Break work into small verifiable steps.\n4. Collect relevant owner-provided knowledge.\n5. Draft output and identify open issues.\n6. Review results with a human.\n\nThis is a planning template, not an AI model response.';
}
function validId(x){const id=clean(x,90);if(!/^[a-zA-Z0-9_-]{2,90}$/.test(id))throw Error('Invalid record identity.');return id;}
export function validateImport(raw){
  if(!plainObject(raw)||raw.format!==FORMAT||![1,2].includes(raw.version)||!Array.isArray(raw.agents))throw Error('This is not a supported AgentVerse backup.');
  if(raw.agents.length>LIMITS.agents)throw Error('Backup exceeds the allowed number of employees.');
  let docCount=0;const unique=new Set();
  const agents=raw.agents.map(a=>{
    if(!plainObject(a)||!Array.isArray(a.lessons)||!Array.isArray(a.tasks))throw Error('Invalid employee records.');
    const id=validId(a.id),name=clean(a.name,LIMITS.name),role=clean(a.role,LIMITS.role);
    if(unique.has(id)||name.length<2||role.length<2)throw Error('Duplicate or invalid employee.');unique.add(id);
    const docs=raw.version===1?[]:a.documents;
    if(!Array.isArray(docs)||docs.length>LIMITS.documents||a.lessons.length>LIMITS.lessons||a.tasks.length>LIMITS.tasks)throw Error('Invalid number of knowledge, lessons or tasks.');
    const ids=new Set();const noDup=id=>{if(ids.has(id))throw Error('Duplicate record identity in employee.');ids.add(id);return id;};
    const documents=docs.map(d=>{
      if(!plainObject(d)||typeof d.text!=='string'||d.text.length>LIMITS.documentText)throw Error('Invalid knowledge document.');
      const title=clean(d.title,LIMITS.name),text=clean(d.text,LIMITS.documentText);
      if(title.length<2||text.length<20)throw Error('Invalid knowledge content.');
      docCount+=text.length;
      return {id:noDup(validId(d.id)),title,text,source:d.source==='starter'?'starter':'user-upload',createdAt:validDate(d.createdAt)};
    });
    const lessons=a.lessons.map(l=>{
      if(!plainObject(l))throw Error('Invalid teaching entry.');const title=clean(l.title,LIMITS.name),content=clean(l.content,LIMITS.lesson);
      if(title.length<2||content.length<10)throw Error('Invalid lesson.');
      return {id:noDup(validId(l.id)),title,content,source:'owner-supplied',verified:false,createdAt:validDate(l.createdAt)};
    });
    const tasks=a.tasks.map(t=>{
      if(!plainObject(t))throw Error('Invalid work record.');const instruction=clean(t.instruction,LIMITS.task);
      if(instruction.length<5)throw Error('Invalid task instruction.');
      const review=plainObject(t.review)&&Number.isInteger(t.review.rating)&&t.review.rating>=1&&t.review.rating<=5?{
        rating:t.review.rating,note:clean(t.review.note,LIMITS.feedback),at:validDate(t.review.at),label:'owner assessment—not an independent verification'}:null;
      return {id:noDup(validId(t.id)),instruction,output:clean(t.output,LIMITS.output),mode:['ai','offline','external'].includes(t.mode)?t.mode:'offline',status:t.status==='completed'?'completed':'failed',createdAt:validDate(t.createdAt),sources:Array.isArray(t.sources)?t.sources.slice(0,6).map(s=>clean(s,LIMITS.name)):[],review};
    });
    return {id,name,role,instructions:clean(a.instructions,LIMITS.brief),createdAt:validDate(a.createdAt),updatedAt:validDate(a.updatedAt),lessons,documents,tasks};
  });
  if(docCount>LIMITS.totalDocumentText)throw Error('The backup contains too much knowledge text. Split your employees into separate backups.');
  return {format:FORMAT,version:VERSION,selectedId:unique.has(raw.selectedId)?raw.selectedId:(agents[0]?.id||null),agents};
}
export function decodeBackup(text){
  if(typeof text!=='string'||text.length>LIMITS.backup)throw Error('Backup exceeds the six-million-character limit.');
  try{return validateImport(JSON.parse(text));}
  catch(e){if(e instanceof SyntaxError)throw Error('Backup file is not valid JSON.');throw e;}
}
export function makeBackup(state){const result=JSON.stringify(validateImport(state),null,2);if(result.length>LIMITS.backup)throw Error('Backup too large. Delete or split large documents.');return result;}