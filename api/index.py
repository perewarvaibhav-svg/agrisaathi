import os
import sys
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Add ml-backend to path
current_dir = os.path.dirname(__file__)
backend_path = os.path.abspath(os.path.join(current_dir, '..', 'ml-backend'))
sys.path.append(backend_path)

# Entry point for Vercel
app = FastAPI()

# Routing Fix: Add explicit health routes to the 'outer' app
@app.get("/api/health")
@app.get("/health")
def health():
    return {"status": "ok", "message": "Python Engine Online"}

# Try to import our full backend app
import_error = None
try:
    os.chdir(backend_path)
    from main import app as main_app
    # Mount the main app under the root so all sub-routes work
    # FastAPI's include_router or mounting the whole app works best here
    app.mount("/", main_app)
except Exception as e:
    import_error = str(e)
    print(f"IMPORT ERROR: {import_error}")

@app.get("/api/py-health")
@app.get("/py-health")
def py_health():
    return {
        "status": "online",
        "import_error": import_error,
        "python_version": sys.version,
        "current_dir": os.getcwd()
    }

@app.middleware("http")
async def routing_middleware(request: Request, call_next):
    print(f"DEBUG: {request.method} {request.url.path}")
    response = await call_next(request)
    return response
