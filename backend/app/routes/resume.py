import os
import uuid
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.config import settings
from app.schemas.resume import ResumeUploadResponse, ParsedResumeData
from app.services.resume_parser import parse_resume_file
from app.database.supabase_client import db_save_resume, db_get_resume
from app.utils.security import get_current_user_optional

router = APIRouter(prefix="/resume", tags=["Resume"])

@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user_optional)
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc", ".txt"]:
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file format. Please upload PDF, DOCX, or TXT."
        )

    # Save to local storage
    resume_id = str(uuid.uuid4())
    safe_filename = f"{resume_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Parse resume
    parsed_info = parse_resume_file(file_path, file.filename)
    user_id = current_user.get("id") if current_user else None

    # Persist in Supabase / store
    resume_record = {
        "id": resume_id,
        "user_id": user_id,
        "filename": file.filename,
        "file_url": f"/uploads/{safe_filename}",
        "parsed_text": parsed_info["raw_text"],
        "extracted_skills": parsed_info["skills"],
        "extracted_experience": parsed_info["experience"],
        "extracted_education": parsed_info["education"],
        "extracted_projects": parsed_info["projects"]
    }
    db_save_resume(resume_record)

    data = ParsedResumeData(
        id=resume_id,
        filename=file.filename,
        skills=parsed_info["skills"],
        experience=parsed_info["experience"],
        education=parsed_info["education"],
        projects=parsed_info["projects"],
        contact=parsed_info["contact"],
        total_words=parsed_info["total_words"],
        raw_text=parsed_info["raw_text"]
    )

    return ResumeUploadResponse(
        success=True,
        resume_id=resume_id,
        data=data,
        message=f"Resume parsed successfully! Extracted {len(parsed_info['skills'])} skills."
    )

@router.get("/{resume_id}", response_model=ParsedResumeData)
def get_resume(resume_id: str):
    res = db_get_resume(resume_id)
    if not res:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return ParsedResumeData(
        id=res.get("id"),
        filename=res.get("filename", "resume"),
        skills=res.get("extracted_skills", []),
        experience=res.get("extracted_experience", []),
        education=res.get("extracted_education", []),
        projects=res.get("extracted_projects", []),
        contact={},
        total_words=len(res.get("parsed_text", "").split()),
        raw_text=res.get("parsed_text", "")
    )
