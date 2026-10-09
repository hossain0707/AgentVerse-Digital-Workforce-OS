from playwright.sync_api import sync_playwright
from pathlib import Path
import json,re
base=Path(__file__).resolve().parents[1]/'public'
html=(base/'workspace.html').read_text()
html=re.sub(r'<meta http-equiv="Content-Security-Policy"[^>]*>','',html)
html=re.sub(r'<link rel="stylesheet" href="\./engine\.css">','<style>'+(base/'engine.css').read_text()+'</style>',html)
html=re.sub(r'<script defer type="module" src="\./engine-app\.mjs"></script>','',html)
core=re.sub(r'^export ', '',(base/'engine-core.mjs').read_text(), flags=re.MULTILINE)
app=re.sub(r"^import .*? from '\./engine-core.mjs';\s*",'',(base/'engine-app.mjs').read_text(),count=1)
bundle=core+'\n'+app
storage={}
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-dev-shm-usage'])
 context=browser.new_context(viewport={'width':1360,'height':940}, bypass_csp=True)
 page=context.new_page()
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.set_content(html,wait_until='load')
 page.evaluate('''()=>{
  const mem={}; window.__mem=mem;
  Object.defineProperty(window,'localStorage',{configurable:true,value:{getItem:k=>mem[k]??null,setItem:(k,v)=>{mem[k]=v},removeItem:k=>{delete mem[k]}}});
  Object.defineProperty(window,'indexedDB',{configurable:true,value:undefined});
  window.__requests=[];
  window.fetch=async(url,opts)=>{
    if(url.includes('status'))return new Response(JSON.stringify({ai:true,version:'0.4'}),{status:200,headers:{'Content-Type':'application/json'}});
    if(url.includes('run')){window.__requests.push(JSON.parse(opts.body));return new Response(JSON.stringify({output:'Inspect terminals for corrosion [Source 1].',mode:'real-ai'}),{status:200,headers:{'Content-Type':'application/json'}});}
    throw Error('Unexpected URL');
  }
}''')
 page.evaluate('(code)=>{(0,eval)(code)}',bundle)
 page.wait_for_timeout(600)
 print('page errors initial',errors)
 assert page.locator('#presetGrid button').count()==6,('presets',page.locator('#toast').inner_text())
 assert page.locator('#agentList button').count()==2
 assert page.locator('#countDocs').inner_text()=='1'
 page.locator('[data-tab=knowledge]').click()
 page.locator('#knowledgeTitle').fill('Battery terminals manual')
 page.locator('#knowledgeText').fill('Inspect battery terminals for visible corrosion and overheating. Report dangerous voltage readings to the engineer in charge.')
 page.get_by_role('button',name='Save knowledge').click()
 assert page.locator('#knowledgeList .document').count()==2
 page.locator('[data-tab=work]').click()
 page.locator('#assignment').fill('How do we inspect battery terminals for corrosion?')
 page.wait_for_timeout(250)
 assert 'Battery terminals manual' in page.locator('#sourcePreview').inner_text(),page.locator('#sourcePreview').inner_text()
 page.locator('#workMode').select_option('ai')
 page.get_by_role('button',name='Run Cloud AI').click()
 page.wait_for_timeout(400)
 assert 'Inspect terminals' in page.locator('#workResult').inner_text(),page.locator('#workResult').inner_text()
 assert '[Source 1]' in page.evaluate('window.__requests[0].knowledge')
 assert page.locator('#countTasks').inner_text()=='1'
 page.locator('[data-tab=teach]').click()
 page.locator('#lessonTitle').fill('Terminal inspection')
 page.locator('#lessonContent').fill('Always identify corrosion risks and consult qualified engineers.')
 page.get_by_role('button',name='Save lesson').click()
 assert page.locator('#countLessons').inner_text()=='1'
 page.locator('[data-tab=history]').click()
 page.locator('#taskList .task-review textarea').fill('Needs more detail about reporting.')
 page.locator('#taskList .task-review select').select_option('4')
 page.locator('#taskList .task-review button').click()
 assert 'Owner rating: 4/5' in page.locator('#taskList').inner_text()
 page.locator('[data-tab=connect]').click()
 page.get_by_role('button',name='Copy employee task for ChatGPT').click()
 page.wait_for_timeout(100)
 assert 'Battery terminals manual' in page.locator('#workResult').inner_text(), 'clipboard fallback empty'
 page.locator('#externalAnswer').fill('External ChatGPT text summarizing battery inspection procedure.')
 page.get_by_role('button',name='Save external response in history').click()
 assert page.locator('#countTasks').inner_text()=='2'
 page.screenshot(path='/tmp/agentverse-smoke-desktop.png',full_page=True)
 print('DOM E2E PASS: presets, knowledge, retrieval, mocked AI execution, teaching, review, ChatGPT prompt fallback, import external answer')
 print('Browser saved localStorage length',page.evaluate('JSON.stringify(window.__mem).length'))
 print('Page errors',errors)
 assert not errors,errors
 # test portable backed export after changes via core module validation
 backup=page.evaluate('window.__mem["agentverse-free-workspace-v1"]')
 assert backup and 'Battery terminals manual' in backup
 mobile=context.new_page();mobile.set_viewport_size({'width':390,'height':844});mobile.set_content(html)
 mobile.screenshot(path='/tmp/agentverse-smoke-mobile.png',full_page=True)
 assert mobile.evaluate('document.documentElement.scrollWidth <= window.innerWidth + 1'), 'Mobile horizontal overflow'
 print('Mobile responsive layout PASS')
 browser.close()