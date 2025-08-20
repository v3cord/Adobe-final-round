import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './App.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.mjs`;

/* -------------------------------------------------------------------------- */
/* NEW THEME SWITCHER COMPONENT                                               */
/* -------------------------------------------------------------------------- */
const ThemeSwitcher = ({ theme, onThemeChange, readingIntensity, onIntensityChange }) => {
  return (
    <div className="theme-switcher">
      <button
        className={`theme-btn ${theme === 'day' ? 'active' : ''}`}
        onClick={() => onThemeChange('day')}
        title="Day Mode"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 1V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 21V23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4.22 4.22L5.64 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.36 18.36L19.78 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 4.22L2.12 5.64" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.36 5.64L19.78 4.22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M1 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M21 12H23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4.22 19.78L5.64 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.36 19.78L19.78 18.36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button
        className={`theme-btn ${theme === 'night' ? 'active' : ''}`}
        onClick={() => onThemeChange('night')}
        title="Night Mode"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 12.79C21 17.02 17.52 20.5 13.29 20.5C10.93 20.5 8.81 19.45 7.4 17.88C7.31 17.76 7.22 17.64 7.12 17.52C4.14 15.17 3.5 11.23 4.93 7.82C6.35 4.41 9.77 2.5 13.29 2.5C13.5 2.5 13.71 2.5 13.91 2.52C13.88 3.54 14.24 4.53 14.9 5.31C16.44 6.99 18.66 7.55 20.61 6.83C20.84 8.7 21 10.7 21 12.79Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <div className="reading-mode-controls">
        <button
          className={`theme-btn ${theme === 'reading' ? 'active' : ''}`}
          onClick={() => onThemeChange('reading')}
          title="Reading Mode"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2V3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7V3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {theme === 'reading' && (
          <input
            type="range"
            min="0"
            max="100"
            value={readingIntensity}
            onChange={(e) => onIntensityChange(e.target.value)}
            className="intensity-slider"
            title={`Filter intensity: ${readingIntensity}%`}
          />
        )}
      </div>
    </div>
  );
};
/* -------------------------------------------------------------------------- */
/* PRESENTATIONAL & UI COMPONENTS                                             */
/* -------------------------------------------------------------------------- */

const InsightCard = ({ title, content, icon }) => (
  <div className="insight-card">
    <h3 className="insight-title">
      <span role="img" aria-label="icon" className="insight-icon">{icon}</span>
      {title}
    </h3>
    <p className="insight-content">{content}</p>
  </div>
);

// PASTE THIS NEW COMPONENT
const LandingPage = ({ onStart }) => (
  <div className="hero-section">
    <div className="title-container">
      <h1>MUNIX</h1>
      {/* THIS LINE IS NOW CORRECTED */}
      <button className="pulsating-button" onClick={onStart}>GET STARTED</button>
    </div>
  </div>
);

const AppHeader = ({ onFileChange, onToggleSidebar, theme, onThemeChange, readingIntensity, onIntensityChange }) => (
  <header className="App-header">
    <div className="logo">

      <button onClick={onToggleSidebar} className="sidebar-toggle-button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <h1>Munix</h1>
    </div>
    <ThemeSwitcher
      theme={theme}
      onThemeChange={onThemeChange}
      readingIntensity={readingIntensity}
      onIntensityChange={onIntensityChange}
    />
    <label htmlFor="file-upload" className="file-upload-label">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 8L12 3L7 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span>Add PDFs</span>
    </label>
    <input id="file-upload" onChange={onFileChange} type="file" multiple />
  </header>
);

const Sidebar = ({ documentLibrary, activeFile, handleFileSelect, uploadStatus, handleRemoveDocument }) => (
  <aside className="sidebar">
    <h2>
      Document Library
    </h2>
    <ul className="document-list">
      {documentLibrary.map((file) => (
        <li
          key={file.id}
          className={`document-item ${activeFile && file.id === activeFile.id ? 'active' : ''}`}
          onClick={() => handleFileSelect(file.id)}
        >
          <span className="document-name">{file.name}</span>
          <button
            className="remove-doc-button"
            title="Remove document"
            onClick={(e) => {
              e.stopPropagation(); // Prevents the li's onClick from firing
              handleRemoveDocument(file.id);
            }}
          >
            &times;
          </button>
        </li>
      ))}
    </ul>
    {uploadStatus && <p className="upload-status">{uploadStatus}</p>}
  </aside>
);

