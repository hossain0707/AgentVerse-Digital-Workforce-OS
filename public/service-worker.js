/* AgentVerse public beta offline shell. Never cache API / inference requests or user data. */
const CACHE='agentverse-workspace-shell-v0.4.0';
const SHELL=['/workspace.html','/engine.css','/engine-app.mjs','/engine-core.mjs','/agentverse-icon.svg','/workspace.webmanifest'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('agentverse-workspace-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin || !SHELL.includes(url.pathname))return;
  event.respondWith(fetch(req).then(resp=>{
    if(resp.ok){const clone=resp.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,clone)));}
    return resp;
  }).catch(async()=>await caches.match(req)||Response.error()));
});