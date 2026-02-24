from fastapi import APIRouter
from fastapi.responses import JSONResponse
router = APIRouter()


@router.get("/")
def home_page():
    return JSONResponse(status_code=200, content={
        "message":"This is home page"
    })
    

@router.get("/create")
def create_page():
    return JSONResponse(status_code=200, content={
        "message":"this is create page"
    })
    

