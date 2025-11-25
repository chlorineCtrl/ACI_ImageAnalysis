# YOLO Object Detection Web Application

A full-stack AI web application where users can log in, upload images, run object detection using YOLOv8 model locally inside Docker, view results in a sortable table, and ask questions about the detection results through a Gemini-powered AI assistant.

## 🚀 Quick Start with Docker (Recommended)

### Prerequisites
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- Gemini API Key ([Get one free](https://makersuite.google.com/app/apikey))

### Setup in 3 Steps

1. **Clone and navigate to the project:**
   ```bash
   cd ACI_ImageAnalysis
   ```

2. **Create `.env` file from template:**
   ```bash
   cp env.template .env
   ```
   
   Then edit `.env` and add your API keys:
   ```env
   
      
   GEMINI_API_KEY="AIzaSyCdnAAOdGYh__4igC--LVCn03Gqwdq7b7A"
   GEMINI_MODEL_NAME=gemini-2.5-flash
   FRONTEND_URL=http://localhost:3000
   

   NEXT_PUBLIC_API_URL=http://localhost:8000

   ```

3. **Start the application:**
   ```bash
   docker compose up
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs



## ✨ Features

- **User Authentication**
  - Email/password signup and login
  - JWT-based session management

- **Image Upload & Processing**
  - Drag-and-drop or click to upload images
  - Real-time object detection using YOLOv8
  - Annotated images with bounding boxes
  
- **Detection Results**
  - Sortable table showing detected objects
  - Class names, confidence scores, and bounding boxes
  - Visual feedback with annotated images

- **AI-Powered Q&A**
  - Ask questions about detection results
  - Powered by Google Gemini AI
  - Context-aware responses based on current detections

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │      │    Backend      │      │   Database      │
│   (Next.js)     │─────▶│   (FastAPI)     │─────▶│   (SQLite)      │
│   Port: 3000    │      │   Port: 8000    │      │   (Volume)      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │  YOLO Model     │
                        │  (YOLOv8n)      │
                        │  Local Inference│
                        └─────────────────┘
```

### Services

1. **Frontend** - React/Next.js application
   - Modern, responsive UI
   - Real-time updates
   - Drag-and-drop file uploads

2. **Backend** - FastAPI Python server
   - RESTful API
   - YOLO object detection
   - Gemini AI integration
   - User authentication

3. **Database** - SQLite (persistent volume)
   - User accounts
   - Session management

## 📋 Technology Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Context API for state management

### Backend
- Python 3.11
- FastAPI
- Ultralytics YOLOv8
- Google Generative AI (Gemini)
- SQLAlchemy
- JWT authentication
- Bcrypt password hashing

### DevOps
- Docker & Docker Compose
- Multi-stage builds
- Health checks
- Volume persistence

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
# Required
GEMINI_API_KEY="AIzaSyCdnAAOdGYh__4igC--LVCn03Gqwdq7b7A"

# Optional
GEMINI_MODEL_NAME=gemini-2.5-flash
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### API Keys

1. **Gemini API Key (Required)**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with Google account
   - Click "Create API Key"
   - Copy and paste into `.env` file

2. **Google OAuth (Optional)**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:8000/api/auth/google/callback`

## 🎯 Usage

### 1. Sign Up / Login
- Create an account with email and password


### 2. Upload Image
- Drag and drop an image or click to browse
- Supports common image formats (JPG, PNG, etc.)

### 3. Detect Objects
- Click "Detect Objects" button
- Wait for YOLO model to process (usually 1-3 seconds)
- View annotated image with bounding boxes

### 4. Analyze Results
- Browse detection results in sortable table
- Sort by class name, confidence, or bounding box coordinates
- View confidence scores as percentages

### 5. Ask Questions
- Use the AI assistant to ask questions about detections
- Examples:
  - "How many dogs are in the image?"
  - "What objects have the highest confidence?"
  - "Are there any vehicles detected?"

## 🛠️ Development

### Running without Docker

If you prefer to run services individually:

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r app/requirements.txt
cd app
uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker Commands

```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# Stop services
docker compose down

# Rebuild after code changes
docker compose up --build

# View logs
docker compose logs -f

# Remove all data (including database)
docker compose down -v
```



## 📝 API Documentation

Once running, visit http://localhost:8000/docs for interactive API documentation (Swagger UI).

### Key Endpoints

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/me` - Get current user info
- `POST /api/images/upload` - Upload image and run detection
- `POST /api/results/qa` - Ask questions about detections


---

Built with ❤️ using YOLO, FastAPI, Next.js, and Google Gemini AI


