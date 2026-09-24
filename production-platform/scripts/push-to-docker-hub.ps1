#!/bin/bash
# Registry Push Script for HajjMed API (PowerShell version for Windows)
# Pushes the Docker image to Docker Hub

param(
    [string]$Tag = "latest"
)

$REGISTRY_USER = "amzan96"
$IMAGE_NAME = "hajjmed-api"
$FULL_IMAGE = "${REGISTRY_USER}/${IMAGE_NAME}:${Tag}"

Write-Host "🐳 Docker Hub Push Script (Windows)" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Image: $FULL_IMAGE" -ForegroundColor Yellow
Write-Host ""

# Check if image exists locally
try {
    docker image inspect "hajjmed-api:${Tag}" | Out-Null
} catch {
    Write-Host "❌ Error: Local image 'hajjmed-api:${Tag}' not found" -ForegroundColor Red
    Write-Host "Build the image first with:" -ForegroundColor Yellow
    Write-Host "  cd production-platform" -ForegroundColor Gray
    Write-Host "  docker build -f apps/api/Dockerfile -t hajjmed-api:${Tag} ." -ForegroundColor Gray
    exit 1
}

# Check Docker authentication
$loginCheck = docker info 2>&1 | Select-String "Registries"
if (-not $loginCheck) {
    Write-Host "📝 Docker Hub authentication required" -ForegroundColor Yellow
    Write-Host "Run: docker login" -ForegroundColor Gray
    docker login
}

Write-Host ""
Write-Host "📤 Tagging image..." -ForegroundColor Cyan
docker tag "hajjmed-api:${Tag}" "$FULL_IMAGE"

Write-Host "📤 Pushing to Docker Hub..." -ForegroundColor Cyan
docker push "$FULL_IMAGE"

Write-Host ""
Write-Host "✅ Success! Image pushed to: $FULL_IMAGE" -ForegroundColor Green
Write-Host ""
Write-Host "💡 To pull this image:" -ForegroundColor Cyan
Write-Host "  docker pull $FULL_IMAGE" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 To run this image:" -ForegroundColor Cyan
Write-Host "  docker run -p 4000:4000 $FULL_IMAGE" -ForegroundColor Gray
