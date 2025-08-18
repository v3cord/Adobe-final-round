PDF Reader & AI Insights Engine
1. Problem & Vision
In an age of information overload, professionals and researchers are often buried under a mountain of digital documents. Finding connections between different texts and extracting key insights is a manual, time-consuming, and inefficient process.

This project aims to solve that problem by creating an intelligent, web-based reading experience. Our vision is to transform passive document consumption into an active, insightful, and accelerated learning process. We connect the dots between documents, deliver knowledge beyond the page with AI, and even convert insights into an audio format for on-the-go learning.

2. Key Features
This application is more than just a PDF reader; it's a comprehensive suite of tools designed to accelerate understanding.

Core Document Handling
📚 Bulk PDF Upload & Library: Upload multiple PDFs at once to create a personal, searchable document library. New uploads are seamlessly added to your existing collection.

📄 High-Fidelity Viewer: A smooth, responsive PDF viewer with page navigation, scrolling.

AI-Powered Analysis & Interaction
🔗 Connect the Dots: When you select text in one document, the engine instantly finds and displays up to 5 related sections and snippets from your entire library, helping you discover hidden connections.

💬 Chat with Your Docs: An interactive chat panel where you can ask questions in natural language and get answers synthesized from the content of all uploaded documents.

💡 AI Insights Bulb: With a single click, leverage the power of Google's Gemini LLM to generate:

🔑 Key Insights: A concise summary of the document.

💡 "Did You Know?" Facts: Surprising facts related to the content.

🤔 Contradictions: Potential counterpoints to the document's arguments.

🔗 Connections: Links to broader concepts and themes.

Engagement & Learning Tools
🎧 Podcast Mode: Automatically generates a short, narrated audio overview of the AI-generated insights using Azure's Text-to-Speech service.

🌐 Instant Translation: Select any text in a PDF and instantly translate it into Hindi and French.

🧠 Knowledge Quiz: Generate a multiple-choice quiz based on the content of the active document to test your understanding.

📽️ AI Presentation: Automatically create a 5-slide presentation that summarizes the key points of your document, ready for you to view and navigate.

3. Tech Stack
Frontend: React.js

Backend: Node.js with Express.js

PDF Processing: react-pdf, pdfjs-dist

AI Language Model: Google Gemini

Text-to-Speech: Azure Cognitive Services

Containerization: Docker

4. Setup & Running the Application (Docker)
The entire application is containerized for a simple, one-command setup.

Prerequisites
Docker Desktop installed and running.

API keys for Google Gemini and Azure TTS.

Step 1: Clone the Repository
git clone https://github.com/rishavraj24/pdf-insights-engine.git
cd pdf-insights-engine

Step 2: Build the Docker Image
From the root directory, run the following command. This will build the frontend, set up the server, and package them into a single image.

docker build -t pdf-reader-app .

Step 3: Run the Docker Container
Run the image using the command below. You must provide your API keys as environment variables.

docker run -p 8080:8080 \
  -e GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE" \
  -e AZURE_TTS_KEY="YOUR_AZURE_TTS_KEY_HERE" \
  -e AZURE_TTS_ENDPOINT="YOUR_AZURE_TTS_ENDPOINT_HERE" \
  pdf-reader-app

Step 4: Access the Application
Open your web browser and navigate to:
http://localhost:8080

5. Environment Variables
The application requires the following environment variables to be set when running the Docker container:

Variable

Description

GEMINI_API_KEY

Your API key for the Google Gemini service.

AZURE_TTS_KEY

Your key for the Azure Cognitive Services Speech service.

AZURE_TTS_ENDPOINT

The full endpoint URL for your Azure Speech service, including the region.