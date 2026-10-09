import { FORMAT, LIMITS, createAgent, initialState, validateImport, decodeBackup, makeBackup, teach, addTask, offlineWork, buildAIMessages } from './engine-core.mjs';
const KEY = 'agentverse-free-workspace-v1';
const $ = id => document.getElementById(id);
let state, chosenTab = 'work', busy = false, aiOnline = false, lastOutput = '';
const now = () => new Date().toISOString();
const fmtDate = d => { try { return new Date(d).toLocaleString(); } catch { return 'Unknown'; } };
const mk = (type, className = '', content = null) => { const e = document.createElement(type); if (className) e.className = className; if (content !== null) e.textContent = String(content); return e; };
function message(text, bad = false) { const el = $('toast'); el.textContent = text; el.classList.toggle('error', bad); el.hidden = false; clearTimeout(message.timer); message.timer = setTimeout(() => {el.hidden = true;}, 5200); }
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch (err) { message('Browser storage is full or unavailable. Export a backup now; changes may not persist.', true); return false; }
}
function load() {
  const stored = localStorage.getItem(KEY);
  if (stored) { try { return decodeBackup(stored); } catch { message('Saved data could not be restored. Use Import to restore a valid backup.', true); } }
  return initialState();
}
function agent() {return state.agents.find(a => a.id === state.selectedId) || null;}
function selectAgent(id) {state.selectedId = id; lastOutput = ''; persist(); render();}
function showTab(t) {chosenTab = t; document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === t)));document.querySelectorAll('.section').forEach(p => p.classList.toggle('active',p.id === 'panel-' + t));}
function renderAgentList() {
  const box = $('agentList'); box.replaceChildren(); $('agentCount').textContent = `${state.agents.length} / ${LIMITS.agents}`;
  if (!state.agents.length) box.append(mk('p','empty','No employees yet. Create your first digital employee.'));
  for(const a of state.agents){ const button = mk('button','agent-option');button.type='button';button.setAttribute('aria-current',String(a.id === state.selectedId));const avatar=mk('span','initials',a.name[0]?.toUpperCase()||'?');const detail=mk('span');detail.append(mk('b','',a.name),mk('small','',a.role));button.append(avatar,detail);button.addEventListener('click',()=>selectAgent(a.id));box.append(button); }
}
function renderLessons(a){const box = $('lessonList');box.replaceChildren(); if(!a || !a.lessons.length){box.append(mk('p','empty','This employee has no saved teachings yet.'));return;}
  for(const l of a.lessons){const card=mk('article','lesson');card.append(mk('h3','',l.title),mk('p','',l.content),mk('small','',`Owner-supplied · Not independently verified · ${fmtDate(l.createdAt)}`));const actions=mk('div','actions');const remove=mk('button','btn small danger','Delete lesson');remove.type='button';remove.addEventListener('click',()=>{if(!confirm('Delete this lesson?'))return; a.lessons=a.lessons.filter(x=>x.id!==l.id);a.updatedAt=now();persist();render();message('Lesson deleted.');});actions.append(remove);card.append(actions);box.append(card); }
}
function renderTasks(a){const box=$('taskList');box.replaceChildren(); if(!a || !a.tasks.length){box.append(mk('p','empty','No work assigned yet. Your completed tasks will appear here.'));return;}
  for(const t of a.tasks){const card=mk('article','task-card');card.append(mk('h3','',t.instruction.slice(0,180)),mk('small','',`${t.mode === 'ai'?'Real AI':'Offline tool'} · ${t.status} · ${fmtDate(t.createdAt)}`));const output=mk('p','output',t.output||'No output.');card.append(output);box.append(card); }
}
function render(){
  renderAgentList();const a=agent(); const disabled = !a;
  $('selectedAvatar').textContent = a?.name[0]?.toUpperCase() || '?';$('selectedName').textContent=a?.name||'No employee selected';$('selectedRole').textContent=a?.role||'Create an employee to begin';$('selectedBadge').textContent=a?'Local identity':'No identity';
  $('countLessons').textContent=a?.lessons.length||0;$('countTasks').textContent=a?.tasks.length||0;$('countAICalls').textContent=a?.tasks.filter(t=>t.mode==='ai'&&t.status==='completed').length||0;
  $('editName').value=a?.name||'';$('editRole').value=a?.role||'';$('editInstructions').value=a?.instructions||'';
  for(const id of ['runBtn','deleteAgent']) $(id).disabled=disabled||busy;
  document.querySelectorAll('#editForm input,#editForm textarea,#editForm button[type=submit],#teachForm input,#teachForm textarea,#teachForm button[type=submit]').forEach(el=>el.disabled=disabled);
  renderLessons(a);renderTasks(a);showTab(chosenTab);
}
async function status(){
  try {const res=await fetch('/api/engine/status',{cache:'no-store'});if(!res.ok)throw Error('unavailable');const body=await res.json();aiOnline=Boolean(body.ai);
  }catch{aiOnline=false;}
  $('modeStatus').textContent=aiOnline?'Real AI available · free shared quota':'Offline tools available · cloud AI currently unavailable';
  if(!aiOnline){$('workMode').value='offline';}syncMode();
}
function syncMode(){const isOffline=$('workMode').value==='offline';$('methodWrap').hidden=!isOffline;$('runBtn').textContent=isOffline?'Run offline tool':'Run real AI task';}
async function runAssignment(e){e.preventDefault();if(busy)return; const a=agent();if(!a){message('Create an employee first.',true);return;}
  const instruction=$('assignment').value.trim();if(instruction.length<5){message('Write a longer assignment.',true);return;}
  const mode=$('workMode').value;busy=true;$('runBtn').disabled=true;$('runBtn').textContent='Working…';$('workResult').textContent='Executing your assignment…';
  try {
    let output;
    if(mode==='offline')output=offlineWork(a,instruction,$('offlineMethod').value);
    else{
      const payload=buildAIMessages(a,instruction);
      const ctrl=new AbortController(), timeout=setTimeout(()=>ctrl.abort(),30000);
      try {
        const resp=await fetch('/api/engine/run',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:ctrl.signal});
        const body=await resp.json().catch(()=>({error:`HTTP ${resp.status}`}));
        if(!resp.ok)throw new Error(body.error || `AI service unavailable (${resp.status})`);
        if(typeof body.output!=='string'||!body.output.trim())throw Error('AI model returned an empty answer.');
        output=body.output.slice(0,LIMITS.output);
      } finally{clearTimeout(timeout);}
    }
    addTask(a,{instruction,mode,output,status:'completed'});lastOutput=output;
    $('workResult').textContent=output;persist();message(mode==='ai'?'Real AI response saved locally.':'Offline tool result saved locally.');
  }catch(err){ const note=(err?.name==='AbortError'?'AI request timed out. Try again or switch to offline mode.':String(err?.message||err)).slice(0,350);$('workResult').textContent='Could not complete: '+note;
    addTask(a,{instruction,mode,output:note,status:'failed'});persist();message(note,true);
  }finally{busy=false;render();syncMode();}
}
function saveTeaching(e){e.preventDefault();const a=agent();if(!a)return;try{teach(a,{title:$('lessonTitle').value,content:$('lessonContent').value});$('teachForm').reset();persist();render();message('Teaching saved. It will guide future AI requests.');}catch(err){message(err.message,true);}}
function saveProfile(e){e.preventDefault();const a=agent();if(!a)return;const name=$('editName').value.trim(),role=$('editRole').value.trim();if(name.length<2||role.length<2){message('Name and role must contain at least two characters.',true);return;}a.name=name.slice(0,LIMITS.name);a.role=role.slice(0,LIMITS.role);a.instructions=$('editInstructions').value.trim().slice(0,LIMITS.brief);a.updatedAt=now();persist();render();message('Employee profile updated.');}
function download(){try{const payload=makeBackup(state);const blob=new Blob([payload],{type:'application/json'});const href=URL.createObjectURL(blob),link=document.createElement('a');link.href=href;link.download='AgentVerse-employee-backup-'+new Date().toISOString().slice(0,10)+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(href),1500);message('Portable backup exported. Store this file safely.');}catch(err){message(err.message,true);}}
async function importData(){const f=$('importFile').files?.[0];if(!f)return;if(f.size>LIMITS.backup){message('File exceeds the 1.8 MB backup limit.',true);$('importFile').value='';return;}
  try{const next=decodeBackup(await f.text());if(!confirm(`Replace the current ${state.agents.length} local employees with ${next.agents.length} imported employees? Export your current backup first.`))return;state=next;persist();render();message('Portable employee backup imported successfully.');}
  catch(err){message(err.message,true);}finally{$('importFile').value='';}}
