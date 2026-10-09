import test from 'node:test';import assert from 'node:assert/strict';
import {FORMAT,VERSION,LIMITS,PRESETS,createAgent,createFromPreset,initialState,addDocument,teach,addTask,reviewTask,offlineWork,retrieveKnowledge,buildAIMessages,validateImport,decodeBackup,makeBackup} from '../public/engine-core.mjs';

test('ready-to-use professional employee templates have starter knowledge',()=>{
  assert.equal(PRESETS.length,6);const s=initialState();assert.equal(s.agents.length,2);assert.ok(s.agents.every(a=>a.documents.length===1));
  assert.match(s.agents[0].documents[0].text,/Research workflow/);assert.notEqual(s.agents[0].id,s.agents[1].id);
});
test('custom employees have independent knowledge, lessons and work records',()=>{
  const a=createAgent({name:'Helix',role:'Data analyst'}),b=createAgent({name:'Vega',role:'Software engineer'});
  addDocument(a,{title:'Battery SOP',text:'Inspect the battery terminals and note thermal events daily.'});
  teach(a,{title:'Inspection',content:'Highlight safety risks clearly.'});
  addTask(a,{instruction:'Draft an inspection checklist.',mode:'offline',output:'Checklist',status:'completed'});
  assert.equal(b.documents.length,0);assert.equal(b.lessons.length,0);assert.equal(b.tasks.length,0);
  assert.equal(a.lessons[0].verified,false);
});
test('local retrieval matches owner documents and cites source labels',()=>{
  const a=createAgent({name:'Delta',role:'Battery safety analyst'});
  addDocument(a,{title:'Site access notes',text:'The cafeteria is in the west building. Lunch is served at 12:00.'});
  addDocument(a,{title:'Battery safety procedure',text:'Inspect terminals for corrosion before measuring cell voltage. Report overheating to the safety manager.'});
  const hits=retrieveKnowledge(a,'How should I inspect battery terminals for corrosion?');
  assert.ok(hits.length>0);assert.equal(hits[0].title,'Battery safety procedure');assert.equal(hits[0].label,'[Source 1]');
  const payload=buildAIMessages(a,'How should I inspect battery terminals for corrosion?');
  assert.match(payload.knowledge,/\[Source 1\] Battery safety procedure/);
  assert.equal(payload.sources[0],'Battery safety procedure');
});
test('retrieval never claims unrelated documents are matching knowledge',()=>{
  const a=createAgent({name:'Lumi',role:'Customer assistant'});addDocument(a,{title:'Lunch menu',text:'The soup is served with fresh onions and rice every afternoon.'});
  const res=retrieveKnowledge(a,'Explain rocket propulsion systems');assert.equal(res.length,0);
});
test('offline knowledge search extracts source text and never claims AI work',()=>{
  const a=createFromPreset('software');const result=offlineWork(a,'Tell me the process for implementation and testing','knowledge');
  assert.match(result,/NOT generative AI/);assert.match(result,/Software delivery checklist/);
  for(const method of ['plan','summary','checklist'])assert.match(offlineWork(a,'Review two possible strategies.',method),/NOT generative AI/);
});
test('review records owner feedback but not verified credentials',()=>{
  const a=createAgent({name:'Mira',role:'Educator'});const t=addTask(a,{instruction:'Draft a learning plan.',mode:'external',output:'A plan.',status:'completed'});
  reviewTask(a,t.id,{rating:4,note:'Needs stronger example.'});assert.equal(t.review.rating,4);assert.match(t.review.label,/not an independent verification/);assert.match(buildAIMessages(a,'Prepare a learning plan again').lessons,/Needs stronger example/);
  assert.throws(()=>reviewTask(a,t.id,{rating:6}));
});
test('version 1 v0.3 backups migrate without losing lessons and history',()=>{
  const a=createAgent({name:'Older',role:'Analyst'});teach(a,{title:'Safety',content:'Check every quoted number.'});
  addTask(a,{instruction:'Write a brief outline.',mode:'ai',output:'Outline',status:'completed'});
  const old={format:FORMAT,version:1,selectedId:a.id,agents:[{...a,documents:undefined}]};
  const migrated=validateImport(old);assert.equal(migrated.version,VERSION);assert.equal(migrated.agents[0].lessons.length,1);assert.equal(migrated.agents[0].tasks.length,1);assert.deepEqual(migrated.agents[0].documents,[]);
});
test('v0.4 backup round trip contains knowledge, reviews and worker source attribution',()=>{
  const s=initialState();const a=s.agents[0];teach(a,{title:'Quality',content:'Use source citation markers for evidence.'});
  const t=addTask(a,{instruction:'Explain research quality rules.',mode:'ai',output:'Cite sources.',status:'completed',sources:[a.documents[0].title]});reviewTask(a,t.id,{rating:5,note:'Clear.'});
  const restored=decodeBackup(makeBackup(s));assert.equal(restored.agents[0].documents[0].title,a.documents[0].title);assert.equal(restored.agents[0].tasks[0].review.rating,5);assert.equal(restored.agents[0].tasks[0].sources[0],a.documents[0].title);
});
test('malformed and oversized backup rejected without prototype pollution',()=>{
  assert.throws(()=>decodeBackup('{not json}'));assert.throws(()=>decodeBackup('x'.repeat(LIMITS.backup+1)));
  const s=initialState();s.agents.push({...s.agents[0]});assert.throws(()=>validateImport(s),/Duplicate/);
  const bad=initialState();bad.agents[0].documents[0].text='x'.repeat(LIMITS.documentText+1);assert.throws(()=>validateImport(bad));
  const unsafe=JSON.parse('{"format":"agentverse-workspace-v1","version":2,"selectedId":"x","agents":[{"id":"a1","name":"Agent","role":"Researcher","instructions":"hi","lessons":[],"documents":[],"tasks":[],"__proto__":{"admin":true}}]}');
  const normalized=validateImport(unsafe);assert.equal(Object.prototype.hasOwnProperty.call(normalized.agents[0],'__proto__'),false);
});
test('inference context stays bounded and contains no secret network calls',()=>{
  const a=createFromPreset('research');for(let i=0;i<12;i++)teach(a,{title:'Lesson '+i,content:'Careful source review every time '.repeat(30)});
  const req=buildAIMessages(a,'Draft a careful research checklist');assert.ok(req.lessons.length<=2200);assert.ok(req.knowledge.length<=LIMITS.context);
  assert.throws(()=>buildAIMessages(a,'no'));assert.throws(()=>addDocument(a,{title:'Huge',text:'z'.repeat(LIMITS.documentText+1)}));
});