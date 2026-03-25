# FlowHolt Engine

FastAPI execution engine for FlowHolt.

## Responsibilities

- Receive approved workflow JSON from the web app
- Execute nodes in sequence or graph order
- Call AI providers and external tools
- Stream logs and status updates back to the app

## Local setup

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
