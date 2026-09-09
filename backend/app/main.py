import os
from typing import List

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import brainrot


load_dotenv()

app = FastAPI(
    title="Brainrot Study API",
    description="Generate a concise study script and optional local voiceover.",
    version="1.0.0",
)

# `origin` is retained for compatibility with the existing .env file.
origins_env = os.getenv(
    "FRONTEND_ORIGINS",
    os.getenv("origin", "http://localhost:5173,http://127.0.0.1:5173"),
)
origins: List[str] = [origin.strip() for origin in origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(brainrot.router)
