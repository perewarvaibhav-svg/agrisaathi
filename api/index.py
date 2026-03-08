import os
import sys
from fastapi import FastAPI, Request

# Add ml-backend to path
current_dir = os.path.dirname(__file__)
backend_path = os.path.abspath(os.path.join(current_dir, '..', 'ml-backend'))
sys.path.append(backend_path)

app = None
import_error = None

# Try to import main app
try:
    os.chdir(backend_path)
    from main import app as main_app
    app = main_app
except Exception as e:
    import_error = str(e)
    app = FastAPI()

@app.get("/api/health")
def health():
    if import_error:
        return {"status": "error", "message": f"Import failed: {import_error}"}
    return {"status": "ok", "message": "Backend is running"}

@app.get("/api/py-health")
def py_health(request: Request):
    routes = [{"path": r.path, "methods": r.methods} for r in app.routes]
    return {
        "status": "online",
        "working_dir": os.getcwd(),
        "backend_path": backend_path,
        "request_path": request.url.path,
        "import_error": import_error,
        "defined_routes": routes
    }

@app.middleware("http")
async def log_request(request: Request, call_next):
    print(f"DEBUG: Request to {request.method} {request.url.path}")
    response = await call_next(request)
    return response
