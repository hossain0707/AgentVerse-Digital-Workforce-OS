"""Optional local AgentVerse MCP bridge for compatible stdio clients.

Use your *own* bearer token, never a demo admin token, and expose only authorized context.
To install: pip install mcp httpx
AGENTVERSE_API_URL=http://127.0.0.1:8000 AGENTVERSE_TOKEN=<token> python integrations/mcp_server.py
"""
import os
import httpx
from mcp.server.fastmcp import FastMCP

BASE=os.getenv('AGENTVERSE_API_URL','http://127.0.0.1:8000').rstrip('/')
TOKEN=os.getenv('AGENTVERSE_TOKEN','')
server=FastMCP('AgentVerse Digital Employee')

def api(path,method='GET',payload=None):
    if not TOKEN: return {'error':'Set AGENTVERSE_TOKEN to a valid user bearer token'}
    try:
        with httpx.Client(timeout=90) as client:
            r=client.request(method,BASE+'/api'+path,headers={'Authorization':'Bearer '+TOKEN},json=payload)
            r.raise_for_status()
            return r.json()
    except httpx.HTTPStatusError as exc:
        return {'error':f'HTTP {exc.response.status_code}: {exc.response.text[:700]}'}
    except Exception as exc:
        return {'error':str(exc)}

@server.tool()
def list_my_digital_employees() -> list | dict:
    """List digital employees currently owned or contracted to this authorized user."""
    return api('/agents?view=mine')

@server.tool()
def read_employee_career_passport(employee_id: str) -> dict:
    """Read verified general skills and anonymized career achievements. No previous employer secrets."""
    return api('/agents/'+employee_id+'/passport')

@server.tool()
def get_employee_work_context(employee_id: str) -> dict:
    """Get career skills plus ONLY the currently authorized employer's private notes."""
    return api('/agents/'+employee_id+'/context')

@server.tool()
def assign_employee_task(employee_id: str,instruction: str) -> dict:
    """Create a persistent task in this account's permitted workbench."""
    return api('/agents/'+employee_id+'/tasks','POST',{'instruction':instruction})

@server.tool()
def submit_employee_learning(employee_id: str,course: str,evidence: str) -> dict:
    """Submit learning evidence for administrative review. Never automatically grants credentials."""
    return api('/agents/'+employee_id+'/train','POST',{'course':course,'evidence':evidence})

if __name__=='__main__':server.run(transport='stdio')
