# Docker Setup Guide

This guide will help you run the YOLO Object Detection application using Docker.

## Prerequisites

- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)
- At least 4GB of free disk space
- Gemini API Key from Google AI Studio ([Get one here](https://makersuite.google.com/app/apikey))

## Quick Start

### 1. Clone the repository and navigate to the project directory

```bash
cd ACI_ImageAnalysis
```

### 2. Create environment file

Copy the `env.template` file to `.env` and fill in your API keys:

```bash
cp env.template .env
```

Edit the `.env` file and add your credentials:
- **Required:** `GEMINI_API_KEY` - Your Google Gemini API key
- **Required:** `SECRET_KEY` - A long random string for JWT token encryption
- **Optional:** Google OAuth credentials if you want to enable Google Sign-In

```env
SECRET_KEY=change-this-to-a-long-random-string-for-production
GEMINI_API_KEY=your-actual-gemini-api-key-here
GEMINI_MODEL_NAME=gemini-2.5-flash
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start the application

Run the following command to build and start all services:

```bash
docker compose up
```

Or to run in detached mode (background):

```bash
docker compose up -d
```

### 4. Access the application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

### 5. Stop the application

```bash
docker compose down
```

To stop and remove all volumes (database and uploads):

```bash
docker compose down -v
```

## Architecture

The application consists of three main services:

1. **Frontend (Next.js)** - Runs on port 3000
   - Modern React-based user interface
   - Handles user authentication and image uploads
   - Displays detection results in sortable tables

2. **Backend (FastAPI)** - Runs on port 8000
   - RESTful API for authentication and image processing
   - Runs YOLO model locally for object detection
   - Integrates with Google Gemini for AI-powered Q&A

3. **Database (SQLite)** - File-based database
   - Stores user accounts and authentication data
   - Persisted in Docker volume

## Features

- ✅ User authentication (Sign up, Login, Google OAuth)
- ✅ Image upload interface
- ✅ Local YOLO object detection (YOLOv8n)
- ✅ Annotated image with bounding boxes
- ✅ Sortable detection results table
- ✅ AI-powered Q&A about detection results using Gemini

## Troubleshooting

### Port already in use

If ports 3000 or 8000 are already in use, you can modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change 3001 to any available port
```

### Backend health check failing

The backend may take 30-60 seconds to start on first run as it downloads the YOLO model. Wait for the health check to pass.

### Cannot connect to backend from frontend

Make sure the `NEXT_PUBLIC_API_URL` environment variable is set correctly in your `.env` file. It should match the backend service URL.

### Database issues

If you're experiencing database issues, you can reset the database by removing the volume:

```bash
docker compose down -v
docker compose up
```

## Development

### Viewing logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
```

### Rebuilding after code changes

```bash
docker compose up --build
```

### Accessing container shell

```bash
# Backend
docker exec -it yolo-backend /bin/bash

# Frontend
docker exec -it yolo-frontend /bin/sh
```

## Production Deployment

For production deployment:

1. Change `SECRET_KEY` to a strong random string
2. Update `FRONTEND_URL` to your production domain
3. Consider using a proper database (PostgreSQL) instead of SQLite
4. Set up proper CORS policies
5. Use environment-specific `.env` files
6. Enable HTTPS/SSL
7. Set up proper logging and monitoring

## Support

For issues or questions, please check the main README or create an issue in the repository.


