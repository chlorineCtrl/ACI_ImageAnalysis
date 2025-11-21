# Use Python 3.11 slim image as base
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for OpenCV and other libraries
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY app/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the YOLO model file
COPY app/yolov8n.pt /app/yolov8n.pt

# Copy application code
COPY app/ /app/app/

# Create necessary directories for uploads and static files
RUN mkdir -p /app/uploads /app/static/annotated /app/static/uploads

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV YOLO_MODEL_PATH=/app/yolov8n.pt

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


