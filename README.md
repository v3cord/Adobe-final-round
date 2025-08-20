# 📖 PDF Reader & AI Insights Engine  

An intelligent, web-based reading experience that transforms passive document consumption into **active, insightful, and accelerated learning**.  

---

## 🚀 1. Problem & Vision  
In today’s age of **information overload**, professionals and researchers are buried under mountains of digital documents. Extracting insights, finding connections, and making sense of data is **manual, time-consuming, and inefficient**.  

👉 Our vision is to solve this by building a **smart PDF reader with AI-powered insights**:  
- Connect the dots across multiple documents.  
- Deliver knowledge beyond the page.  
- Convert insights into **audio podcasts** for on-the-go learning.  

---

## ✨ 2. Key Features  

### 📚 Core Document Handling  
- **Bulk PDF Upload & Library** → Upload multiple PDFs into a **personal searchable library**.  
- **High-Fidelity Viewer** → Smooth, responsive PDF viewer with **page navigation, scrolling, zoom in/out**.  
- **Day/Night/Reading Mode** → Adjustable **blue light filter** for eye comfort.
- **Fullscreen mode** → With minimal distracting icons

### 🤖 AI-Powered Analysis & Interaction  
- **🔗 Connect the Dots** → Select text in one doc and instantly see up to **5 related snippets** across your library.  
- **💬 Chat with Your Docs** → Ask natural language questions, get synthesized answers.  
- **💡 AI Insights Bulb (Powered by Google Gemini)**  
  - 🔑 Key Insights → Concise summaries.  
  - 💡 Did You Know? → Surprising facts.  
  - 🤔 Contradictions → Counterpoints & critical thinking.  
  - 🔗 Connections → Broader context & themes.  

### 🎯 Engagement & Learning Tools  
- **🎧 Podcast Mode** → AI-generated narrated audio insights (**speed & volume adjustable**).  
- **🌐 Instant Translation** → Translate any text to **Hindi or French**.  
- **🧠 Knowledge Quiz** → Auto-generated **MCQs** from document content.  
- **📽️ AI Presentation** → Auto-create a **5-slide summary presentation**.  
- **Dynamic Landing Page** → Interactive and modern UI for better user experience.  

---

## 🛠️ 3. Tech Stack  

- **Frontend** → React.js  
- **Backend** → Node.js (Express.js)  
- **PDF Processing** → `react-pdf`, `pdfjs-dist`  
- **AI Language Model** → Google Gemini  
- **Text-to-Speech** → Azure Cognitive Services  
- **Containerization** → Docker  

---

## 📂 4. Project Structure  

```bash
ADOBE-FINAL-ROUND-MAIN/
│
├── client/ # React frontend
│ ├── public/ # Public assets (HTML, images, icons, etc.)
│ ├── src/ # React source code
│ │ ├── App.css # Styling for App component
│ │ ├── App.js # Main React component
│ │ ├── index.css # Global CSS
│ │ └── index.js # React entry point
│ ├── package.json # Client dependencies and scripts
│ └── package-lock.json # Dependency lock file
│
├── server/ # Node.js backend
│ ├── server.js # Express server setup
│ ├── package.json # Server dependencies and scripts
│ └── package-lock.json # Dependency lock file
│
├── .gitignore # Git ignored files
├── Dockerfile # Docker setup for containerization
├── README.md # Project documentation
└── package.json # Root package file (if managing workspaces / common deps)
```
## 5. Setup & Running (Dockerized)
🔧 Prerequisites

### Install Docker Desktop

### API Keys:

Google Gemini (LLM)

Azure Cognitive Services (TTS)

### 📌 Step 1: Clone the Repository
git clone https://github.com/v3cord/Adobe-final-round.git

### 📌 Step 2: Build Docker Image
docker build -t pdf-reader-app .

### 📌 Step 3: Run the Container
docker run -e GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE" -e AZURE_TTS_KEY="YOUR_AZURE_TTS_KEY_HERE" -e AZURE_TTS_ENDPOINT="YOUR_AZURE_TTS_ENDPOINT_HERE" -p 8080:8080 pdf-reader-app

### 📌 Step 4: Access Application

👉 Open browser at:
http://localhost:8080

double click "Get Started" on the Landing page.
## 🔄 6. Workflow

The application provides a seamless end-to-end reading and insights journey.

Landing Page → Get Started

Double-click Get Started on the landing page to enter the main application.

Upload & Manage PDFs

Click on Add PDFs to upload one or multiple documents into your library.

Select any PDF from the library to open it in the reader.

Smart Reading Experience

Text Selection → Related Sections

Highlight any text to instantly generate related sections across your library.

Each related snippet shows its page number and has a Go to Source button that takes you directly to the exact page in the source document.

A Return Button allows you to go back to the previously opened PDF.

Reading Modes

Choose from Day Mode, Night Mode, or Blue Light Filter Mode with an adjustable comfort bar.

Zoom & Fullscreen

Zoom in/out with the +/- controls.

Switch to distraction-free reading with the Fullscreen button.

AI-Powered Features

Chat with Document (First Icon) → Ask questions and receive AI-generated answers synthesized across all uploaded documents.

Translation

Select any text, move to the Translate section, and generate translations in Hindi and French.

Use the Right Arrow button to toggle between translations.

Knowledge Quiz → Automatically generate MCQs from document content.

AI Presentation → Create a concise 5-slide auto-generated presentation, with Next/Previous navigation for slides.

Engagement Beyond Reading

Generate offline extractable insights with reference to source documents.

Use Podcast Mode for AI-narrated audio insights, adjustable for speed and volume
## 🔑 7. Environment Variables
Variable	Description
GEMINI_API_KEY	API key for Google Gemini LLM
AZURE_TTS_KEY	API key for Azure Cognitive Speech Services
AZURE_TTS_ENDPOINT	Full endpoint URL including region

## 👨‍💻 8. Future Enhancements

Support for more languages in translation.

Integration with cloud storage (Google Drive / OneDrive).

Advanced note-taking & annotation system.

AI-driven mind maps from documents.

## 9. Special mention

Docker file under 10GB

Buffer memory to remember pdfs read in a seesion (until the server is restarted).
