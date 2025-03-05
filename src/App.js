import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Game from './components/Game';

function App() {
  // Get the base URL for GitHub Pages
  const baseUrl = process.env.PUBLIC_URL || '';
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const audioRef = useRef(null);
  
  // Add a loading effect for a more polished experience
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Initialize background music
  useEffect(() => {
    if (!isLoading && audioRef.current && !audioInitialized) {
      audioRef.current.volume = 0.1; // Set volume to 10% (reduced from 30%)
      
      // Try to play the audio
      const playAudio = () => {
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Audio playback started successfully");
              setAudioInitialized(true);
            })
            .catch(error => {
              console.log("Auto-play prevented by browser:", error);
              // We'll rely on the user clicking the sound button to start playback
            });
        }
      };
      
      playAudio();
      
      // Add a click event listener to the document to start audio on first user interaction
      const handleFirstInteraction = () => {
        if (!audioInitialized && audioRef.current) {
          playAudio();
        }
      };
      
      document.addEventListener('click', handleFirstInteraction, { once: true });
      
      return () => {
        document.removeEventListener('click', handleFirstInteraction);
      };
    }
  }, [isLoading, audioInitialized]);
  
  // Handle mute/unmute
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = 0.1; // Set volume to 10% (reduced from 30%)
        audioRef.current.play().catch(e => console.log("Couldn't play audio:", e));
      } else {
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
      setAudioInitialized(true);
    }
  };
  
  return (
    <div className={`App ${isLoading ? 'loading' : 'loaded'}`}>
      {/* Background Music */}
      <audio 
        ref={audioRef}
        src={`${baseUrl}/audio/background-music.mp3`} 
        loop 
        preload="auto"
      />
      
      {isLoading ? (
        <div className="loading-screen">
          <div className="loading-content">
            <h1 className="loading-title">Whispers in the Dark</h1>
            <div className="loading-spinner"></div>
            <p className="loading-message">The mansion awaits your arrival...</p>
          </div>
        </div>
      ) : (
        <>
          <header className="game-header">
            <div className="header-content">
              <div>
                <a href={baseUrl + '/'} className="game-logo">Whispers in the Dark</a>
                <div className="game-tagline">Where shadows speak and nightmares breathe</div>
              </div>
              <nav className="header-nav">
                <button 
                  className="sound-toggle nav-link" 
                  onClick={toggleMute}
                  title={isMuted ? "Unmute background music" : "Mute background music"}
                >
                  <span className="nav-icon">{isMuted ? "🔇" : "🔊"}</span>
                  <span className="nav-text">{isMuted ? "Unmute" : "Mute"}</span>
                </button>
                <a href="https://github.com/imdvls/textbased-rpg" target="_blank" rel="noopener noreferrer" className="nav-link">
                  <span className="nav-icon">📖</span>
                  <span className="nav-text">GitHub</span>
                </a>
              </nav>
            </div>
          </header>
          
          <main>
            <Game />
          </main>
          
          <footer className="game-footer">
            <div className="footer-content">
              <div className="footer-info">
                <div className="copyright">© {new Date().getFullYear()} Gothic Horror Adventures</div>
                <div className="footer-tagline">A text-based journey into darkness</div>
              </div>
              <div className="footer-links">
                <span className="footer-link" title="About the game">About</span>
                <span className="footer-link" title="Game credits">Credits</span>
                <a 
                  href="https://github.com/imdvls/textbased-rpg/issues" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="footer-link"
                >
                  Feedback
                </a>
              </div>
            </div>
            <div className="footer-disclaimer">
              <p>Best experienced in a dark room with headphones.</p>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
