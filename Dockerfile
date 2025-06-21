FROM node:20.12.2

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies including Python and LibreOffice
RUN apt-get update && \
    apt-get install -y \
    wget \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    build-essential \
    libxinerama1 \
    libxrandr2 \
    libgl1-mesa-glx \
    libxrender1 \
    libfontconfig1 \
    libfreetype6 \
    libxext6 \
    libsm6 \
    libreoffice --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create symlink for python command
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Upgrade pip and install Python packages with verbose output
RUN python3 -m pip install --upgrade pip setuptools wheel && \
    python3 -m pip install --no-cache-dir --verbose pdf2docx pymupdf python-docx

# Verify Python packages installation
RUN python3 -c "import pdf2docx; print('pdf2docx installed successfully')" && \
    python3 -c "import fitz; print('pymupdf installed successfully')" && \
    python3 -c "import docx; print('python-docx installed successfully')"

# Set working directory
WORKDIR /app

# Copy Python script first and make it executable
COPY pdfToWord.py ./
RUN chmod +x pdfToWord.py

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy the rest of the application
COPY . .

# Create files directory
RUN mkdir -p files

EXPOSE 3000

CMD ["node", "app.js"]