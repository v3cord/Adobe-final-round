PDF Reader & AI Insights Engine
1. Problem & Vision
In an age of information overload, professionals and researchers are often buried under a mountain of digital documents. Finding connections between different texts and extracting key insights is a manual, time-consuming, and inefficient process.

This project aims to solve that problem by creating an intelligent, web-based reading experience. Our vision is to transform passive document consumption into an active, insightful, and accelerated learning process. We connect the dots between documents, deliver knowledge beyond the page with AI, and even convert insights into an audio format for on-the-go learning.

2. Key Features
Bulk PDF Upload & Library: Upload multiple PDFs at once to create a personal, searchable document library.

High-Fidelity Viewer: A smooth, responsive PDF viewer with page navigation.

CPU-Based Recommendations: Instantly finds and displays related sections and snippets from your entire library without needing an external AI service.

AI Insights Bulb: With a single click, leverage the power of Google's Gemini LLM to generate:

🔑 Key Insights: A concise summary of the document.

💡 "Did You Know?" Facts: Surprising facts related to the content.

🤔 Contradictions: Potential counterpoints to the document's arguments.

🔗 Connections: Links to broader concepts and themes.

Podcast Mode: Automatically generates a short, narrated audio overview of the AI-generated insights using Azure's Text-to-Speech service.

3. Tech Stack
Frontend: React.js

Backend: Node.js with Express.js

PDF Processing: react-pdf, pdf-parse

AI Language Model: Google Gemini

Text-to-Speech: Azure Cognitive Services

Containerization: Docker

4. Setup & Running the Application (Docker)
The entire application is containerized for easy setup and deployment.

Prerequisites
Docker Desktop installed and running.

API keys for Google Gemini and Azure TTS.

Step 1: Clone the Repository
Bash

git clone <your-repository-url>
cd pdf_reader_app
Step 2: Build the Docker Image
From the root directory (pdf_reader_app/), run the following command. This will build the frontend, set up the server, and package them into a single image.

Bash

docker build -t pdf-reader-app .
Step 3: Run the Docker Container
Run the image using the command below. You must provide your API keys as environment variables.

Bash

docker run -p 8080:8080 \
  -e GEMINI_API_KEY="" \
  -e AZURE_TTS_KEY="" \
  -e AZURE_TTS_ENDPOINT="" \
  pdf-reader-app

Step 4: Access the Application
Open your web browser and navigate to:

http://localhost:8080

5. Environment Variables
The application requires the following environment variables to be set when running the Docker container:

Variable	Description	Example
GEMINI_API_KEY	Your API key for the Google Gemini service.	
AZURE_TTS_KEY	Your key for the Azure Cognitive Services Speech service.	
AZURE_TTS_ENDPOINT	The full endpoint URL for your Azure Speech service, including the region.	