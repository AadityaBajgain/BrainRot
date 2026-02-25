from fastapi import APIRouter, HTTPException
import json
import httpx
from fastapi.responses import JSONResponse, StreamingResponse

router = APIRouter()


@router.get("/")
def home_page():
    return JSONResponse(status_code=200, content={"message": "This is home page"})


@router.get("/create")
def create_page():
    return JSONResponse(status_code=200, content={"message": "this is create page"})


OLLAMA_URL = "http://localhost:11434/api/generate"


@router.post("/generate")
async def test_mistral(payload: dict = None):
    prompt = (payload,{}).get("prompt","Write a. story about mouse")

    async def stream():
        try:
            async with httpx.AsyncClient (timeout=60) as client:
                async with client.stream(
                    "POST",
                    OLLAMA_URL,
                    json={"model":"mistral","prompt":prompt,"stream":True}
                ) as response:
                
                    response.raise_for_status()
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                        try:
                            payload_line = json.loads(line)
                            
                        except json.JSONDecodeError:
                            continue
                        
                        chunk = payload_line.get("response")
                        if chunk:
                            yield chunk
                        if payload_line.get("done"):
                            break
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=response.status_code, detail=str(exc))
        
    
    return StreamingResponse(stream(),media_type='text/plain')