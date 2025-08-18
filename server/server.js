// server.js — FINAL VERSION with All Features Restored & Working

// --- Imports ---
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const sdk = require("microsoft-cognitiveservices-speech-sdk");

// --- Correct PDF.js Import ---
const pdfjsLib = require('pdfjs-dist/build/pdf.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve('pdfjs-dist/build/pdf.worker.js');

// --- App Initialization ---
const app = express();
const PORT = process.env.PORT || 8080;

// --- In-Memory Database (Using a Map for easy updates) ---
let documentStore = new Map();

// --- Middleware ---
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- Create necessary directories on startup ---
const uploadsDir = path.join(__dirname, 'uploads');
const audioDir = path.join(__dirname, 'audio');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);

// --- Static File Serving ---
app.use('/audio', express.static(audioDir));
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, 'public')));

// --- Multer Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// ------------ PDF Section Extraction Helper ------------
const isLikelyHeading = (text) => {
    const trimmed = text.trim();
    if (trimmed.length === 0 || trimmed.length > 150) return false;
    if (/^\d+$/.test(trimmed)) return false;
    const isAllCaps = trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed);
    const endsWithPunctuation = /[.:;!?]$/.test(trimmed);
    return isAllCaps && !endsWithPunctuation;
};

async function extractSectionsFromPdfBuffer(pdfDataAsUint8Array) {
    const loadingTask = pdfjsLib.getDocument({ data: pdfDataAsUint8Array });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const sections = [];
    let fullText = '';
    let currentSection = {
        title: 'Introduction',
        content: '',
        pageNumber: 1
    };

    for (let p = 1; p <= numPages; p++) {
        const page = await pdfDoc.getPage(p);
        const textContent = await page.getTextContent();
        let pageLines = [];
        let currentLine = '';
        for(const item of textContent.items) {
            currentLine += item.str;
            if (item.hasEOL) {
                pageLines.push(currentLine.trim());
                currentLine = '';
            }
        }
        if(currentLine.trim() !== '') pageLines.push(currentLine.trim());

        fullText += pageLines.join('\n') + '\n';

        for (const line of pageLines) {
            if (isLikelyHeading(line)) {
                if (currentSection.content.trim().length > 0) {
                    sections.push(currentSection);
                }
                currentSection = { title: line.trim(), content: '', pageNumber: p };
            } else {
                currentSection.content += line + ' ';
            }
        }
        if (currentSection.pageNumber !== p && currentSection.content.trim().length > 0) {
             sections.push(currentSection);
             currentSection = { title: `Content from Page ${p}`, content: '', pageNumber: p };
        }
    }
    if (currentSection.content.trim().length > 0) {
        sections.push(currentSection);
    }

    return { sections, text: fullText.trim(), pageCount: numPages };
}


// -------------- Routes --------------

app.post('/upload', upload.array('files'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send({ message: 'No files were uploaded.' });
    }

    for (const file of req.files) {
        try {
            const dataBuffer = fs.readFileSync(file.path);
            const uint8Array = new Uint8Array(dataBuffer);
            const { sections, text, pageCount } = await extractSectionsFromPdfBuffer(uint8Array);

            const protocol = req.protocol;
            const host = req.get('host');
            const fileUrl = `${protocol}://${host}/uploads/${file.filename}`;

            const newDocument = {
                id: file.filename,
                originalName: file.originalname,
                url: fileUrl,
                sections,
                text,
                pageCount
            };
            documentStore.set(newDocument.id, newDocument);

        } catch (error) {
            console.error(`Error processing file ${file.originalname}:`, error);
        }
    }
    
    const currentLibrary = Array.from(documentStore.values()).map(doc => ({
        id: doc.id,
        name: doc.originalName,
        url: doc.url,
        pageCount: doc.pageCount
    }));

    res.status(200).send({
        message: `${req.files.length} file(s) processed successfully!`,
        files: currentLibrary
    });
});


app.post('/find-by-text', (req, res) => {
    const { selectedText, currentDocumentId } = req.body;
    if (!selectedText) return res.status(400).json({ error: 'selectedText is required.' });

    const allDocs = Array.from(documentStore.values());
    if (allDocs.length === 0) return res.json([]);

    const recommendations = [];
    const lowerQuery = selectedText.toLowerCase();

    for (const doc of allDocs) {
        for (const section of doc.sections) {
            if (section.content.toLowerCase().includes(lowerQuery)) {
                const sentences = section.content.match(/[^.!?]+[.!?\s]+/g) || [];
                let snippet = '';
                for(let i = 0; i < sentences.length; i++) {
                    if(sentences[i].toLowerCase().includes(lowerQuery)) {
                        snippet = sentences.slice(i, i + 3).join('').trim();
                        break;
                    }
                }
                if (!snippet) snippet = section.content.substring(0, 400);

                recommendations.push({
                    sourceDocId: doc.id,
                    sourceDoc: doc.originalName,
                    sectionTitle: section.title,
                    snippet: snippet,
                    pageNumber: section.pageNumber
                });

                if (recommendations.length >= 5) return res.json(recommendations);
            }
        }
    }
    res.json(recommendations);
});

