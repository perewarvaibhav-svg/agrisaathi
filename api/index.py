import os
import sys
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

# Add ml-backend to path
current_dir = os.path.dirname(__file__)
backend_path = os.path.abspath(os.path.join(current_dir, '..', 'ml-backend'))
sys.path.append(backend_path)

app = FastAPI()

@app.get("/api/smoke-test")
def smoke_test():
    return {"status": "routing_works", "message": "The Python entry point is reachable!"}

# Try to import main app
try:
    os.chdir(backend_path)
    from main import app as main_app
    app = main_app
    
    # Auto-alias /api routes to / (Crucial for Vercel)
    existing_routes = [r.path for r in app.routes if hasattr(r, 'path')]
    for route in list(app.routes):
        if hasattr(route, 'path') and route.path.startswith("/api/"):
            short_path = route.path.replace("/api", "", 1)
            if short_path not in existing_routes:
                app.add_api_route(short_path, route.endpoint, methods=route.methods)
                print(f"DEBUG: Bound alias {route.path} -> {short_path}")
except Exception as e:
    import_error = str(e)
    app = FastAPI()

@app.get("/api/health")
@app.get("/health")
def health_check():
    if import_error:
        return {"status": "error", "message": f"Import failed: {import_error}"}
    return {"status": "ok", "message": "Backend is running and aliased"}

@app.get("/api/py-health")
@app.get("/py-health")
def py_health_check():
    return {
        "status": "online",
        "working_dir": os.getcwd(),
        "import_error": import_error,
        "python_version": sys.version,
        "routes": [r.path for r in app.routes if hasattr(r, 'path')]
    }

@app.middleware("http")
async def routing_middleware(request: Request, call_next):
    print(f"DEBUG: {request.method} {request.url.path}")
    response = await call_next(request)
    return response
