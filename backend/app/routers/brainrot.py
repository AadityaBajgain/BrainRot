from fastapi import APIRouter, UploadFile, Form, HTTPException
# import json
# import httpx
import io
from fastapi.responses import JSONResponse, FileResponse
# from piper import PiperVoice
# import wave
import requests
from pypdf import PdfReader

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
        file:UploadFile | None = Form(None)
    ):

        
        file_content = b""
        
        if file:
            file_content = await file.read()
        
        def decode_upload(content: bytes, upload: UploadFile | None) -> str:
            extracted_text = ""
            if not content:
                return ""
            # PDFs are binary; decoding them as text will raise errors or produce junk.
            if upload and (
                upload.content_type == "application/pdf"
                or (upload.filename and upload.filename.lower().endswith(".pdf"))
            ):
                pdf_stream = io.BytesIO(file_content)
                
                try:
                    reader = PdfReader(pdf_stream)
                    for page in reader.pages:
                        text = page.extract_text()
                        if text:
                            extracted_text += text + '\n'
                    return extracted_text
                except Exception as e:
                    raise HTTPException(status_code=400, detail=f"Could not parse the pdf: {e}")
            for enc in ("utf-8", "utf-16", "latin-1"):
                try:
                    return content.decode(enc)
                except UnicodeDecodeError:
                    continue
            return content.decode("utf-8", errors="replace")

        text_from_file = decode_upload(file_content, file)
        
        print(text_from_file)
        data = BrainrotRequest(
            topic=topic, subject=subject, style=style, chaos_score=chaos_score, file=text_from_file
        )
        prompt = Prompt(data.topic, data.subject, data.style, data.chaos_score, data.file)
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
        
        return JSONResponse(data.json(), status_code=data.status_code)
        
@router.get("/audio")   
def send_audio():
    return FileResponse("/Users/aadityabajgain/Brainrot/backend/voice/voice.wav", media_type="audio/wav")
