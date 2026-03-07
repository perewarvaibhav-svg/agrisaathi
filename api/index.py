import os
import sys

# Add ml-backend to path
current_dir = os.path.dirname(__file__)
backend_path = os.path.abspath(os.path.join(current_dir, '..', 'ml-backend'))
sys.path.append(backend_path)

# Change to backend directory so .env and model.joblib are found correctly
os.chdir(backend_path)

# Import the main FastAPI app from ml-backend/main.py
from main import app

# This 'app' will be used by Vercel for the /api routes
