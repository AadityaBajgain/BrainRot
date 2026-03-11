from fastapi import APIRouter, HTTPException, UploadFile, File, Form
import json
import httpx
from fastapi.responses import JSONResponse, StreamingResponse, PlainTextResponse
# from piper import PiperVoice
# import wave
import requests

from schemas.enums import Styles
from utils import Prompt, save_response_in_wav_file
from schemas.request import BrainrotRequest


router = APIRouter()


@router.get("/")
def home_page():
    return JSONResponse(status_code=200, content={"message": "This is home page"})


@router.get("/create")
def create_page():
    return JSONResponse(status_code=200, content={"message": "this is create page"})


OLLAMA_URL = "http://localhost:11434/api/generate"


@router.post("/generate")
async def get_ai_response(
    topic: str = Form(...),
    subject: str | None = Form(None),
    style:  Styles= Form(...),
    chaos_score : int | None = Form(None),
    # file:File | None = File(None)
):
    data = BrainrotRequest(
        topic=topic, subject=subject, style=style, chaos_score=chaos_score
    )
    prompt = Prompt(data.topic, data.subject, data.style, data.chaos_score)
    # async def stream():
    #     try:
    #         async with httpx.AsyncClient(timeout=60) as client:
    #             async with client.stream(
    #                 "POST",
    #                 OLLAMA_URL,
    #                 json={"model":"gpt-oss:120b-cloud","prompt":prompt,"stream":True},
    #                 # files=file
    #             ) as response:
                
    #                 async for line in response.aiter_lines():
    #                     if not line:
    #                         continue
    #                     try:
    #                         payload_line = json.loads(line)
    #                         print(payload_line)
    #                     except json.JSONDecodeError:
    #                         continue
                        
    #                     chunk = payload_line.get("response")
    #                     if chunk:
    #                         yield chunk
    #                     if payload_line.get("done"):
    #                         break
    #                     # save_chunks_in_wav_file(chunk, "/Users/aadityabajgain/Brainrot/backend/model/en_US-ryan-high.onnx","/Users/aadityabajgain/Brainrot/backend/voice/voice.wav")
    #     except httpx.HTTPError as exc:
    #         raise HTTPException(status_code=502, detail=str(exc)) from exc
        
    
    # return StreamingResponse(stream(), media_type="text/plain")
    data = requests.post(
        OLLAMA_URL,
        json={"model":"gpt-oss:120b-cloud","prompt":prompt,"stream":False},
        headers={
                'content-type':'application/json'
        }
    )
        
    print(data.json()["response"], data.status_code)
    
    text_response = data.json()["response"]
    
    save_response_in_wav_file( text_response,"/Users/aadityabajgain/Brainrot/backend/model/en_US-ryan-high.onnx", "/Users/aadityabajgain/Brainrot/backend/voice/voice.wav")
    
    # return JSONResponse(text_response, status_code=data.raise_for_status())