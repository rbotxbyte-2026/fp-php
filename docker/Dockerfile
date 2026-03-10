FROM node:20-slim

# Install ADB and required tools
RUN apt-get update && apt-get install -y \
    android-tools-adb \
    wget \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package.json ./
RUN npm install

# Copy all scripts
COPY setup-device.js ./
COPY cdp-inject.js ./
COPY inject-script.js ./
COPY entrypoint.sh ./
COPY utils.js ./

RUN chmod +x entrypoint.sh

# Default command
CMD ["./entrypoint.sh"]
