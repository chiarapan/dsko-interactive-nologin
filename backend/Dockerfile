FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    gfortran \
    ninja-build \
    python3-dev \
    curl \
  && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt backend/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel
RUN python -m pip install --prefer-binary -r backend/requirements.txt

COPY backend /app/backend
WORKDIR /app/backend

EXPOSE 10000
CMD ["/bin/sh", "-lc", "gunicorn 'app:create_app()' --bind 0.0.0.0:${PORT:-10000} --workers 1"]
