#!/bin/bash
set -e

echo "🚀 Setting up HACS Integration Development Environment"

# Check prerequisites
echo "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "Docker Compose is required but not installed. Aborting." >&2; exit 1; }

# Create necessary directories
echo "Creating directory structure..."
mkdir -p config
mkdir -p custom_components
mkdir -p tests/{unit,integration,e2e}
mkdir -p examples
mkdir -p PRPs/{templates,ai_docs}

# Start containers
echo "Starting Docker containers..."
docker-compose up -d

# Wait for Home Assistant to be ready
echo "Waiting for Home Assistant to start..."
until $(curl --output /dev/null --silent --head --fail http://localhost:8123); do
    printf '.'
    sleep 5
done
echo ""

echo "✅ Development environment is ready!"
echo "Home Assistant: http://localhost:8123"
echo "Puppeteer: http://localhost:3001"