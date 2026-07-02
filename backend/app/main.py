from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from typing import Optional
from app.services.resume_analyzer import analyze_resume, get_ats_score_only, enhance_for_ats
from fastapi import FastAPI, HTTPException, Form, UploadFile, File
from docx import Document
import pypdf
from io import BytesIO
from docx import Document

# Load environment variables
load_dotenv()

# Password hashing with argon2 (no 72-byte limit)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# Create FastAPI app
app = FastAPI(
    title="HireFlow API",
    description="AI-powered career optimization platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory user storage (for demo)
users_db = {}

# Helper functions
def hash_password(password: str) -> str:
    """Hash password using argon2"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
def extract_text_from_file(file_content: bytes, filename: str) -> str:
    """Extract text from .docx, .pdf, or .txt files"""
    
    if filename.endswith('.docx'):
        doc = Document(BytesIO(file_content))
        text = '\n'.join([para.text for para in doc.paragraphs])
        return text
    
    elif filename.endswith('.pdf'):
        pdf_reader = pypdf.PdfReader(BytesIO(file_content))
        text = '\n'.join([page.extract_text() for page in pdf_reader.pages])
        return text
    
    elif filename.endswith('.txt'):
        return file_content.decode('utf-8')
    
    else:
        raise ValueError("Unsupported file format. Use .docx, .pdf, or .txt")

# Routes
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "HireFlow API"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to HireFlow API",
        "docs": "/docs",
        "health": "/health"
    }

@app.post("/api/v1/auth/signup")
async def signup(first_name: str, last_name: str, email: str, password: str):
    """Register a new user"""
    
    if email in users_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    
    try:
        user_id = str(len(users_db) + 1)
        hashed_password = hash_password(password)
        
        user_data = {
            "id": user_id,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "password_hash": hashed_password,
            "is_active": True,
        }
        
        users_db[email] = user_data
        
        token = create_access_token(data={"sub": email})
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user_id,
                "first_name": first_name,
                "last_name": last_name,
                "email": email,
                "is_active": True,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/auth/login")
async def login(email: str, password: str):
    """Login a user"""
    
    user = users_db.get(email)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token(data={"sub": email})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "email": user["email"],
            "is_active": user["is_active"],
        }
    }

@app.get("/api/v1/auth/me")
async def get_current_user(token: str = None):
    """Get current user profile"""
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return {"message": "User profile (coming soon)"}

@app.post("/api/v1/resume/analyze")
async def analyze_resume_endpoint(
    resume_file: UploadFile = File(None),
    resume_text: str = Form(""),
    job_description: str = Form(...)
):
    """Analyze resume against job description - accepts file or text"""
    
    # Get resume text from file OR form input
    if resume_file:
        file_content = await resume_file.read()
        resume_input = extract_text_from_file(file_content, resume_file.filename)
    else:
        resume_input = resume_text
    
    if not resume_input.strip() or not job_description.strip():
        raise HTTPException(status_code=400, detail="Resume and job description required")
    
    try:
        result = analyze_resume(resume_input, job_description)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/resume/enhance-more")
async def enhance_more_endpoint(
    enhanced_resume: str = Form(...),
    job_description: str = Form(...)
):
    """Re-enhance an already enhanced resume to push ATS score even higher"""
    
    if not enhanced_resume or not job_description:
        raise HTTPException(status_code=400, detail="Enhanced resume and job description required")
    
    try:
        # Analyze the enhanced resume to find remaining gaps
        analysis = get_ats_score_only(enhanced_resume, job_description)
        
        # Enhance AGAIN with new gaps found
        more_enhanced = enhance_for_ats(enhanced_resume, job_description, analysis)
        
        # Score the newly enhanced resume
        new_analysis = get_ats_score_only(more_enhanced, job_description)
        
        return {
            "previous_ats_score": analysis.get("ats_score", 0),
            "new_ats_score": new_analysis.get("ats_score", 0),
            "improvement": new_analysis.get("ats_score", 0) - analysis.get("ats_score", 0),
            "more_enhanced_resume": more_enhanced,
            "missing_keywords": new_analysis.get("missing_keywords", []),
            "strengths": new_analysis.get("strengths", []),
            "areas_to_improve": new_analysis.get("areas_to_improve", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
 
@app.post("/api/v1/resume/enhance-custom")
async def enhance_custom_endpoint(
    resume_text: str = Form(...),
    job_description: str = Form(...),
    custom_prompt: str = Form(...)
):
    """Enhance resume with custom user requirements"""
    
    if not resume_text or not job_description or not custom_prompt:
        raise HTTPException(status_code=400, detail="Resume, job description, and custom prompt required")
    
    try:
        # Get current analysis
        analysis = get_ats_score_only(resume_text, job_description)
        
        # Create enhanced prompt with custom requirements
        custom_analysis = {
            **analysis,
            "custom_requirements": custom_prompt
        }
        
        # Enhance with custom requirements
        custom_enhanced = enhance_for_ats(resume_text, job_description, custom_analysis)
        
        # Score the custom enhanced resume
        new_analysis = get_ats_score_only(custom_enhanced, job_description)
        
        return {
            "previous_ats_score": analysis.get("ats_score", 0),
            "new_ats_score": new_analysis.get("ats_score", 0),
            "improvement": new_analysis.get("ats_score", 0) - analysis.get("ats_score", 0),
            "custom_enhanced_resume": custom_enhanced,
            "missing_keywords": new_analysis.get("missing_keywords", []),
            "strengths": new_analysis.get("strengths", []),
            "areas_to_improve": new_analysis.get("areas_to_improve", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))  

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)