function init(){state=load();if(state.agents.length && !agent())state.selectedId=state.agents[0].id;render();persist();status();
  document.querySelectorAll('[data-tab]').forEach(t=>t.addEventListener('click',()=>showTab(t.dataset.tab)));
  $('workMode').addEventListener('change',syncMode);$('workForm').addEventListener('submit',runAssignment);$('teachForm').addEventListener('submit',saveTeaching);$('editForm').addEventListener('submit',saveProfile);
  $('newAgent').addEventListener('click',()=>{if(state.agents.length>=LIMITS.agents){message('Maximum number of employees reached.',true);return;}$('createAgentForm').reset();$('newAgentDialog').showModal();$('newName').focus();});
  $('closeCreate').addEventListener('click',()=>$('newAgentDialog').close());
  $('createAgentForm').addEventListener('submit',e=>{e.preventDefault();try{const a=createAgent({name:$('newName').value,role:$('newRole').value});state.agents.unshift(a);state.selectedId=a.id;chosenTab='profile';persist();render();$('newAgentDialog').close();message('Your new digital employee is ready. Edit its instructions, then teach or assign work.');}catch(err){message(err.message,true);}});
  $('deleteAgent').addEventListener('click',()=>{const a=agent();if(!a||!confirm(`Permanently delete ${a.name} and its locally stored lessons and work history? Export a backup first.`))return;state.agents=state.agents.filter(x=>x.id!==a.id);state.selectedId=state.agents[0]?.id||null;lastOutput='';persist();render();message('Employee removed from this browser.');});
  $('export').addEventListener('click',download);$('import').addEventListener('click',()=>$('importFile').click());$('importFile').addEventListener('change',importData);
  $('copyOutput').addEventListener('click',async()=>{if(!lastOutput){message('No output to copy yet.',true);return;}try{await navigator.clipboard.writeText(lastOutput);message('Copied to clipboard.');}catch{message('Clipboard unavailable. Select and copy the result text instead.',true);}});
}
init();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('/service-worker.js').catch(() => {});