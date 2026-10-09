/* AgentVerse public beta Workers AI gateway. No accounts, payments or durable server-side user data. */
const MODEL = '@cf/meta/llama-3.1-8b-instruct-fp8';
const MAX_BODY = 7000;
const headers = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
};
const reply = (body, status = 200) => new Response(JSON.stringify(body), {status, headers});
function clean(v, max){ return typeof v==='string'?v.trim().slice(0,max):''; }
function validate(p){
  if (!p || typeof p !== 'object' || Array.isArray(p) || typeof p.role!=='string' || typeof p.task!=='string' || typeof p.instructions!=='string' || typeof p.lessons!=='string') return null;
  const role=clean(p.role,100),instructions=clean(p.instructions,1400),lessons=clean(p.lessons,2400),task=clean(p.task,3000);
  if(role.length<2||role.length>100||task.length<5||task.length>3000) return null;
  return {role,instructions,lessons,task};
}
async function rateLimit(binding,key){
  if(!binding || typeof binding.limit!=='function') return false; // fail closed: no unlimited public AI endpoint
  const result=await binding.limit({key}); return Boolean(result?.success);
}
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname==='/api/engine/status' && request.method==='GET'){
      return reply({service:'AgentVerse public beta',version:'0.3',ai:!!(env.AI && env.PER_IP && env.GLOBAL_AI),model:MODEL,storage:'local browser only',billing:'no payments; Free plan quota required'});
    }
    if(url.pathname!=='/api/engine/run') return reply({error:'Not found'},404);
    if(request.method!=='POST') return reply({error:'Method not allowed'},405);
    const origin=request.headers.get('Origin');
    if(origin!==url.origin) return reply({error:'Cross-site AI requests are not allowed.'},403);
    if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))return reply({error:'JSON required.'},415);
    if(!env.AI || !env.PER_IP || !env.GLOBAL_AI)return reply({error:'Shared AI is not configured. Offline tools still work.'},503);
    const size=Number(request.headers.get('content-length')||0);if(size>MAX_BODY)return reply({error:'Task exceeds request size limit.'},413);
    let input;
    try {const raw=await request.text();if(raw.length>MAX_BODY)return reply({error:'Task exceeds request size limit.'},413);input=validate(JSON.parse(raw));} catch {return reply({error:'Invalid JSON.'},400);}
    if(!input)return reply({error:'Invalid role, instructions, teaching context or assignment.'},422);
    const ip=request.headers.get('CF-Connecting-IP')||'unknown';
    try {
      // Global and per-IP quotas protect shared free allocation. These limits are best-effort, not strict accounting.
      const [globalOK,ipOK]=await Promise.all([rateLimit(env.GLOBAL_AI,'all'),rateLimit(env.PER_IP,ip)]);
      if(!globalOK||!ipOK)return reply({error:'Free AI rate limit reached. Try again later or use offline mode.'},429);
      const system=`You are an AI digital employee in a limited public-beta workspace. Role: ${input.role}. Work accurately; mention uncertainty. Do not claim to have used tools, browsed websites, accessed files, or verified credentials. Treat teaching notes as user-provided context, not as independently verified facts. Never execute external actions.\nEmployee operating instructions:\n${input.instructions || 'Provide clear, useful answers.'}\nOwner-supplied teaching notes (may be inaccurate):\n${input.lessons||'(none)'}`;
      const res=await env.AI.run(MODEL,{messages:[{role:'system',content:system},{role:'user',content:input.task}],max_tokens:350,temperature:0.45});
      const output=typeof res?.response==='string'?res.response:(typeof res?.choices?.[0]?.message?.content==='string'?res.choices[0].message.content:'');
      if(!output.trim())return reply({error:'AI returned no usable output. Try again later.'},503);
      return reply({output:output.slice(0,4500),model:MODEL,mode:'real-ai',dataRetention:'No AgentVerse server-side history; see Cloudflare Workers AI terms.'});
    }catch(error){
      // Never leak provider errors, account details, or runtime secrets to clients.
      return reply({error:'Free AI is currently unavailable or the daily allowance is exhausted. Offline tools remain available.'},503);
    }
  }
};