#!/bin/bash

# Mordin Private Deployment Script
# Description: Builds, packages, and deploys the application to remote server
# Author: KU Development Team
# Last Modified: $(date +"%Y-%m-%d")

set -euo pipefail  # Exit on error, undefined vars, and pipe failures

# Configuration
REMOTE_HOST="mordin-server"
REMOTE_PATH="~/mordin-private"

ARCHIVE_NAME="mordin-private.tar.gz"
TEMP_DIR="./temp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Cleanup function
cleanup() {
    if [[ -f "${TEMP_DIR}/${ARCHIVE_NAME}" ]]; then
        log_info "Cleaning up local archive..."
        rm -f "${TEMP_DIR}/${ARCHIVE_NAME}"
    fi
    if [[ -d "dist" ]]; then
        log_info "Cleaning up dist directory..."
        rm -rf dist
    fi
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Main deployment process
main() {
    log_info "=== Mordin Private Deployment Started ==="
    log_info "Timestamp: $(date)"
    
    # Ensure temp directory exists
    mkdir -p "${TEMP_DIR}"
    
    # Build process
    log_info "Building application with Vite..."
    if npx vite build; then
        log_success "Build completed successfully"
    else
        log_error "Build failed"
        exit 1
    fi
    
    # Create archive
    log_info "Creating deployment archive..."
    if tar -czf "${TEMP_DIR}/${ARCHIVE_NAME}" "dist"; then
        log_success "Archive created: ${TEMP_DIR}/${ARCHIVE_NAME}"
        log_info "Archive size: $(du -h "${TEMP_DIR}/${ARCHIVE_NAME}" | cut -f1)"
    else
        log_error "Failed to create archive"
        exit 1
    fi
    
    # Transfer to remote server
    log_info "Transferring archive to remote server..."
    if scp "${TEMP_DIR}/${ARCHIVE_NAME}" "${REMOTE_HOST}:${REMOTE_PATH}/"; then
        log_success "File transferred successfully"
    else
        log_error "File transfer failed"
        exit 1
    fi
    
    # Execute remote deployment script
    log_info "Executing remote deployment script..."
    if ssh "${REMOTE_HOST}" "bash -c 'source ~/.bashrc && cd ${REMOTE_PATH}/script && bash auto.sh && rm -f ${REMOTE_PATH}/${ARCHIVE_NAME}'"; then
        log_success "Remote deployment completed successfully"
    else
        log_error "Remote deployment failed"
        exit 1
    fi
    
    log_success "=== Deployment completed successfully ==="
    log_info "Deployment finished at: $(date)"
}

# Execute main function
main "$@"
