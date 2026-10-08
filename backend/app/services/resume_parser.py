import re
from typing import Dict, Any, List, Optional
from app.services.skill_extractor import extract_skills_from_text

def extract_text_from_pdf(file_path: str) -> str:
    text = ""
    try:
        import fitz  # PyMuPDF
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text() + "\n"
    except Exception as e:
        # Fallback reading as plain text if fitz is not installed
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception:
            text = f"Error reading PDF: {e}"
    return text.strip()

def extract_text_from_docx(file_path: str) -> str:
    text = ""
    try:
        import docx
        doc = docx.Document(file_path)
        for p in doc.paragraphs:
            text += p.text + "\n"
    except Exception as e:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception:
            text = f"Error reading DOCX: {e}"
    return text.strip()

def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    # Email regex
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text)
    email = email_match.group(0) if email_match else None

    # Phone regex (international & domestic)
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}', text)
    phone = phone_match.group(0).strip() if phone_match else None

    # LinkedIn & GitHub
    linkedin_match = re.search(r'(linkedin\.com/in/[\w\-]+)', text, re.IGNORECASE)
    linkedin = linkedin_match.group(0) if linkedin_match else None

    github_match = re.search(r'(github\.com/[\w\-]+)', text, re.IGNORECASE)
    github = github_match.group(0) if github_match else None

    return {
        "email": email,
        "phone": phone,
        "linkedin": linkedin,
        "github": github
    }

def extract_sections(text: str) -> Dict[str, List[Dict[str, Any]]]:
    """Basic section extraction based on common resume header keywords"""
    lines = text.split("\n")
    projects = []
    experience = []
    education = []

    current_section = None
    buffer = []

    for line in lines:
        cleaned = line.strip()
        if not cleaned:
            continue
        lower = cleaned.lower()

        if any(h in lower for h in ["project", "personal projects", "academic projects"]) and len(cleaned) < 30:
            current_section = "projects"
            buffer = []
        elif any(h in lower for h in ["experience", "work experience", "employment", "internship"]) and len(cleaned) < 30:
            current_section = "experience"
            buffer = []
        elif any(h in lower for h in ["education", "academic", "qualifications", "degree"]) and len(cleaned) < 30:
            current_section = "education"
            buffer = []
        elif len(cleaned) < 25 and cleaned.isupper():
            current_section = None
        else:
            if current_section == "projects" and len(cleaned) > 10:
                projects.append({"description": cleaned})
            elif current_section == "experience" and len(cleaned) > 10:
                experience.append({"description": cleaned})
            elif current_section == "education" and len(cleaned) > 5:
                education.append({"detail": cleaned})

    return {
        "projects": projects[:6],
        "experience": experience[:6],
        "education": education[:4]
    }

def parse_resume_file(file_path: str, filename: str) -> Dict[str, Any]:
    if filename.lower().endswith(".pdf"):
        raw_text = extract_text_from_pdf(file_path)
    elif filename.lower().endswith((".docx", ".doc")):
        raw_text = extract_text_from_docx(file_path)
    else:
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            raw_text = f.read()

    skills = extract_skills_from_text(raw_text)
    contact = extract_contact_info(raw_text)
    sections = extract_sections(raw_text)
    word_count = len(raw_text.split())

    return {
        "filename": filename,
        "skills": skills,
        "experience": sections["experience"],
        "education": sections["education"],
        "projects": sections["projects"],
        "contact": contact,
        "total_words": word_count,
        "raw_text": raw_text
    }
