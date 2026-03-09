import sys
import os

# Add ml-backend to system path so imports inside ml-backend/ work correctly when run from root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "ml-backend")))

from main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
