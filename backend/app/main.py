# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.simulate import router

# -----------------------------------------
# CREATE THE FASTAPI APPLICATION
# -----------------------------------------
app = FastAPI(
    title="SolarOpti.ai API",
    description="AI-powered solar PV sizing engine using RE numerical methods",
    version="1.0.0"
)

# -----------------------------------------
# CORS MIDDLEWARE
# This allows your React frontend to talk to this backend
# Without this, the browser will block all requests
# -----------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # In production, restrict to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------
# REGISTER THE SIMULATION ROUTE
# -----------------------------------------
app.include_router(router)

# -----------------------------------------
# HEALTH CHECK
# -----------------------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "running",
        "service": "SolarOpti.ai Backend",
        "version": "1.0.0"
    }