import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Sparkles, RefreshCw } from 'lucide-react';

export default function InterviewerSpeaker({ textToSpeak, autoPlay = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [voices, setVoices] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const heartbeatRef = useRef(null);

  // Preload and monitor available voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const updateVoices = () => {
      const vList = window.speechSynthesis.getVoices();
      if (vList && vList.length > 0) {
        setVoices(vList);
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Chrome 14-second cutoff watchdog timer
  useEffect(() => {
    if (isPlaying && !usingFallback && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      heartbeatRef.current = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    } else {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    }

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [isPlaying, usingFallback]);

  // Clean up audio on unmount or question change
  useEffect(() => {
    stopAllAudio();

    if (autoPlay && textToSpeak && !isMuted) {
      // Small timeout to allow user interaction context
      const timer = setTimeout(() => {
        speakText();
      }, 200);
      return () => clearTimeout(timer);
    }

    return () => {
      stopAllAudio();
    };
  }, [textToSpeak]);

  const stopAllAudio = () => {
    // Stop native Web Speech API
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }

    // Stop fallback HTML5 Audio
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (e) {}
      audioRef.current = null;
    }

    setIsPlaying(false);
    setUsingFallback(false);
  };

  const playFallbackAudio = (text) => {
    stopAllAudio();
    try {
      setUsingFallback(true);
      // Clean string for standard TTS audio stream
      const sanitized = encodeURIComponent(text.replace(/[\n\r]+/g, ' ').slice(0, 300));
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=${sanitized}`;
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        setUsingFallback(false);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setUsingFallback(false);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('Fallback audio playback prevented:', err);
          setIsPlaying(false);
          setUsingFallback(false);
        });
      }
    } catch (err) {
      console.warn('Fallback TTS error:', err);
      setIsPlaying(false);
      setUsingFallback(false);
    }
  };

  const speakText = () => {
    if (!textToSpeak || isMuted) return;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      playFallbackAudio(textToSpeak);
      return;
    }

    try {
      // 1. Unfreeze Chrome speechSynthesis if stuck
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();

      // 2. Small delay to allow Chrome internal audio queue to clear cancel state
      setTimeout(() => {
        try {
          const synth = window.speechSynthesis;
          synth.resume();

          const utterance = new SpeechSynthesisUtterance(textToSpeak);
          utteranceRef.current = utterance;
          // Prevent Chrome garbage collection bug
          window.__activeSpeechUtterance = utterance;

          utterance.lang = 'en-US';
          utterance.rate = 1.0;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          // Select best natural English voice
          const availVoices = synth.getVoices().length > 0 ? synth.getVoices() : voices;
          if (availVoices.length > 0) {
            const preferredVoice =
              availVoices.find(
                (v) =>
                  v.lang.startsWith('en') &&
                  (v.name.includes('Google') ||
                    v.name.includes('Natural') ||
                    v.name.includes('Samantha') ||
                    v.name.includes('Zira') ||
                    v.name.includes('David'))
              ) ||
              availVoices.find((v) => v.lang.startsWith('en')) ||
              availVoices[0];

            if (preferredVoice) {
              utterance.voice = preferredVoice;
              utterance.lang = preferredVoice.lang;
            }
          }

          utterance.onstart = () => {
            setIsPlaying(true);
            setUsingFallback(false);
          };

          utterance.onend = () => {
            setIsPlaying(false);
            utteranceRef.current = null;
            window.__activeSpeechUtterance = null;
          };

          utterance.onerror = (e) => {
            console.warn('SpeechSynthesis error, falling back to audio stream:', e);
            utteranceRef.current = null;
            window.__activeSpeechUtterance = null;
            // If native synth fails or is blocked by browser, seamlessly switch to fallback audio
            playFallbackAudio(textToSpeak);
          };

          synth.speak(utterance);
        } catch (innerErr) {
          console.warn('Failed to speak with native API, using fallback:', innerErr);
          playFallbackAudio(textToSpeak);
        }
      }, 50);
    } catch (err) {
      console.warn('SpeechSynthesis exception, using fallback:', err);
      playFallbackAudio(textToSpeak);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAllAudio();
    } else {
      speakText();
    }
  };

  const toggleMute = () => {
    if (!isMuted) {
      stopAllAudio();
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-900/95 border border-slate-800 text-xs shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-bold text-teal-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Interviewer Voice</span>
        </span>

        {isPlaying && (
          <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
            <span className="w-1 h-2.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0s]"></span>
            <span className="w-1 h-4 bg-teal-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
            <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
            <span className="w-1 h-5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.45s]"></span>
            <span className="text-[10px] text-teal-300 font-medium ml-1">Speaking...</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all shadow-sm ${
            isPlaying
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
              : 'bg-teal-500 text-slate-950 hover:bg-teal-400 border border-teal-400'
          }`}
          title={isPlaying ? "Stop audio" : "Listen to question"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-slate-950" />
              <span>Listen</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={toggleMute}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          title={isMuted ? "Unmute audio" : "Mute audio"}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-rose-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-teal-400" />
          )}
        </button>
      </div>
    </div>
  );
}