app.post('/chat', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required.' });
    if (documentStore.size === 0) return res.status(400).json({ answer: "Please upload documents." });
    
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key not configured.' });

    const libraryContent = Array.from(documentStore.values()).map(doc => `--- Document: ${doc.originalName} ---\n${doc.text}`).join('\n\n');
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `Answer the user's "Question" based *only* on the "Document Library". Format your response as Markdown bullet points. If the answer isn't in the documents, say so.\n\nQuestion: "${query}"\n\nDocument Library:\n${libraryContent.substring(0, 30000)}`;

    try {
        const payload = { contents: [{ parts: [{ text: prompt }] }] };
        const apiResponse = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!apiResponse.ok) throw new Error(`Gemini API error: ${apiResponse.statusText}`);
        const result = await apiResponse.json();
        const answer = result.candidates[0].content.parts[0].text;
        res.json({ answer });
    } catch (error) {
        console.error("Error in /chat:", error);
        res.status(500).json({ error: 'Failed to get an answer from the AI.' });
    }
});

// --- ALL FEATURES RESTORED BELOW ---

app.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;
  if (!text || !targetLanguage) return res.status(400).json({ error: 'Text and target language are required.' });
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key not configured.' });
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
  const prompt = `Translate the following text to ${targetLanguage}. Provide only the translation.\n\nText: "${text}"`;
  try {
    const payload = { contents: [{ parts: [{ text: prompt }] }] };
    const apiResponse = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!apiResponse.ok) throw new Error(`Gemini API error: ${apiResponse.statusText}`);
    const result = await apiResponse.json();
    const translation = result.candidates[0].content.parts[0].text;
    res.json({ translation });
  } catch (error) {
    console.error("Error in /translate:", error);
    res.status(500).json({ error: 'Failed to translate text.' });
  }
});

app.post('/generate-insights', async (req, res) => {
    const { documentId } = req.body;
    const doc = documentStore.get(documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key not configured.' });
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `Based on the following text, provide a JSON object with four keys: "keyInsights", "didYouKnow", "contradictions", and "connections".\n\n- "keyInsights": A concise, one-sentence summary.\n- "didYouKnow": A surprising fact.\n- "contradictions": A potential counterpoint.\n- "connections": A broader connection.\n\nText:\n---\n${doc.text.substring(0, 15000)}\n---`;
    try {
        const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } };
        const apiResponse = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!apiResponse.ok) throw new Error(`Gemini API error: ${apiResponse.statusText}`);
        const result = await apiResponse.json();
        const insightsText = result.candidates[0].content.parts[0].text;
        res.json(JSON.parse(insightsText));
    } catch (error) {
        console.error("Error in /generate-insights:", error);
        res.status(500).json({ error: 'Failed to generate insights.' });
    }
});

app.post('/generate-podcast', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required.' });
    const AZURE_TTS_KEY = process.env.AZURE_TTS_KEY;
    const AZURE_TTS_ENDPOINT = process.env.AZURE_TTS_ENDPOINT;
    if (!AZURE_TTS_KEY || !AZURE_TTS_ENDPOINT) return res.status(500).json({ error: 'TTS service not configured.' });
    const region = AZURE_TTS_ENDPOINT.match(/(\w+)\.api/)[1];
    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_TTS_KEY, region);
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural";
    const audioFileName = `podcast-${Date.now()}.wav`;
    const audioFilePath = path.join(audioDir, audioFileName);
    const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFilePath);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
    synthesizer.speakTextAsync(text, result => {
        synthesizer.close();
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            const audioUrl = `${req.protocol}://${req.get('host')}/audio/${audioFileName}`;
            res.json({ audioUrl });
        } else {
            console.error("Azure TTS Error:", result.errorDetails);
            res.status(500).json({ error: 'Failed to synthesize audio.' });
        }
    }, err => {
        synthesizer.close();
        console.error("Azure TTS Stream Error:", err);
        res.status(500).json({ error: 'TTS synthesis failed.' });
    });
});

app.post('/generate-quiz', async (req, res) => {
    const { documentId } = req.body;
    const doc = documentStore.get(documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key not configured.' });
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `Create a JSON array of 5 multiple-choice questions from the text below. Each object must have "question", "options" (an array of 4), and "correctAnswer" keys.\n\nText:\n---\n${doc.text.substring(0, 15000)}\n---`;
    try {
        const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } };
        const apiResponse = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!apiResponse.ok) throw new Error(`Gemini API error: ${apiResponse.statusText}`);
        const result = await apiResponse.json();
        const quizText = result.candidates[0].content.parts[0].text;
        res.json(JSON.parse(quizText));
    } catch (error) {
        console.error("Error in /generate-quiz:", error);
        res.status(500).json({ error: 'Failed to generate quiz.' });
    }
});

app.post('/generate-presentation', async (req, res) => {
    const { documentId } = req.body;
    const doc = documentStore.get(documentId);
    if (!doc) return res.status(404).json({ error: 'Document not found.' });
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) return res.status(500).json({ error: 'Gemini API key not configured.' });
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${GEMINI_API_KEY}`;
    const prompt = `Create a JSON object for a 5-slide presentation from the text below. The object must have a "slides" key, which is an array of 5 objects. Each object must have "title" and "content" (array of strings) keys.\n\nText:\n---\n${doc.text.substring(0, 15000)}\n---`;
    try {
        const payload = { contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } };
        const apiResponse = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!apiResponse.ok) throw new Error(`Gemini API error: ${apiResponse.statusText}`);
        const result = await apiResponse.json();
        const presentationText = result.candidates[0].content.parts[0].text;
        res.json(JSON.parse(presentationText));
    } catch (error) {
        console.error("Error in /generate-presentation:", error);
        res.status(500).json({ error: 'Failed to generate presentation.' });
    }
});

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});