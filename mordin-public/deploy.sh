#!/bin/bash

# Mordin Public Deployment Script
# Description: Builds, packages, and deploys the application to remote server
# Author: KU Development Team
# Last Modified: $(date +"%Y-%m-%d")

set -euo pipefail  # Exit on error, undefined vars, and pipe failures

# Configuration
REMOTE_HOST="mordin-server"
REMOTE_PATH="~/mordin-public"

ARCHIVE_NAME="mordin-public.tar.gz"
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

# Parse command line arguments
parse_args() {
    for arg in "$@"; do
        case $arg in
            REMOTE_HOST=*)
                REMOTE_HOST="${arg#*=}"
                log_info "Override REMOTE_HOST: ${REMOTE_HOST}"
                ;;
            REMOTE_PATH=*)
                REMOTE_PATH="${arg#*=}"
                log_info "Override REMOTE_PATH: ${REMOTE_PATH}"
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_warning "Unknown argument: $arg"
                ;;
        esac
    done
}

# Show help message
show_help() {
    echo "Mordin Public Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  REMOTE_HOST=<hostname>    Override remote host (default: mordin-server)"
    echo "  REMOTE_PATH=<path>        Override remote path (default: ~/mordin-public)"
    echo "  -h, --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  $0 REMOTE_HOST=production-server"
    echo "  $0 REMOTE_HOST=192.168.1.100 REMOTE_PATH=/opt/mordin"
}

# Cleanup function
cleanup() {
    if [[ -f "${TEMP_DIR}/${ARCHIVE_NAME}" ]]; then
        log_info "Cleaning up local archive..."
        rm -f "${TEMP_DIR}/${ARCHIVE_NAME}"
    fi
    if [[ -d "${TEMP_DIR}" ]]; then
        log_info "Cleaning up temp directory..."
        rmdir "${TEMP_DIR}" 2>/dev/null || true
    fi
}

# Set trap for cleanup on exit
trap cleanup EXIT

# Main deployment process
main() {
    log_info "=== Mordin Public Deployment Started ==="
    log_info "Timestamp: $(date)"

    # Ensure temp directory exists
    mkdir -p "${TEMP_DIR}"

    # Create zip archive
    log_info "Creating deployment archive..."
    SCRIPT_NAME=$(basename "$0")
    if tar -cz \
      --no-mac-metadata \
      --no-xattr \
      --exclude="${SCRIPT_NAME}" \
      --exclude="${TEMP_DIR}" \
      --exclude=".git" \
      -f "./${TEMP_DIR}/${ARCHIVE_NAME}" \
      .; then
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

    # Execute remote deployment commands
    log_info "Executing remote deployment commands..."

    if ssh -t "${REMOTE_HOST}" "bash -c 'source ~/.bashrc && cd ${REMOTE_PATH}/script && sudo bash auto.sh && rm -f ${REMOTE_PATH}/${ARCHIVE_NAME}'"; then
        log_success "Remote deployment completed successfully"
    else
        log_error "Remote deployment failed"
        exit 1
    fi

    log_success "=== Deployment completed successfully ==="
    log_info "Deployment finished at: $(date)"
    log_info "Application should now be available on the remote server"
}

# Parse arguments first
parse_args "$@"

# Execute main function
main "$@"