const Viewer = ({ activeFile, numPages, onDocumentLoadSuccess, handleTextSelection, viewerContainerRef, scale, isFullScreen }) => (
  <main className="viewer-container" ref={viewerContainerRef}>
    {activeFile ? (
      <>
        <div className="pdf-display-area" onMouseUp={handleTextSelection}>
          <Document
            key={`${activeFile.id}-${isFullScreen}`}
            file={activeFile.url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="loader"></div>}
            error={<div className="error-placeholder">Failed to load PDF.</div>}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div key={`page_wrapper_${index + 1}`} id={`page-${index + 1}`} data-page-number={index + 1}>
                <Page pageNumber={index + 1} renderTextLayer={true} scale={scale} />
              </div>
            ))}

          </Document>
        </div>
      </>
    ) : (
      <div className="placeholder">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 17H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 14V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M7.5 10C7.5 8.61929 8.61929 7.5 10 7.5C11.3807 7.5 12.5 8.61929 12.5 10C12.5 11 11.8333 12 11 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M16.5 10C16.5 8.61929 15.3807 7.5 14 7.5C12.6193 7.5 11.5 8.61929 11.5 10C11.5 11 12.1667 12 13 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <p>Upload PDFs to begin your analysis</p>
      </div>
    )}
  </main>
);

/* -------------------------------------------------------------------------- */
/* INTERACTIVE PANELS                                                         */
/* -------------------------------------------------------------------------- */

const ChatPanel = ({ messages, isChatLoading, chatEndRef, handleSendMessage, chatInput, setChatInput, documentLibrary }) => (
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </form>
  </div>
);

