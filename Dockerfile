# Use an official Node.js image
FROM node:20.12.2


# Install LibreOffice
RUN apt-get update && \
    apt-get install -y libreoffice && \
    apt-get clean

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps


# Copy the rest of the app
COPY . .

# Expose your app port
EXPOSE 3000

# Start your app
CMD ["node", "app.js"]
