import asyncio
import os
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, UploadFile, Form, HTTPException, status
# import json
# import httpx
import io
from fastapi.responses import JSONResponse, FileResponse
# from piper import PiperVoice
# import wave
import requests
from pypdf import PdfReader

from app.schemas.enums import Styles
from app.schemas.request import BrainrotRequest
from app.utils import build_prompt, save_response_in_wav_file


router = APIRouter()
BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_PATH = BASE_DIR / "model" / "en_US-ryan-high.onnx"
VOICE_DIR = BASE_DIR / "voice"
MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024
MAX_SOURCE_CHARS = 24_000


@router.get("/")
def home_page():
    return {"message": "Brainrot Study API is ready."}


@router.get("/create")
def create_page():
    return {"message": "Send a multipart POST request to /generate."}


OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma4")


@router.post("/generate")
async def get_ai_response(
        topic: str = Form(..., min_length=3, max_length=200),
        subject: str | None = Form(None),
        style:  Styles= Form(...),
        chaos_score: int | None = Form(None, ge=1, le=100),
        file:UploadFile | None = Form(None)
    ):
        if subject and len(subject) > 200:
            raise HTTPException(status_code=422, detail="Description must be 200 characters or fewer.")

        file_content = b""
        if file:
            filename = file.filename or ""
            is_pdf = file.content_type == "application/pdf" or filename.lower().endswith(".pdf")
            is_text = file.content_type == "text/plain" or filename.lower().endswith(".txt")
            if not (is_pdf or is_text):
                raise HTTPException(status_code=415, detail="Only PDF and TXT files are supported.")
            file_content = await file.read(MAX_UPLOAD_SIZE_BYTES + 1)
            if len(file_content) > MAX_UPLOAD_SIZE_BYTES:
                raise HTTPException(status_code=413, detail="Uploaded files must be 10 MB or smaller.")
        
        def decode_upload(content: bytes, upload: UploadFile | None) -> str:
            extracted_text = ""
            if not content:
                return ""
            # PDFs are binary; decoding them as text will raise errors or produce junk.
            if upload and (
                upload.content_type == "application/pdf"
                or (upload.filename and upload.filename.lower().endswith(".pdf"))
            ):
                pdf_stream = io.BytesIO(content)
                
                try:
                    reader = PdfReader(pdf_stream)
                    for page in reader.pages:
                        text = page.extract_text()
                        if text:
                            extracted_text += text + '\n'
                    return extracted_text[:MAX_SOURCE_CHARS]
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Could not parse the pdf: {e}")
            for enc in ("utf-8", "utf-16", "latin-1"):
                try:
                    return content.decode(enc)[:MAX_SOURCE_CHARS]
                except UnicodeDecodeError:
                    continue
            return content.decode("utf-8", errors="replace")[:MAX_SOURCE_CHARS]

        text_from_file = decode_upload(file_content, file)
        
        request_data = BrainrotRequest(
            topic=topic, subject=subject, style=style, chaos_score=chaos_score, file=text_from_file
        )
        prompt = build_prompt(
            request_data.topic,
            request_data.subject,
            request_data.style.value,
            request_data.chaos_score,
            request_data.file,
        )
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
        #                         # print(payload_line)
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


        try:
            ollama_response = await asyncio.to_thread(
                requests.post,
                OLLAMA_URL,
                json={"model": OLLAMA_MODEL, "prompt": prompt, "stream": False},
                headers={"content-type": "application/json"},
                timeout=180,
            )
            ollama_response.raise_for_status()
        except requests.RequestException as exc:
            raise HTTPException(status_code=502, detail=f"Failed to reach Ollama: {exc}") from exc

        try:
            response_payload = ollama_response.json()
        except ValueError as exc:
            raise HTTPException(status_code=502, detail="Ollama returned an invalid response.") from exc

        text_response = str(response_payload.get("response", "")).strip()
        if not text_response:
            raise HTTPException(status_code=502, detail="Ollama returned an empty response.")

        audio_filename = f"{uuid4().hex}.wav"
        audio_path = VOICE_DIR / audio_filename
        audio_url: str | None = None

        if MODEL_PATH.exists():
            try:
                await asyncio.to_thread(
                    save_response_in_wav_file,
                    text_response,
                    str(MODEL_PATH),
                    str(audio_path),
                )
                audio_url = f"/audio/{audio_filename}"
            except Exception as exc:
                # A generated script is still useful when the optional TTS layer fails.
                print(f"Voice generation failed: {exc}")

        return JSONResponse(
            {
                "response": text_response,
                "audio_url": audio_url,
            },
            status_code=status.HTTP_200_OK,
        )
        
@router.get("/audio/{audio_file}")   
def send_audio(audio_file: str):
    if not audio_file.endswith(".wav"):
        raise HTTPException(status_code=404, detail="Audio file not found")
    audio_path = (VOICE_DIR / audio_file).resolve()
    if VOICE_DIR.resolve() not in audio_path.parents:
        raise HTTPException(status_code=400, detail="Invalid audio file path")
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(audio_path, media_type="audio/wav")
