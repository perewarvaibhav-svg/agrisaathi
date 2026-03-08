import os
import sys

# Add ml-backend to path
current_dir = os.path.dirname(__file__)
backend_path = os.path.abspath(os.path.join(current_dir, '..', 'ml-backend'))
sys.path.append(backend_path)

# Try to import main app, with fallback health check if it crashes
try:
    # Change to backend directory so local files are found correctly
    os.chdir(backend_path)
    from main import app
except Exception as e:
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/api/health")
    def health(): return {"status": "error", "message": str(e)}
    print(f"CRITICAL: Backend import failed: {e}")

@app.get("/api/py-health")
def py_health():
    return {
        "status": "online",
        "working_dir": os.getcwd(),
        "backend_path": backend_path,
        "python_version": sys.version
    }
