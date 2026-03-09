import sys
import os
import importlib.util

# Safely import ml-backend/main.py without triggering a circular import on 'main'
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "ml-backend"))
sys.path.insert(0, backend_path)

# Import the actual FastAPI app as backend_main to avoid conflicting with THIS main.py
import main as backend_main
app = backend_main.app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
