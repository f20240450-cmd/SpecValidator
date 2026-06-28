# SpecValidator - Multi-stage Docker Build
# =============================================================================
# Stage 1: Base image with system dependencies
# =============================================================================
FROM python:3.11-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    curl \
    git \
    libopenblas-dev \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# =============================================================================
# Stage 2: Backend dependencies
# =============================================================================
FROM base AS backend-deps

WORKDIR /app/backend

# Copy requirements first for better caching
COPY backend/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# =============================================================================
# Stage 3: Frontend build
# =============================================================================
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/src ./src
COPY frontend/public ./public

# Build production bundle
RUN npm run build

# =============================================================================
# Stage 4: Production backend
# =============================================================================
FROM base AS backend-prod

WORKDIR /app/backend

# Copy installed dependencies from backend-deps
COPY --from=backend-deps /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-deps /usr/local/bin /usr/local/bin

# Copy backend source code
COPY backend/ .

# Copy frontend build output
COPY --from=frontend-build /app/frontend/build ./static

# Create necessary directories
RUN mkdir -p models logs temp && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/status || exit 1

# Default command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]

# =============================================================================
# Stage 5: Development backend (optional)
# =============================================================================
FROM backend-deps AS backend-dev

WORKDIR /app/backend

# Copy backend source
COPY backend/ .

# Create directories
RUN mkdir -p models logs temp && chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Development command with auto-reload
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

# =============================================================================
# Stage 6: Final production image
# =============================================================================
FROM backend-prod AS production

# Labels for metadata
LABEL org.opencontainers.image.title="SpecValidator" \
      org.opencontainers.image.description="Offline-first AI for markdown to OpenAPI conversion" \
      org.opencontainers.image.version="1.0.0" \
      org.opencontainers.image.authors="SpecValidator Team" \
      org.opencontainers.image.licenses="AGPL-3.0-only" \
      org.opencontainers.image.source="https://code.swecha.org/saimanikanta777/specvalidator" \
      org.opencontainers.image.documentation="https://code.swecha.org/saimanikanta777/specvalidator/-/blob/main/README.md"

# Default to production command
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]