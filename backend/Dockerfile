# ==========================================
# STAGE 1: Build TypeScript Application
# ==========================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript compiler)
RUN npm ci

# Copy TypeScript config and source files
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript (into /app/dist)
RUN npm run build

# ==========================================
# STAGE 2: Production Runtime with Native Tools
# ==========================================
FROM node:20-bookworm-slim AS runner

# Install native dependencies required for file conversions:
# - qpdf: PDF linearization, inspection, and flate compression
# - poppler-utils: pdftoppm for rendering PDF pages to high-res images
# - ghostscript: PDF optimization engine
# - tesseract-ocr & language packs: OCR text extraction
# - libreoffice (writer/calc/impress): headless office-to-PDF & legacy format conversion
# - fonts-dejavu-core & fonts-liberation: render text accurately during document conversions
# - curl & ca-certificates: healthcheck probe and secure outbound requests
RUN apt-get update && apt-get install -y --no-install-recommends \
    qpdf \
    poppler-utils \
    ghostscript \
    tesseract-ocr \
    tesseract-ocr-eng \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    fonts-dejavu-core \
    fonts-liberation \
    curl \
    ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package manifests and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

# Create storage directories for incoming uploads and processed output files
RUN mkdir -p /app/uploads /app/outputs /home/node/.config \
    && chown -R node:node /app /home/node

# Set environment defaults
ENV NODE_ENV=production \
    PORT=5000 \
    CORS_ORIGIN=* \
    MAX_FILE_SIZE_MB=50 \
    FILE_TTL_MINUTES=30 \
    HOME=/home/node

# Run container as non-root node user for hardened security
USER node

# Expose backend API port
EXPOSE 5000

# Health check probe against the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start Fileora backend server
CMD ["node", "dist/server.js"]