const InsightsPanel = ({ activeFile, isLoadingInsights, aiInsights, handleGenerateInsights, isLoadingPodcast, podcastUrl, handleGeneratePodcast, isLoadingRecs, recommendations, normalizeToOneBasedPage, handleGoToSource, handleReturnToSource, selectionSource }) => (
  <div className="insights-panel">
    <div className="ai-insights-section">
      <button onClick={handleGenerateInsights} disabled={!activeFile || isLoadingInsights} className="insights-button">
        <span>{isLoadingInsights ? 'Generating...' : 'Generate AI Insights'}</span>
      </button>
      {isLoadingInsights && <div className="loader-small"></div>}
      {aiInsights && (
        <div className="insights-container">
          <InsightCard icon="💡" title="Key Insights" content={aiInsights.keyInsights} />
          <InsightCard icon="🎓" title="Did You Know?" content={aiInsights.didYouKnow} />
          <InsightCard icon="↔️" title="Contradictions" content={aiInsights.contradictions} />
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
    <div className="related-sections-header">
      <h2>Related Sections</h2>
      {selectionSource && (
        <button className="return-button" onClick={handleReturnToSource} data-tooltip="Return">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
          </svg>
        </button>
      )}
    </div>
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
);

const QuizPanel = ({ quiz, activeFile, isLoadingQuiz, handleGenerateQuiz, currentQuestionIndex, showAnswer, selectedAnswer, handleAnswerSelect, handleNextQuestion, quizScore }) => (
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
    ) : quiz.length === 0 ? (
      <div className="quiz-empty">
        <h3>No questions could be generated</h3>
        <p className="placeholder-rec">Try a different document or click below to retry.</p>
        <button onClick={handleGenerateQuiz} disabled={!activeFile || isLoadingQuiz} className="quiz-button">
          <span>{isLoadingQuiz ? 'Generating...' : 'Retry'}</span>
        </button>
      </div>
    ) : currentQuestionIndex < quiz.length ? (
      <div className="quiz-container">
        <div className="quiz-header">
          <h3>Question {currentQuestionIndex + 1} of {quiz.length}</h3>
          <p className="quiz-question">{quiz[currentQuestionIndex]?.question}</p>
        </div>
        <div className="quiz-options">
          {(quiz[currentQuestionIndex]?.options || []).map((option, index) => {
            const isCorrect = option === quiz[currentQuestionIndex]?.correctAnswer;
            let optionClass = 'quiz-option';
            if (showAnswer && isCorrect) optionClass += ' correct';
            else if (showAnswer && selectedAnswer === option && !isCorrect) optionClass += ' incorrect';
            return (
              <button key={`${currentQuestionIndex}-${index}-${String(option)}`} className={optionClass} onClick={() => handleAnswerSelect(option)} disabled={showAnswer}>
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
);

const PresentationPanel = ({ presentation, activeFile, isLoadingPresentation, handleGeneratePresentation, currentSlideIndex, handlePrevSlide, handleNextSlide }) => (
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
          <span>{currentSlideIndex + 1} / {presentation.length}</span>
          <button onClick={handleNextSlide} disabled={currentSlideIndex === presentation.length - 1}>Next</button>
        </div>
      </div>
    )}
  </div>
);

const TranslatePanel = ({ selectedText, isTranslating, translations, currentTranslationIndex, handleTranslate, handlePrevTranslation, handleNextTranslation }) => (
  <div className="translate-panel">
    <h2>Translate Selection</h2>
    {selectedText ? (
      <>
        <div className="translate-box source-text">
          <h3>Selected Text</h3>
          <p>{selectedText}</p>
        </div>
        <div className="translate-action-bar">
          <button onClick={handleTranslate} disabled={!selectedText || isTranslating} className="quiz-button">
            <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
          </button>
          {isTranslating && <div className="loader-small"></div>}
        </div>
        <div className="translate-results">
          {translations.length > 0 ? (
            <div className="translate-box translated-text">
              <h3>{translations.length > 1 ? translations[currentTranslationIndex].language : 'Translation'}</h3>
              <p>{translations[currentTranslationIndex].text}</p>
            </div>
          ) : (
            <div className="placeholder-rec">
              Translations will appear here.
            </div>
          )}
        </div>
        <div className="translate-nav">
          <button
            className="nav-button"
            onClick={handlePrevTranslation}
            disabled={currentTranslationIndex === 0 || translations.length === 0}
            title="Previous translation"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {translations.length > 1 && (
            <span className="translation-count">
              {currentTranslationIndex + 1} / {translations.length}
            </span>
          )}
          <button
            className="nav-button"
            onClick={handleNextTranslation}
            disabled={currentTranslationIndex >= translations.length - 1 || translations.length === 0}
            title="Next translation"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      </>
    ) : (
      <p className="placeholder-rec">Select text in the PDF to translate it.</p>
    )}
  </div>
);


/* -------------------------------------------------------------------------- */
/* RIGHT PANEL (Tab Container)                                                */
/* -------------------------------------------------------------------------- */

const RightPanel = (props) => {
  const { activeTab, setActiveTab, currentPage, numPages, handleZoomIn, handleZoomOut, hasActiveFile, toggleFullScreen } = props;

  const renderPanel = () => {
    switch (activeTab) {
      case 'chat': return <ChatPanel {...props.chatProps} />;
      case 'insights': return <InsightsPanel {...props.insightsProps} />;
      case 'quiz': return <QuizPanel {...props.quizProps} />;
      case 'presentation': return <PresentationPanel {...props.presentationProps} />;
      case 'translate': return <TranslatePanel {...props.translateProps} />;
      default: return null;
    }
  };

  return (
    <aside className="right-panel">
      <div className="vertical-tabs">
        <div className="tab-buttons-group">
          <button className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')} data-tooltip="Chat">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </button>
          <button className={`tab-button ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')} data-tooltip="Insights">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </button>
          <button className={`tab-button ${activeTab === 'quiz' ? 'active' : ''}`} onClick={() => setActiveTab('quiz')} data-tooltip="Quiz">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7745 7.52252 14.2844 8.06912C14.7944 8.61672 15.1398 9.31638 15.2661 10.06C15.2661 12 12.2661 13 12.2661 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button className={`tab-button ${activeTab === 'presentation' ? 'active' : ''}`} onClick={() => setActiveTab('presentation')} data-tooltip="Presentation">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </button>
          <button className={`tab-button ${activeTab === 'translate' ? 'active' : ''}`} onClick={() => setActiveTab('translate')} data-tooltip="Translate">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </button>
          <button className="tab-button" onClick={props.toggleFullScreen} data-tooltip="Full Screen">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
          </button>
        </div>

        <div className="viewer-controls">
          <button className="tab-button" data-tooltip="Zoom In" onClick={handleZoomIn} disabled={!hasActiveFile}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>
          <div className="page-indicator">
            {hasActiveFile ? `${currentPage} / ${numPages}` : '- / -'}
          </div>

          <button className="tab-button" data-tooltip="Zoom Out" onClick={handleZoomOut} disabled={!hasActiveFile}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>
        </div>
      </div>
      <div className="panel-content">
        {renderPanel()}
      </div>
    </aside>
  );
};


/* -------------------------------------------------------------------------- */
/* MAIN APP                                                                   */
/* -------------------------------------------------------------------------- */

function App() {
  // --- STATE MANAGEMENT ---
  const [appState, setAppState] = useState('landing');
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [theme, setTheme] = useState('night'); // 'night', 'day', 'reading'
  const [readingIntensity, setReadingIntensity] = useState(50); // 0 to 100
  const [activeFile, setActiveFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false); // ADD THIS LINE
  const [documentLibrary, setDocumentLibrary] = useState([]);
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
  const [quiz, setQuiz] = useState(null);
  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const [selectedText, setSelectedText] = useState('');
  const [translations, setTranslations] = useState([]);
  const [currentTranslationIndex, setCurrentTranslationIndex] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);

  const [presentation, setPresentation] = useState(null);
  const [isLoadingPresentation, setIsLoadingPresentation] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const [scrollToPage, setScrollToPage] = useState(null);

  const [scale, setScale] = useState(1.0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectionSource, setSelectionSource] = useState(null);

  // --- REFS ---
  const viewerContainerRef = useRef(null);
  const chatEndRef = useRef(null);

  // --- EFFECTS ---
  // --- EFFECTS ---
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      if (el) {
        tryScroll();
        clearInterval(intervalId);
      }
    }, 100);
    return () => clearInterval(intervalId);
  }, [scrollToPage, numPages, activeFile]);

  useEffect(() => {
    if (translations.length > 0) {
      setActiveTab('translate');
    }
  }, [translations, setActiveTab]);

  useEffect(() => {
    const viewer = viewerContainerRef.current;
    if (!viewer || !numPages) return;

    const options = {
      root: isFullScreen ? null : viewer,
      rootMargin: '0px',
      // 1. LOWERED THE THRESHOLD: Detects page visibility much sooner.
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      // 2. IMPROVED LOGIC: Find all pages currently intersecting with the viewer.
      const visiblePages = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => parseInt(entry.target.dataset.pageNumber, 10));

      // If there are any visible pages, update the state to the highest page number.
      // This correctly reflects the page the user has scrolled to.
      if (visiblePages.length > 0) {
        setCurrentPage(Math.max(...visiblePages));
      }
    }, options);

    const pageElements = viewer.querySelectorAll('div[id^="page-"]');
    pageElements.forEach(page => observer.observe(page));

    return () => observer.disconnect();
  }, [activeFile, numPages, isFullScreen]);


  // --- UTILITY FUNCTIONS ---
  const normalizeToOneBasedPage = (recOrPage) => {
    if (typeof recOrPage === 'number') {
      const n = Math.trunc(recOrPage);
      return n >= 1 ? n : n + 1;
    }
    if (recOrPage && typeof recOrPage === 'object' && recOrPage.pageNumber) {
      let p = Number(recOrPage.pageNumber);
      return Math.max(1, Math.trunc(p + 1));
    }
    return 1;
  };

  // <-- ADDED: Function to toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarVisible(prev => !prev);
  };

  const toggleFullScreen = () => {
    const doc = window.document;
    const docEl = document.documentElement;

    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    const cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      if (requestFullScreen) {
        requestFullScreen.call(docEl);
      }
    } else {
      if (cancelFullScreen) {
        cancelFullScreen.call(doc);
      }
    }
  };
  useEffect(() => {
    // When entering or exiting fullscreen, ensure the viewer scrolls to the top.
    if (viewerContainerRef.current) {
      viewerContainerRef.current.scrollTop = 0;
    }
  }, [isFullScreen]);

  // REPLACE your old fullscreen change listener hook with this one

  useEffect(() => {
    // This function now checks all browser-specific properties
    const handleFullScreenChange = () => {
      const is_full = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
      setIsFullScreen(is_full);
    };

    // We add listeners for all possible event names
    const events = [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "msfullscreenchange",
    ];

    events.forEach(event => {
      document.addEventListener(event, handleFullScreenChange);
    });

    // The cleanup function removes all the listeners
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullScreenChange);
      });
    };
  }, []); // Empty dependency array means this runs only once
  const handleRemoveDocument = (docIdToRemove) => {
    // If the currently viewed file is the one being removed, unload it first.
    if (activeFile?.id === docIdToRemove) {
      setActiveFile(null);
    }
    setDocumentLibrary(docs => docs.filter(doc => doc.id !== docIdToRemove));
  };

  // --- DATA FETCHING & EVENT HANDLERS ---
  const findRelatedByText = async (text) => {
    if (!text || !activeFile) return;
    setIsLoadingRecs(true);
    setRecommendations([]);
    setActiveTab('insights');
    try {
      const response = await axios.post('/find-by-text', { selectedText: text, currentDocumentId: activeFile.id });
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
      const [resHi, resFr] = await Promise.all([
        axios.post('/translate', { text: selectedText, targetLanguage: 'Hindi' }),
        axios.post('/translate', { text: selectedText, targetLanguage: 'French' })
      ]);
      const newTranslations = [
        { language: 'Hindi', text: resHi?.data?.translation || '' },
        { language: 'French', text: resFr?.data?.translation || '' }
      ];
      setTranslations(newTranslations);
    } catch (error) {
      console.error('Error translating text:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleNextTranslation = () => setCurrentTranslationIndex((idx) => Math.min(idx + 1, translations.length - 1));
  const handlePrevTranslation = () => setCurrentTranslationIndex((idx) => Math.max(idx - 1, 0));

  const handleTextSelection = () => {
    const selection = window.getSelection().toString().trim();
    if (selection.length > 5) {
      setSelectionSource({
        docId: activeFile.id,
        pageNumber: currentPage
      });
      setSelectedText(selection);
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
      if (!activeFile && fullLibrary.length > 0) handleFileSelect(fullLibrary[0].id);
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
      setActiveFile(null); setNumPages(null);
      setTimeout(() => {
        setActiveFile(fileToActivate);
        setAiInsights(null);
        setPodcastUrl(null);
        // reset quiz state when switching docs
        setQuiz(null);
        setIsLoadingQuiz(false);
        setCurrentQuestionIndex(0);
        setQuizScore(0);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setPresentation(null);
        setTranslations([]);
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

  // ---- FIXED: Robust quiz loading & normalization ----
  const handleGenerateQuiz = async () => {
    if (!activeFile) return;
    setActiveTab('quiz');
    setIsLoadingQuiz(true);
    setQuiz(null);
    try {
      const { data } = await axios.post('/generate-quiz', { documentId: activeFile.id });

      // Accept common payload shapes: array | {questions: []} | {quiz: []}
      const rawItems = Array.isArray(data) ? data : (data?.questions || data?.quiz || []);

      // Normalize each question to { question, options, correctAnswer }
      const normalized = (rawItems || []).map((q, idx) => ({
        question: q?.question || q?.prompt || `Question ${idx + 1}`,
        options: Array.isArray(q?.options) ? q.options : (Array.isArray(q?.choices) ? q.choices : []),
        correctAnswer: q?.correctAnswer ?? q?.answer ?? q?.correct ?? null
      }))
        // keep only well-formed items
        .filter(q => q.question && Array.isArray(q.options) && q.options.length > 0 && q.correctAnswer !== null);

      setQuiz(normalized);
      setCurrentQuestionIndex(0);
      setQuizScore(0);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } catch (error) {
      console.error('Error generating quiz:', error);
      // ensure quiz renders a friendly empty state rather than hanging
      setQuiz([]);
    } finally {
      setIsLoadingQuiz(false);
    }
  };

  const handleAnswerSelect = (option) => {
    if (showAnswer) return;
    setSelectedAnswer(option);
    setShowAnswer(true);
    if (quiz && quiz[currentQuestionIndex] && option === quiz[currentQuestionIndex].correctAnswer) {
      setQuizScore((score) => score + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex((index) => Math.min(index + 1, (quiz?.length || 1))); // clamp to avoid overflow
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

  const handleNextSlide = () => setCurrentSlideIndex((prev) => Math.min(prev + 1, presentation.length - 1));
  const handlePrevSlide = () => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));

  const handleZoomIn = () => setScale(prevScale => Math.min(prevScale + 0.2, 3.0));
  const handleZoomOut = () => setScale(prevScale => Math.max(prevScale - 0.2, 0.4));

  const handleReturnToSource = () => {
    if (!selectionSource) return;
    if (activeFile?.id === selectionSource.docId) {
      setScrollToPage(selectionSource.pageNumber);
    } else {
      handleFileSelect(selectionSource.docId);
      setTimeout(() => setScrollToPage(selectionSource.pageNumber), 150);
    }
  };

  // --- PROPS FOR CHILD COMPONENTS ---
  const rightPanelProps = {
    activeTab,
    setActiveTab,
    currentPage,
    numPages,
    handleZoomIn,
    handleZoomOut,
    hasActiveFile: !!activeFile,
    toggleFullScreen, // ADD THIS LINE
    chatProps: { messages, isChatLoading, chatEndRef, handleSendMessage, chatInput, setChatInput, documentLibrary },
    insightsProps: { activeFile, isLoadingInsights, aiInsights, handleGenerateInsights, isLoadingPodcast, podcastUrl, handleGeneratePodcast, isLoadingRecs, recommendations, normalizeToOneBasedPage, handleGoToSource, handleReturnToSource, selectionSource },
    quizProps: { quiz, activeFile, isLoadingQuiz, handleGenerateQuiz, currentQuestionIndex, showAnswer, selectedAnswer, handleAnswerSelect, handleNextQuestion, quizScore },
    presentationProps: { presentation, activeFile, isLoadingPresentation, handleGeneratePresentation, currentSlideIndex, handlePrevSlide, handleNextSlide },
    translateProps: { selectedText, isTranslating, translations, currentTranslationIndex, handleTranslate, handlePrevTranslation, handleNextTranslation }
  };

  // --- RENDER ---
  if (appState === 'landing') {
    return <LandingPage onStart={() => {
      console.log("Get Started button was clicked!"); // <-- ADD IT HERE
      setAppState('engine');
    }} />;
  }

  return (
    <div className={`App ${theme} ${isFullScreen ? 'fullscreen-mode' : ''}`}>
      {theme === 'reading' && (
        <div
          className="reading-mode-overlay"
          style={{ opacity: readingIntensity / 100 * 0.4 }} // Max opacity of 40%
        ></div>
      )}
      <AppHeader
        onFileChange={onFileChange}
        onToggleSidebar={toggleSidebar}
        theme={theme}
        onThemeChange={setTheme}
        readingIntensity={readingIntensity}
        onIntensityChange={setReadingIntensity}
      />
      <div className={`main-content ${isSidebarVisible ? '' : 'sidebar-hidden'}`}>
        <Sidebar
          documentLibrary={documentLibrary}
          activeFile={activeFile}
          handleFileSelect={handleFileSelect}
          uploadStatus={uploadStatus}
          handleRemoveDocument={handleRemoveDocument}
        />
        <Viewer
          activeFile={activeFile}
          numPages={numPages}
          onDocumentLoadSuccess={onDocumentLoadSuccess}
          handleTextSelection={handleTextSelection}
          viewerContainerRef={viewerContainerRef}
          scale={scale}
          isFullScreen={isFullScreen}
        />
        <RightPanel {...rightPanelProps} />
      </div>


      {isFullScreen && activeFile && (
        <div className="fullscreen-controls">
          <button onClick={handleZoomOut} title="Zoom Out">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>

          {/* ADD THIS DIV FOR THE PAGE INDICATOR */}


          <button onClick={handleZoomIn} title="Zoom In">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
          </button>
          <button onClick={toggleFullScreen} className="exit-fullscreen-button" title="Exit Full Screen">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 19L19 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M19 19L5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;