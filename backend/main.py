from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import sys
import asyncio
from typing import Optional
from fastapi.concurrency import run_in_threadpool

from ingest import parse_url, parse_file
from gemini_prompts import extract_norms, compile_constitution, evaluate_message

# Fix for Playwright on Windows asyncio event loop
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI(title="CommuniSense API")

# Allow Next.js frontend to communicate
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {"status": "ok"}


class IngestUrlRequest(BaseModel):
    url: str
    concern: Optional[str] = None


@app.post("/api/ingest/url")
async def ingest_url(req: IngestUrlRequest):
    try:
        # 1. Parse content from URL
        content_artifacts = await run_in_threadpool(parse_url, req.url)
        
        # 2. Extract Norms
        norms = await extract_norms(content_artifacts, req.concern)
        
        # 3. Compile Constitution
        constitution = await compile_constitution(norms)
        
        return {
            "norms": norms,
            "constitution": constitution,
            "artifacts_sample": content_artifacts[:2]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ingest/file")
async def ingest_file(file: UploadFile = File(...), concern: Optional[str] = Form(None)):
    try:
        content_bytes = await file.read()
        content_artifacts = await parse_file(file.filename, content_bytes)
        
        norms = await extract_norms(content_artifacts, concern)
        constitution = await compile_constitution(norms)
        
        return {
            "norms": norms,
            "constitution": constitution,
            "artifacts_sample": content_artifacts[:2]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class EvaluateRequest(BaseModel):
    message: str
    constitution: dict


@app.post("/api/evaluate")
async def process_evaluate(req: EvaluateRequest):
    try:
        decision_data = await evaluate_message(req.message, req.constitution)
        return decision_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
