# Authentication Setup Guide

This application now includes a complete authentication system with email/password and Google OAuth support.

## Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r app/requirements.txt
   ```

2. **Set up environment variables:**
   - Copy `backend/.env.example` to `backend/.env`
   - Update the following variables:
     - `SECRET_KEY`: Generate a secure random string for JWT tokens
     - `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID
     - `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret
     - `FRONTEND_URL`: Your frontend URL (default: http://localhost:3000)

3. **Google OAuth Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Set authorized redirect URI to: `http://localhost:8000/api/auth/google/callback`
   - Copy the Client ID and Client Secret to your `.env` file

4. **Run the backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

## Frontend Setup

1. **Install dependencies (if needed):**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables:**
   - Copy `frontend/.env.example` to `frontend/.env.local`
   - Update `NEXT_PUBLIC_API_URL` if your backend runs on a different port

3. **Run the frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

## Features

- **Email/Password Authentication:**
  - Sign up with email and password
  - Secure password hashing using bcrypt
  - Login with email and password

- **Google OAuth:**
  - Sign in/sign up with Google account
  - Automatic account creation or linking

- **Protected Routes:**
  - The image upload page (`/landing`) is protected
  - Users must be authenticated to upload images
  - Automatic redirect to login if not authenticated

- **JWT Tokens:**
  - Secure token-based authentication
  - Tokens stored in localStorage
  - 30-day token expiration

## API Endpoints

- `POST /api/auth/signup` - Create a new account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/google/login` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

## Database

The application uses SQLite by default (stored in `backend/app.db`). The database is automatically created on first run.

To use a different database, update the `DATABASE_URL` in your `.env` file.

