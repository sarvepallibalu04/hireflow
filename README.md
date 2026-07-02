# HireFlow

AI-powered career optimization platform.

## Completed

✅ Landing page with hero section and features
✅ Login page with form validation
✅ Signup page with form validation  
✅ Backend authentication API (signup, login)
✅ Password hashing with argon2
✅ JWT token generation
✅ Frontend-backend integration
✅ API service for auth calls
✅ Token storage in localStorage
✅ End-to-end testing (signup and login working)

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS
- Backend: FastAPI, argon2, python-jose

## Running

**Backend:**
```bash
cd backend
. venv/Scripts/activate
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

## API Endpoints

- POST `/api/v1/auth/signup` - Sign up
- POST `/api/v1/auth/login` - Login
- GET `/api/v1/auth/me` - Get user

# HireFlow

AI-powered career optimization platform.

## Completed

✅ Landing page with hero section and features
✅ Login page with form validation
✅ Signup page with form validation  
✅ Backend authentication API (signup, login)
✅ Password hashing with argon2
✅ JWT token generation
✅ Frontend-backend integration
✅ API service for auth calls
✅ Token storage in localStorage
✅ End-to-end testing (signup and login working)
✅ Resume Optimizer v2.0 (file upload, ATS analysis, custom enhancement, DOCX export)
✅ Multi-pass resume enhancement
✅ Download as TXT and DOCX

## Tech Stack

### Frontend
- React 18, TypeScript, Vite, Tailwind CSS v4.3.2
- lucide-react (icons), docx (Word generation)

### Backend
- FastAPI, Python 3.14
- Claude AI API, python-docx, pypdf
- argon2, python-jose (auth)

## Running

**Backend:**
```bash
cd backend
. venv/Scripts/activate
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

Visit: http://localhost:5173

## API Endpoints

### Auth
- POST `/api/v1/auth/signup` - Sign up
- POST `/api/v1/auth/login` - Login
- GET `/api/v1/auth/me` - Get user

### Resume Optimizer
- POST `/api/v1/resume/analyze` - Analyze resume vs job description
- POST `/api/v1/resume/enhance-more` - Multi-pass enhancement
- POST `/api/v1/resume/enhance-custom` - Custom enhancement with prompts

## Features

### Resume Optimizer v2.0 ✅
- Upload .docx, .pdf, .txt files
- Paste resume text directly
- Real-time ATS score analysis
- AI-powered resume enhancement
- Custom enhancement prompts
- Gap analysis (missing keywords, strengths)
- Multi-pass optimization (up to 3 passes)
- Download as TXT or DOCX
- Actionable recommendations

## Test Results

- Resume: Balaji Sarvepalli (Senior Software Engineer)
- Job: Indeed Software Engineer I (Remote)
- Original ATS: 62/100
- Enhanced ATS: 92/100
- Improvement: +30 points (48%)