#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -d .venv ]; then python3 -m venv .venv; fi
source .venv/bin/activate
python -m pip install -r requirements.txt
export AGENTVERSE_DEMO=1
printf 'Open http://127.0.0.1:8000 in your browser\n'
exec python -m uvicorn agentverse.app:app --host 127.0.0.1 --port 8000