/* AgentVerse local-first digital employee engine. Copyright (c) 2026 Md Najmul Hossain. */
export const FORMAT = 'agentverse-workspace-v1';
export const LIMITS = Object.freeze({ agents: 24, lessons: 80, tasks: 80, name: 70, role: 100, brief: 1400, lesson: 1200, task: 3000, output: 4500, backup: 1800000 });
const iso = () => new Date().toISOString();
const trim = (value, length) => String(value ?? '').trim().slice(0, length);
const uuid = () => globalThis.crypto?.randomUUID?.() || ('av-' + Date.now() + '-' + Math.random().toString(36).slice(2));
export function createAgent({ name, role, instructions = '' }) {
  const n = trim(name, LIMITS.name), r = trim(role, LIMITS.role);
  if (n.length < 2 || r.length < 2) throw new Error('Give this employee a name and a role (at least 2 characters each).');
  const t = iso();
  return { id: uuid(), name: n, role: r, instructions: trim(instructions, LIMITS.brief), createdAt: t, updatedAt: t, lessons: [], tasks: [] };
}
export function initialState() {
  const a = createAgent({ name: 'Astra Nova', role: 'Research assistant', instructions: 'Help develop grounded research plans. Flag uncertainty and ask for sources before making factual claims.' });
  const b = createAgent({ name: 'Atlas', role: 'Project analyst', instructions: 'Break project goals into clear deliverables, milestones and testable acceptance criteria.' });
  return { format: FORMAT, version: 1, selectedId: a.id, agents: [a, b] };
}
export function teach(agent, { title, content }) {
  if (agent.lessons.length >= LIMITS.lessons) throw new Error('Lesson limit reached; export a backup before removing older lessons.');
  const t = trim(title, LIMITS.name), c = trim(content, LIMITS.lesson);
  if (t.length < 2 || c.length < 10) throw new Error('Provide a lesson title and at least 10 characters of teaching content.');
  const lesson = { id: uuid(), title: t, content: c, createdAt: iso(), source: 'owner-supplied', verified: false };
  agent.lessons.unshift(lesson); agent.updatedAt = iso(); return lesson;
}
export function addTask(agent, { instruction, mode, output, status }) {
  if (!['ai', 'offline'].includes(mode)) throw new Error('Invalid work mode.');
  const i = trim(instruction, LIMITS.task), o = trim(output, LIMITS.output);
  if (i.length < 5) throw new Error('Task must be at least 5 characters.');
  if (!['completed', 'failed'].includes(status)) throw new Error('Invalid task status.');
  const task = { id: uuid(), instruction: i, output: o, mode, status, createdAt: iso() };
  agent.tasks.unshift(task); agent.tasks = agent.tasks.slice(0, LIMITS.tasks); agent.updatedAt = iso(); return task;
}
export function offlineWork(agent, instruction, method = 'plan') {
  const task = trim(instruction, LIMITS.task);
  if (task.length < 5) throw new Error('Please describe the assignment in at least five characters.');
  const segments = task.replace(/\s+/g, ' ').match(/[^.!?\n]+[.!?]?/g)?.map(x => x.trim()).filter(Boolean) || [];
  const sentences = segments.slice(0, 8);
  const education = agent.lessons.slice(0, 3).map(x => x.title);
  const preface = `Agent: ${agent.name} | Role: ${agent.role}\nExecution: Offline structured tool (NOT generative AI)\nAssignment: ${task}\n`;
  if (method === 'summary') {
    return preface + '\nExtractive summary of the supplied text:\n' + (sentences.slice(0, 3).join(' ') || task) +
      '\n\nReview: This only extracts from the input. It cannot independently verify factual accuracy.';
  }
  if (method === 'checklist') {
    const lines = sentences.length ? sentences : [task];
    return preface + '\nEditable checklist:\n' + lines.slice(0, 6).map(x => `☐ ${x}`).join('\n') +
      '\n☐ Review correctness and permissions\n☐ Approve final deliverable' +
      (education.length ? `\n\nRelevant saved teaching topics: ${education.join(', ')}` : '');
  }
  return preface + '\nDraft work plan:\n1. Clarify desired outcome and available inputs.\n2. Identify constraints, confidentiality and decision authority.\n3. Break the assignment into verifiable sub-tasks.\n4. Draft a first deliverable.\n5. Review evidence, risk and quality before use.\n6. Record feedback and improve the next attempt.' +
    (education.length ? `\n\nTopics taught to this employee: ${education.join(', ')}` : '') +
    '\n\nReview: This is a deterministic planning template, not an AI model response.';
}
export function buildAIMessages(agent, assignment) {
  const t = trim(assignment, LIMITS.task);
  if (t.length < 5) throw new Error('Enter an assignment of at least five characters.');
  const lessons = agent.lessons.slice(0, 8).map(x => `${trim(x.title, 70)}: ${trim(x.content, 240)}`).join('\n').slice(0, 2400);
  return {
    role: trim(agent.role, LIMITS.role),
    instructions: trim(agent.instructions, LIMITS.brief),
    lessons,
    task: t
  };
}
function safeDate(date) { const d = new Date(date); return Number.isFinite(d.valueOf()) ? d.toISOString() : iso(); }
export function validateImport(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.format !== FORMAT || raw.version !== 1 || !Array.isArray(raw.agents)) throw new Error('Not a supported AgentVerse backup.');
  if (raw.agents.length > LIMITS.agents) throw new Error('Backup exceeds the allowed agent count.');
  const ids = new Set();
  const agents = raw.agents.map(a => {
    if (!a || typeof a !== 'object' || Array.isArray(a)) throw new Error('Invalid agent entry.');
    const name = trim(a.name, LIMITS.name), role = trim(a.role, LIMITS.role), id = trim(a.id, 90);
    if (!id || ids.has(id) || name.length < 2 || role.length < 2) throw new Error('Invalid or duplicate agent identity.');
    ids.add(id);
    if (!Array.isArray(a.lessons) || a.lessons.length > LIMITS.lessons || !Array.isArray(a.tasks) || a.tasks.length > LIMITS.tasks) throw new Error('Invalid lesson or task history.');
    const lessons = a.lessons.map(l => {
      if (!l || typeof l !== 'object' || trim(l.title, LIMITS.name).length < 2 || trim(l.content, LIMITS.lesson).length < 10) throw new Error('Invalid teaching entry.');
      return {id:trim(l.id,90) || uuid(),title:trim(l.title,LIMITS.name),content:trim(l.content,LIMITS.lesson),createdAt:safeDate(l.createdAt),source:'owner-supplied',verified:false};
    });
    const tasks = a.tasks.map(t => {
      if (!t || typeof t !== 'object' || trim(t.instruction,LIMITS.task).length < 5) throw new Error('Invalid work history entry.');
      return {id:trim(t.id,90) || uuid(), instruction:trim(t.instruction,LIMITS.task),output:trim(t.output,LIMITS.output),mode:t.mode==='ai'?'ai':'offline',status:t.status==='completed'?'completed':'failed',createdAt:safeDate(t.createdAt)};
    });
    return {id,name,role,instructions:trim(a.instructions,LIMITS.brief),createdAt:safeDate(a.createdAt),updatedAt:safeDate(a.updatedAt),lessons,tasks};
  });
  const selectedId = ids.has(raw.selectedId) ? raw.selectedId : (agents[0]?.id || null);
  return {format:FORMAT,version:1,selectedId,agents};
}
export function decodeBackup(text) {
  if (typeof text !== 'string' || text.length > LIMITS.backup) throw new Error('Backup is larger than 1.8 MB.');
  try { return validateImport(JSON.parse(text)); }
  catch (e) { if (e instanceof SyntaxError) throw new Error('Backup is not valid JSON.'); throw e; }
}
export function makeBackup(state) { return JSON.stringify(validateImport(state), null, 2); }