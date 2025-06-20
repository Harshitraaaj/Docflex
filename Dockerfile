FROM node:20.12.2

# Install dependencies for LibreOffice and add LibreOffice PPA
RUN apt-get update && \
    apt-get install -y software-properties-common wget gnupg2 && \
    add-apt-repository ppa:libreoffice/ppa -y && \
    apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy application code
COPY . .

# Expose your app port
EXPOSE 3000

# Start the app
CMD ["node", "app.js"]
