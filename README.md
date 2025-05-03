# Docflex

**Docflex** is a web application designed to convert documents between various formats, such as PDF to Word. Built with Node.js and Express, it leverages Python scripts for handling the conversion processes.

## Features

- Upload documents for conversion.
- Convert PDFs to Word documents and vice versa.
- User-friendly interface for seamless interaction.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: EJS templates, HTML, CSS
- **Scripting**: Python
- **Containerization**: Docker

## Prerequisites

Before running the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/)
- [Python 3](https://www.python.org/)
- [Docker](https://www.docker.com/) (optional, for containerization)

## Installation

1. **Clone the repository**:

 ```bash
   git clone https://github.com/Harshitraaaj/Docflex.git
   cd Docflex
 ```
2. **Install Node.js dependencies**:

 ```bash
npm install
```
3. **Set up environment variables**:

 ```bash
Create a .env file in the root directory and add:
PORT=3000
```

4.  **Install Python dependencies**:

   ```bash
pip install pdf2docx python-docx PyMuPDF
```

## Running the Application

1.  **Using Node.js (Local Development)**

Start the Node.js server:
```bash
node app.js
```
Open your browser and go to:
```bash
http://localhost:3000
```

2.  **Using Docker**

Build the Docker image:

```bash
docker build -t docflex .
```
Run the Docker container:

```bash
docker run -p 3000:3000 docflex
```
Then access the app at:
```bash
http://localhost:3000
```

# Live Demo
```bash
https://docflex.onrender.com
```
