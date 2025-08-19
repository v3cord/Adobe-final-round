📖 PDF Reader & AI Insights Engine

An intelligent, web-based reading experience that transforms passive document consumption into active, insightful, and accelerated learning.

🚀 1. Problem & Vision

In today’s age of information overload, professionals and researchers are buried under mountains of digital documents. Extracting insights, finding connections, and making sense of data is manual, time-consuming, and inefficient.

👉 Our vision is to solve this by building a smart PDF reader with AI-powered insights:

Connect the dots across multiple documents.

Deliver knowledge beyond the page.

Convert insights into audio podcasts for on-the-go learning.

✨ 2. Key Features
📚 Core Document Handling

Bulk PDF Upload & Library → Upload multiple PDFs into a personal searchable library.

High-Fidelity Viewer → Smooth, responsive PDF viewer with page navigation, scrolling, zoom in/out, and full screen mode.

Day/Night/Reading Mode → Adjustable blue light filter for eye comfort.

🤖 AI-Powered Analysis & Interaction

🔗 Connect the Dots → Select text in one doc and instantly see up to 5 related snippets across your library.

💬 Chat with Your Docs → Ask natural language questions, get synthesized answers.

💡 AI Insights Bulb (Powered by Google Gemini)

🔑 Key Insights → Concise summaries.

💡 Did You Know? → Surprising facts.

🤔 Contradictions → Counterpoints & critical thinking.

🔗 Connections → Broader context & themes.

🎯 Engagement & Learning Tools

🎧 Podcast Mode → AI-generated narrated audio insights (speed & volume adjustable).

🌐 Instant Translation → Translate any text to Hindi or French.

🧠 Knowledge Quiz → Auto-generated MCQs from document content.

📽️ AI Presentation → Auto-create a 5-slide summary presentation.

Dynamic Landing Page → Interactive and modern UI for better user experience.

🛠️ 3. Tech Stack

Frontend → React.js

Backend → Node.js (Express.js)

PDF Processing → react-pdf, pdfjs-dist

AI Language Model → Google Gemini

Text-to-Speech → Azure Cognitive Services

Containerization → Docker

📂 4. Project Structure
ADOBE-FINAL-ROUND-MAIN/
│── client/              # Frontend (React.js)
│   ├── public/
│   └── src/
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
│── server/              # Backend (Node.js + Express)
│   ├── server.js
│   ├── package.json
│   └── package-lock.json
│
│── Dockerfile           # Container setup
│── README.md            # Project documentation
│── .gitignore

⚡ 5. Setup & Running (Dockerized)
🔧 Prerequisites

Install Docker Desktop

API Keys:

Google Gemini (LLM)

Azure Cognitive Services (TTS)

📌 Step 1: Clone the Repository
git clone https://github.com/v3cord/Adobe-final-round.git
cd Adobe-final-round

📌 Step 2: Build Docker Image
docker build -t pdf-reader-app .

📌 Step 3: Run the Container
docker run -p 8080:8080 \
  -e GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE" \
  -e AZURE_TTS_KEY="YOUR_AZURE_TTS_KEY_HERE" \
  -e AZURE_TTS_ENDPOINT="YOUR_AZURE_TTS_ENDPOINT_HERE" \
  pdf-reader-app

📌 Step 4: Access Application

👉 Open browser at:
http://localhost:8080

🔑 6. Environment Variables
Variable	Description
GEMINI_API_KEY	API key for Google Gemini LLM
AZURE_TTS_KEY	API key for Azure Cognitive Speech Services
AZURE_TTS_ENDPOINT	Full endpoint URL including region
👨‍💻 7. Future Enhancements

Support for more languages in translation.

Integration with cloud storage (Google Drive / OneDrive).

Advanced note-taking & annotation system.

AI-driven mind maps from documents.
