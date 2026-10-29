import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import * as core from '../public/engine-core.mjs';

const source=readFileSync(new URL('../public/engine-app.mjs',import.meta.url),'utf8')
  .replace(/^import .*? from '\.\/engine-core\.mjs';\s*/,'')
  .replace(/init\(\)\.catch\(e=>\{.*\}\);\s*$/,'');

function storageHarness({stored=null,writeFails=false}={}){
  const values=new Map(stored===null?[]:[['agentverse-free-workspace-v1',stored]]);
  const status={textContent:'',style:{}};
  const toast={textContent:'',classList:{toggle(){}},hidden:false};
  let writes=0;
  const localStorage={
    getItem:key=>values.get(key)??null,
    setItem:(key,value)=>{writes++;if(writeFails)throw Error('Quota exceeded');values.set(key,value);},
    removeItem:key=>values.delete(key)
  };
  const context={...core,localStorage,window:{},document:{getElementById:id=>id==='toast'?toast:status},
    setTimeout,clearTimeout,Date,JSON,Promise,Error,console};
  vm.createContext(context);
  vm.runInContext(source+'\nglobalThis.__storageTest={load,persist,setState:s=>{state=s;fallback=true;},getUnsaved:()=>unsaved};',context);
  return {api:context.__storageTest,status,values,get writes(){return writes;}};
}

test('corrupt existing local data is not silently replaced by starter employees',async()=>{
  const h=storageHarness({stored:'{broken JSON'});
  await assert.rejects(h.api.load(),/valid JSON/);
  assert.equal(h.writes,0);
  assert.equal(h.values.get('agentverse-free-workspace-v1'),'{broken JSON');
});

test('failed browser storage write stays visibly unsaved',async()=>{
  const h=storageHarness({writeFails:true});
  h.api.setState(core.initialState());
  assert.equal(await h.api.persist(),false);
  assert.equal(h.api.getUnsaved(),true);
  assert.match(h.status.textContent,/Unsaved changes/);
  assert.equal(h.writes,1);
});
