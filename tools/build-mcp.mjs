import fs from 'node:fs';
const core=fs.readFileSync(new URL('../public/engine-core.mjs',import.meta.url),'utf8').replace(/^export /gm,'');
const runtime=fs.readFileSync(new URL('./agentverse-mcp-runtime.mjs',import.meta.url),'utf8');
const shebang='#!/usr/bin/env node\n';
const out=shebang+'/* Downloaded AgentVerse local MCP bridge; © 2026 Md Najmul Hossain. No network. */\n'+core+'\n'+runtime;
fs.writeFileSync(new URL('../public/downloads/agentverse-mcp.mjs',import.meta.url),out);
console.log(`Bundled local stdio MCP: ${out.length} bytes`);