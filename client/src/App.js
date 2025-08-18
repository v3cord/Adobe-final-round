import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './App.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

/* ----------------------
   Small presentational components
   ---------------------- */
const InsightCard = ({ title, content, icon }) => (
  <div className="insight-card">
    <h3 className="insight-title">
      <span role="img" aria-label="icon" className="insight-icon">{icon}</span>
      {title}
    </h3>
    <p className="insight-content">{content}</p>
  </div>
);

const LandingPage = ({ onLaunch }) => (
  <div className="landing-page">
    <div className="landing-content">
      <h1>Welcome to the House of Wonders</h1>
      <p>Step into a new era of document analysis. Discover hidden connections, generate intelligent insights, and test your knowledge with AI-powered tools.</p>
      <button onClick={onLaunch} className="launch-button">Launch Engine</button>
    </div>
  </div>
);

/* ----------------------
   Main App
   ---------------------- */
function App() {
  const [appState, setAppState] = useState('landing');
  const [documentLibrary, setDocumentLibrary] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [podcastUrl, setPodcastUrl] = useState(null);
  const [isLoadingPodcast, setIsLoadingPodcast] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [quiz, setQuiz] = useState(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [selectedText, setSelectedText] = useState('');
  // translations are stored as array so we can navigate
  const [translations, setTranslations] = useState([]); // [{ language: 'Hindi', text: '...' }, ...]
  const [currentTranslationIndex, setCurrentTranslationIndex] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);

  const [scrollToPage, setScrollToPage] = useState(null);
  const viewerContainerRef = useRef(null);

  const [presentation, setPresentation] = useState(null);
  const [isLoadingPresentation, setIsLoadingPresentation] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  const normalizeToOneBasedPage = (recOrPage) => {
    if (typeof recOrPage === 'number') {
      const n = Math.trunc(recOrPage);
      return n >= 1 ? n : n + 1;
    }
    if (recOrPage && typeof recOrPage === 'object' && recOrPage.pageNumber) {
        let p = Number(recOrPage.pageNumber);
        if(p < 1) p += 1;
        return Math.max(1, Math.trunc(p));
    }
    return 1;
  };

  useEffect(() => {
    if (scrollToPage === null) return;
    const tryScroll = () => {
      const el = viewerContainerRef.current?.querySelector(`#page-${scrollToPage}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setScrollToPage(null);
      }
    };
    const intervalId = setInterval(() => {
        const el = viewerContainerRef.current?.querySelector(`#page-${scrollToPage}`);
        if(el) {
            tryScroll();
            clearInterval(intervalId);
        }
    }, 100);
    return () => clearInterval(intervalId);
  }, [scrollToPage, numPages, activeFile]);

  /* ----------------------
     Backend interactions
     ---------------------- */
  const findRelatedByText = async (text) => {
    if (!text || !activeFile) return;
    setIsLoadingRecs(true);
    setRecommendations([]);
    setActiveTab('insights');
    try {
      const response = await axios.post('/find-by-text', {
        selectedText: text,
        currentDocumentId: activeFile.id
      });
      setRecommendations(response.data || []);
    } catch (error) {
      console.error('Error fetching recommendations by text:', error);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleTranslate = async () => {
    if (!selectedText) return;
    setIsTranslating(true);
    setTranslations([]);
    setCurrentTranslationIndex(0);
    try {
      // request both translations in parallel
      const [resHi, resFr] = await Promise.all([
        axios.post('/translate', { text: selectedText, targetLanguage: 'Hindi' }),
        axios.post('/translate', { text: selectedText, targetLanguage: 'French' })
      ]);

      const hiText = resHi?.data?.translation || '';
      const frText = resFr?.data?.translation || '';

      const newTranslations = [
        { language: 'Hindi', text: hiText },
        { language: 'French', text: frText }
      ];

      setTranslations(newTranslations);
      setCurrentTranslationIndex(0);
      // open translate tab so user sees it immediately
      setActiveTab('translate');
    } catch (error) {
      console.error('Error translating text:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  // translation navigation
  const handleNextTranslation = () => {
    setCurrentTranslationIndex((idx) => Math.min(idx + 1, translations.length - 1));
  };
  const handlePrevTranslation = () => {
    setCurrentTranslationIndex((idx) => Math.max(idx - 1, 0));
  };

  const handleTextSelection = () => {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 5) {
      setSelectedText(selection);
      // clear old translations when user selects new text
      setTranslations([]);
      setCurrentTranslationIndex(0);
      findRelatedByText(selection);
    }
  };

  const onFileChange = async (event) => {
    const browserFiles = Array.from(event.target.files);
    if (browserFiles.length === 0) return;
    setUploadStatus(`Uploading ${browserFiles.length} file(s)...`);

    const formData = new FormData();
    browserFiles.forEach((file) => formData.append('files', file));

    try {
      const response = await axios.post('/upload', formData);
      const fullLibrary = response.data.files || [];
      setDocumentLibrary(fullLibrary);
      
      if (!activeFile && fullLibrary.length > 0) {
        handleFileSelect(fullLibrary[0].id);
      }
      
      setUploadStatus(response.data.message || 'Upload complete!');
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStatus('Upload failed.');
    }
  };

  const handleGenerateInsights = async () => {
    if (!activeFile) return;
    setIsLoadingInsights(true);
    setAiInsights(null);
    try {
      const response = await axios.post('/generate-insights', { documentId: activeFile.id });
      setAiInsights(response.data);
    } catch (error) {
      console.error('Error generating AI insights:', error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleGeneratePodcast = async () => {
    if (!aiInsights) return;
    setIsLoadingPodcast(true);
    setPodcastUrl(null);
    try {
      const podcastText = `Key insights: ${aiInsights.keyInsights}. Did you know: ${aiInsights.didYouKnow}. A counterpoint is: ${aiInsights.contradictions}. A broader connection is: ${aiInsights.connections}.`;
      const response = await axios.post('/generate-podcast', { text: podcastText });
      setPodcastUrl(response.data.audioUrl);
    } catch (error) {
      console.error('Error generating podcast:', error);
    } finally {
      setIsLoadingPodcast(false);
    }
  };

  const handleFileSelect = (fileId) => {
    if (activeFile?.id === fileId) return;

    const fileToActivate = documentLibrary.find((f) => f.id === fileId);
    if (fileToActivate) {
      setActiveFile(null);
      setNumPages(null);
      
      setTimeout(() => {
        setActiveFile(fileToActivate);
        setAiInsights(null);
        setPodcastUrl(null);
        setRecommendations([]);
        setQuiz(null);
        setPresentation(null);
        setTranslations([]); // clear previous translations when switching files
        setCurrentTranslationIndex(0);
        setScrollToPage(1);
      }, 50);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;
    const newMessages = [...messages, { sender: 'user', text: chatInput }];
    setMessages(newMessages);
    setChatInput('');
    setIsChatLoading(true);
    try {
      const response = await axios.post('/chat', { query: chatInput });
      setMessages([...newMessages, { sender: 'ai', text: response.data.answer }]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages([...newMessages, { sender: 'ai', text: 'Sorry, an error occurred.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!activeFile) return;
    setIsLoadingQuiz(true);
    setQuiz(null);
    try {
      const response = await axios.post('/generate-quiz', { documentId: activeFile.id });
      setQuiz(response.data);
      setCurrentQuestionIndex(0);
      setQuizScore(0);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleAnswerSelect = (option) => {
    if (showAnswer) return;
    setSelectedAnswer(option);
    setShowAnswer(true);
    if (option === quiz[currentQuestionIndex].correctAnswer) {
      setQuizScore((score) => score + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex((index) => index + 1);
  };

  const handleGoToSource = (rec) => {
    const targetPage = normalizeToOneBasedPage(rec);
    if (activeFile && activeFile.id === rec.sourceDocId) {
      setScrollToPage(targetPage);
    } else {
      handleFileSelect(rec.sourceDocId);
      setTimeout(() => setScrollToPage(targetPage), 100);
    }
  };

  const handleGeneratePresentation = async () => {
    if (!activeFile) return;
    setIsLoadingPresentation(true);
    setPresentation(null);
    try {
      const response = await axios.post('/generate-presentation', { documentId: activeFile.id });
      setPresentation(response.data.slides);
      setCurrentSlideIndex(0);
    } catch (error) {
      console.error('Error generating presentation:', error);
    } finally {
      setIsLoadingPresentation(false);
    }
  };

  const handleNextSlide = () => {
    setCurrentSlideIndex((prev) => Math.min(prev + 1, presentation.length - 1));
  };

  const handlePrevSlide = () => {
    setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
  };

  // keep translate panel visible when translations exist
  useEffect(() => {
    if (translations.length > 0) {
      setActiveTab('translate');
    }
  }, [translations.length]);

  /* ----------------------
     Render
     ---------------------- */
  if (appState === 'landing') {
    return <LandingPage onLaunch={() => setAppState('engine')} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <h1>Insights Engine</h1>
        </div>
        <label htmlFor="file-upload" className="file-upload-label">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 8L12 3L7 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span>Add PDFs</span>
        </label>
        <input id="file-upload" onChange={onFileChange} type="file" multiple />
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <h2>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 12H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Document Library
          </h2>
          <ul className="document-list">
            {documentLibrary.map((file) => (
              <li
                key={file.id}
                className={`document-item ${activeFile && file.id === activeFile.id ? 'active' : ''}`}
                onClick={() => handleFileSelect(file.id)}
              >
                {file.name}
              </li>
            ))}
          </ul>
          {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
        </aside>

        <main
          className="viewer-container"
          ref={viewerContainerRef}
          style={{ overflowY: 'auto' }}
        >
          {activeFile ? (
            <div className="pdf-display-area" onMouseUp={handleTextSelection}>
              <Document
                key={activeFile.id}
                file={activeFile.url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="loader"></div>}
                error={<div className="error-placeholder">Failed to load PDF.</div>}
              >
                {Array.from(new Array(numPages || 0), (el, index) => (
                  <div key={`page_wrapper_${index + 1}`} id={`page-${index + 1}`}>
                    <Page pageNumber={index + 1} renderTextLayer={true} />
                  </div>
                ))}
              </Document>
            </div>
          ) : (
            <div className="placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 17H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M7.5 10C7.5 8.61929 8.61929 7.5 10 7.5C11.3807 7.5 12.5 8.61929 12.5 10C12.5 11 11.8333 12 11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16.5 10C16.5 8.61929 15.3807 7.5 14 7.5C12.6193 7.5 11.5 8.61929 11.5 10C11.5 11 12.1667 12 13 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <p>Upload PDFs to begin your analysis</p>
            </div>
          )}
        </main>

        <aside className="right-panel">
          <div className="vertical-tabs">
            <button className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')} title="Chat">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 11.5C21 16.7467 16.7467 21 11.5 21C11.0858 21 10.6759 20.9825 10.2721 20.9483C9.83984 20.9118 9.41323 20.8521 9 20.77C5.96 20.22 3.78 17.04 3.23 13C3.08 12.5 3 12 3 11.5C3 6.25329 7.25329 2 12.5 2C17.7467 2 22 6.25329 22 11.5C22 11.643 21.9959 11.7852 21.9878 11.9263" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')} title="Insights">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.25C6.47715 2.25 2 6.72715 2 12.25C2 17.25 6.47715 22.25 12 22.25C17.5228 22.25 22 17.25 22 12.25C22 6.72715 17.5228 2.25 12 2.25Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 16.25V12.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 8.25H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className={`tab-button ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')} title="Quiz">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7745 7.52252 14.2844 8.06912C14.7944 8.61672 15.1398 9.31638 15.2661 10.06C15.2661 12 12.2661 13 12.2661 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className={`tab-button ${activeTab === 'presentation' ? 'active' : ''}`} onClick={() => setActiveTab('presentation')} title="Presentation">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21H4C3.46957 21 2.96086 20.7893 2.58579 20.4142C2.21071 20.0391 2 19.5304 2 19V5C2 4.46957 2.21071 3.96086 2.58579 3.58579C2.96086 3.21071 3.46957 3 4 3H8L10 6H16L18 3H20C20.5304 3 21.0391 3.21071 21.4142 3.58579C21.7893 3.96086 22 4.46957 22 5V19C22 19.5304 21.7893 20.0391 21.4142 20.4142C21.0391 20.7893 20.5304 21 20 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            <button className={`tab-button ${activeTab === 'translate' ? 'active' : ''}`} onClick={() => setActiveTab('translate')} title="Translate">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 11V8C4 7.46957 4.21071 6.96086 4.58579 6.58579C4.96086 6.21071 5.46957 6 6 6H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 11H13C13.5304 11 14.0391 11.2107 14.4142 11.5858C14.7893 11.9609 15 12.4696 15 13V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 20H18C18.5304 20 19.0391 19.7893 19.4142 19.4142C19.7893 19.0391 20 18.5304 20 18V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M11 4L7 8L11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M17 14L21 18L17 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>

          {/* IMPORTANT: panel-content is now a flex column with full height so inner panels can align */}
          <div className="panel-content">
             {activeTab === 'chat' && (
              <div className="chat-panel">
                <div className="chat-messages">
                  {messages.map((msg, index) => (
                    <div key={index} className={`chat-bubble ${msg.sender}`}>
                      {msg.text}
                    </div>
                  ))}
                  {isChatLoading && (
                    <div className="chat-bubble ai">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question..."
                    disabled={isChatLoading || documentLibrary.length === 0}
                  />
                  <button type="submit" disabled={isChatLoading || !chatInput.trim()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'insights' && (
              <div className="insights-panel">
                <div className="ai-insights-section">
                  <button onClick={handleGenerateInsights} disabled={!activeFile || isLoadingInsights} className="insights-button">
                    <span>{isLoadingInsights ? 'Generating...' : 'Generate AI Insights'}</span>
                  </button>
                  {isLoadingInsights && <div className="loader-small"></div>}
                  {aiInsights && (
                    <div className="insights-container">
                      <InsightCard icon="🔑" title="Key Insights" content={aiInsights.keyInsights} />
                      <InsightCard icon="💡" title="Did You Know?" content={aiInsights.didYouKnow} />
                      <InsightCard icon="🤔" title="Contradictions" content={aiInsights.contradictions} />
                      <InsightCard icon="🔗" title="Connections" content={aiInsights.connections} />
                      <div className="podcast-section">
                        <button onClick={handleGeneratePodcast} disabled={isLoadingPodcast || !aiInsights} className="podcast-button">
                          <span>{isLoadingPodcast ? 'Synthesizing...' : 'Generate Podcast'}</span>
                        </button>
                        {isLoadingPodcast && <div className="loader-small"></div>}
                        {podcastUrl && (
                          <audio controls src={podcastUrl} className="audio-player">
                            Your browser does not support the audio element.
                          </audio>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <hr className="section-divider" />
                <h2>Related Sections</h2>
                {isLoadingRecs && <div className="loader-small"></div>}
                <div className="recommendations-list">
                  {recommendations.length > 0 ? recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-card">
                      <h4 className="section-title">{rec.sectionTitle}</h4>
                      <p className="snippet">"{rec.snippet}"</p>
                      <div className="source-container">
                        <p className="source">
                          From: <strong>{rec.sourceDoc}</strong>
                          <span>&nbsp;•&nbsp;Page {normalizeToOneBasedPage(rec)}</span>
                        </p>
                        <button className="goto-button" onClick={() => handleGoToSource(rec)}>Go to Source</button>
                      </div>
                    </div>
                  )) : (
                    <p className="placeholder-rec">Select text in the PDF to find related sections.</p>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'quiz' && (
              <div className="quiz-panel">
                {!quiz ? (
                  <>
                    <h2>Test Your Knowledge</h2>
                    <p className="placeholder-rec">Generate a quiz to test your understanding of the current document.</p>
                    <button onClick={handleGenerateQuiz} disabled={!activeFile || isLoadingQuiz} className="quiz-button">
                      <span>{isLoadingQuiz ? 'Generating...' : 'Start Quiz'}</span>
                    </button>
                    {isLoadingQuiz && <div className="loader-small"></div>}
                  </>
                ) : currentQuestionIndex < quiz.length ? (
                  <div className="quiz-container">
                    <div className="quiz-header">
                      <h3>Question {currentQuestionIndex + 1} of {quiz.length}</h3>
                      <p className="quiz-question">{quiz[currentQuestionIndex].question}</p>
                    </div>
                    <div className="quiz-options">
                      {quiz[currentQuestionIndex].options.map((option, index) => {
                        const isCorrect = option === quiz[currentQuestionIndex].correctAnswer;
                        let optionClass = 'quiz-option';
                        if (showAnswer && isCorrect) optionClass += ' correct';
                        else if (showAnswer && selectedAnswer === option && !isCorrect) optionClass += ' incorrect';
                        return (
                          <button key={index} className={optionClass} onClick={() => handleAnswerSelect(option)} disabled={showAnswer}>
                            {option}
                          </button>
                        );
                      })}
                    </div>
                    {showAnswer && (
                      <button onClick={handleNextQuestion} className="quiz-button">Next Question</button>
                    )}
                  </div>
                ) : (
                  <div className="quiz-results">
                    <h2>Quiz Complete!</h2>
                    <p className="score">Your Score: {quizScore} / {quiz.length}</p>
                    <button onClick={handleGenerateQuiz} className="quiz-button">Try Again</button>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'presentation' && (
              <div className="presentation-panel">
                {!presentation ? (
                  <>
                    <h2>AI Presentation</h2>
                    <p className="placeholder-rec">Generate a 5-slide presentation summarizing the key points of the current document.</p>
                    <button onClick={handleGeneratePresentation} disabled={!activeFile || isLoadingPresentation} className="quiz-button">
                      <span>{isLoadingPresentation ? 'Generating...' : 'Generate Presentation'}</span>
                    </button>
                    {isLoadingPresentation && <div className="loader-small"></div>}
                  </>
                ) : (
                  <div className="presentation-container">
                    <div className="slide">
                      <h3 className="slide-title">{presentation[currentSlideIndex].title}</h3>
                      <ul className="slide-content">
                        {presentation[currentSlideIndex].content.map((point, i) => <li key={i}>{point}</li>)}
                      </ul>
                    </div>
                    <div className="slide-nav">
                      <button onClick={handlePrevSlide} disabled={currentSlideIndex === 0}>Previous</button>
                      <span>Slide {currentSlideIndex + 1} of {presentation.length}</span>
                      <button onClick={handleNextSlide} disabled={currentSlideIndex === presentation.length - 1}>Next</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -----------------------
                TRANSLATE PANEL (fixed to bottom nav)
               ----------------------- */}
            {activeTab === 'translate' && (
              <div className="translate-panel">
                <h2>Translate Selection</h2>
                {selectedText ? (
                  <>
                    <div className="translate-box selected">
                      <h3>Selected Text</h3>
                      <p style={{ whiteSpace: 'pre-wrap' }}>{selectedText}</p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 8, marginBottom: 8, alignItems: 'center' }}>
                      <button onClick={handleTranslate} disabled={isTranslating} className="quiz-button" style={{ flex: '0 0 auto' }}>
                        <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
                      </button>
                      <div style={{ color: '#9CA3AF', fontSize: 13 }}>
                        {translations.length > 0 ? `${currentTranslationIndex + 1} / ${translations.length} translations` : 'No translations yet'}
                      </div>
                    </div>

                    {/* scrollable translations area */}
                    <div className="translate-scroll">
                      {translations.length === 0 && (
                        <div className="translate-box">
                          <h3>Hindi</h3>
                          <p style={{ color: '#9CA3AF' }}>No translation yet. Click Translate.</p>
                          <h3 style={{ marginTop: 12 }}>French</h3>
                          <p style={{ color: '#9CA3AF' }}>No translation yet. Click Translate.</p>
                        </div>
                      )}

                      {translations.length > 0 && (
                        <>
                          <div className="translate-box current">
                            <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{translations[currentTranslationIndex].language}</span>
                              <span style={{ fontSize: 12, color: '#9CA3AF' }}>{currentTranslationIndex + 1} / {translations.length}</span>
                            </h3>
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{translations[currentTranslationIndex].text}</p>
                          </div>

                          <div style={{ marginTop: 8 }}>
                            {translations.map((t, idx) => (
                              <div key={idx} style={{ marginBottom: 8, opacity: idx === currentTranslationIndex ? 1 : 0.85 }}>
                                <strong style={{ fontSize: 13 }}>{t.language}:</strong>
                                <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>{t.text}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* pinned nav at bottom (margin-top: auto ensures it stays at bottom of the translate-panel) */}
                    <div className="translate-nav">
                      <button
                        onClick={handlePrevTranslation}
                        disabled={currentTranslationIndex === 0 || translations.length === 0}
                        className="quiz-button"
                      >
                        ⬅ Previous
                      </button>

                      <button
                        onClick={() => {
                          const text = translations[currentTranslationIndex]?.text || '';
                          if (text) {
                            navigator.clipboard?.writeText(text).catch(() => {});
                          }
                        }}
                        disabled={translations.length === 0}
                        className="quiz-button"
                      >
                        Copy
                      </button>

                      <button
                        onClick={handleNextTranslation}
                        disabled={currentTranslationIndex === translations.length - 1 || translations.length === 0}
                        className="quiz-button"
                      >
                        Next ➡
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="placeholder-rec">Select text in the PDF to translate it.</p>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;

