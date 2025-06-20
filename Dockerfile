FROM node:20.12.2

# Install dependencies required for LibreOffice
RUN apt-get update && \
    apt-get install -y wget libxinerama1 libxrandr2 libgl1-mesa-glx libxrender1 libfontconfig1 libfreetype6 libxext6 libsm6 && \
    apt-get clean

# Option 1: Install LibreOffice from Ubuntu repositories (Recommended - most reliable)
RUN apt-get update && \
    apt-get install -y libreoffice --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]