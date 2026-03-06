FROM node:22-slim

WORKDIR /app

# Install build dependencies for sharp (native module)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Install ALL dependencies (we need devDependencies for build)
RUN npm ci

# Copy source
COPY . .

# Build frontend
RUN npm run build

# Remove devDependencies
RUN npm prune --production

EXPOSE 3080

ENV NODE_ENV=production
CMD ["node", "server/index.cjs"]
