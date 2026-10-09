import test from 'node:test';import assert from 'node:assert/strict';import worker from '../worker/index.mjs';
const origin='https://agentverse.test';const url=origin+'/api/engine/run';
const payload={role:'Battery safety analyst',instructions:'Cite evidence',lessons:'Keep clear reports',knowledge:'[Source 1] Battery procedure\nInspect terminals for corrosion.',task:'Explain the corrosion inspection checklist.'};
let calls=0;
const env={AI:{run:async(_name,p)=>{calls++;assert.match(p.messages[1].content,/\[Source 1\]/);return {response:'Inspect terminals [Source 1].'};}},PER_IP:{limit:async()=>({success:true})},GLOBAL_AI:{limit:async()=>({success:true})}};
const req=(data=payload,or=origin,method='POST')=>new Request(url,{method,headers:{Origin:or,'Content-Type':'application/json'},body:method==='POST'?JSON.stringify(data):undefined});
test('status advertises configured model, not paid capacity',async()=>{const r=await worker.fetch(new Request(origin+'/api/engine/status'),env);assert.equal(r.status,200);const j=await r.json();assert.equal(j.version,'0.4');assert.equal(j.ai,true);assert.match(j.billing,/no payments/);});
test('a valid task calls a model and passes user source excerpts',async()=>{const n=calls,r=await worker.fetch(req(),env);assert.equal(r.status,200);const j=await r.json();assert.match(j.output,/Source 1/);assert.equal(j.mode,'real-ai');assert.equal(calls,n+1);});
test('cross-site requests, invalid content type and unknown routes are rejected',async()=>{
  assert.equal((await worker.fetch(req(payload,'https://evil.test'),env)).status,403);
  assert.equal((await worker.fetch(new Request(url,{method:'POST',headers:{Origin:origin,'Content-Type':'text/plain'},body:'{}'}),env)).status,415);
  assert.equal((await worker.fetch(new Request(url,{method:'GET'}),env)).status,405);
  assert.equal((await worker.fetch(new Request(origin+'/api/anything'),env)).status,404);
});
test('invalid and oversized documents fail before calling model',async()=>{
  assert.equal((await worker.fetch(req({...payload,task:'few'}),env)).status,422);
  assert.equal((await worker.fetch(req({...payload,knowledge:'x'.repeat(3901)}),env)).status,422);
  assert.equal((await worker.fetch(req({...payload,task:'X'.repeat(15000)}),env)).status,413);
});
test('fail closed on absent or denied per-IP or global rate limiter',async()=>{
  assert.equal((await worker.fetch(req(),{...env,PER_IP:null})).status,503);
  assert.equal((await worker.fetch(req(),{...env,GLOBAL_AI:{limit:async()=>({success:false})}})).status,429);
});
test('provider failure does not leak provider details',async()=>{
  const r=await worker.fetch(req(),{...env,AI:{run:async()=>{throw Error('PRIVATE_API_KEY_PLEASE_DO_NOT_LEAK');}}});assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/PRIVATE_API_KEY/);
});