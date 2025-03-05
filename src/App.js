import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Game from './components/Game';

function App() {
  // Get the base URL for GitHub Pages
  const baseUrl = process.env.PUBLIC_URL || '';
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const audioRef = useRef(null);
  
  // Track window focus/blur
  useEffect(() => {
    const handleFocus = () => {
      setIsFocused(true);
      // Resume audio when focus returns if it was playing before
      if (audioRef.current && audioInitialized && !isMuted) {
        audioRef.current.play().catch(e => console.log("Couldn't resume audio:", e));
      }
    };
    
    const handleBlur = () => {
      setIsFocused(false);
      // Pause audio when focus is lost
      if (audioRef.current && audioInitialized) {
        audioRef.current.pause();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    // Check initial focus state
    setIsFocused(document.hasFocus());
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [audioInitialized, isMuted]);
  
  // Preload audio file as soon as component mounts
  useEffect(() => {
    // Create an audio element for preloading
    const audioPreload = new Audio(`${baseUrl}/audio/background-music.mp3`);
    
    // Set up event listeners for the preload audio element
    audioPreload.addEventListener('canplaythrough', () => {
      console.log("Audio file preloaded successfully");
      setAudioLoaded(true);
    });
    
    audioPreload.addEventListener('error', (e) => {
      console.error("Error preloading audio:", e);
      setAudioLoaded(true); // Still set to true to avoid blocking the app
    });
    
    // Start loading the audio file
    audioPreload.load();
    
    return () => {
      audioPreload.removeEventListener('canplaythrough', () => {});
      audioPreload.removeEventListener('error', () => {});
    };
  }, [baseUrl]);
  
  // Add a loading effect for a more polished experience
  useEffect(() => {
    // Only finish loading when both timer completes AND audio is loaded
    const timer = setTimeout(() => {
      if (audioLoaded) {
        setIsLoading(false);
      } else {
        // If audio is taking too long, proceed anyway after another second
        const backupTimer = setTimeout(() => {
          setIsLoading(false);
          console.log("Proceeding without fully loaded audio");
        }, 1000);
        
        return () => clearTimeout(backupTimer);
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [audioLoaded]);
  
  // Initialize background music
  useEffect(() => {
    if (!isLoading && audioRef.current && !audioInitialized) {
      audioRef.current.volume = 0.1; // Set volume to 10%
      
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
        audioRef.current.volume = 0.1; // Set volume to 10%
        audioRef.current.play().catch(e => console.log("Couldn't play audio:", e));
      } else {
        audioRef.current.volume = 0;
      }
      setIsMuted(!isMuted);
      setAudioInitialized(true);
    }
  };
  
  return (
    <div className={`App ${isLoading ? 'loading' : 'loaded'} ${!isFocused ? 'unfocused' : ''}`}>
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
            <p className="loading-message">
              {audioLoaded ? "The mansion awaits your arrival..." : "Loading audio..."}
            </p>
            {!audioLoaded && (
              <p className="loading-hint">(Click anywhere to start the experience)</p>
            )}
          </div>
        </div>
      ) : (
        <>
          {!isFocused && (
            <div className="focus-reminder" onClick={() => window.focus()}>
              <div className="focus-reminder-content">
                <h2>The Darkness Awaits Your Return...</h2>
                <p>Click to continue your journey</p>
              </div>
            </div>
          )}
          
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
                <a href="https://github.com/imdvls/GothicRPG" target="_blank" rel="noopener noreferrer" className="nav-link">
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
                  href="https://github.com/imdvls/GothicRPG/issues" 
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
