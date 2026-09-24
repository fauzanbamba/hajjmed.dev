#!/bin/bash
# Registry Push Script for HajjMed API
# Pushes the Docker image to Docker Hub

set -e

REGISTRY_USER="amzan96"
IMAGE_NAME="hajjmed-api"
TAG="${1:-latest}"
FULL_IMAGE="${REGISTRY_USER}/${IMAGE_NAME}:${TAG}"

echo "🐳 Docker Hub Push Script"
echo "========================"
echo "Image: ${FULL_IMAGE}"
echo ""

# Check if image exists locally
if ! docker image inspect "hajjmed-api:${TAG}" > /dev/null 2>&1; then
  echo "❌ Error: Local image 'hajjmed-api:${TAG}' not found"
  echo "Build the image first with:"
  echo "  cd production-platform"
  echo "  docker build -f apps/api/Dockerfile -t hajjmed-api:${TAG} ."
  exit 1
fi

# Prompt for Docker Hub login if not already authenticated
if ! docker info | grep -q "Registries"; then
  echo "📝 Docker Hub authentication required"
  echo "Run: docker login"
  docker login
fi

echo ""
echo "📤 Tagging image..."
docker tag "hajjmed-api:${TAG}" "${FULL_IMAGE}"

echo "📤 Pushing to Docker Hub..."
docker push "${FULL_IMAGE}"

echo ""
echo "✅ Success! Image pushed to: ${FULL_IMAGE}"
echo ""
echo "💡 To pull this image:"
echo "  docker pull ${FULL_IMAGE}"
echo ""
echo "💡 To run this image:"
echo "  docker run -p 4000:4000 ${FULL_IMAGE}"
