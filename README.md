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