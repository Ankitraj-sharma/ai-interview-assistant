import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Sparkles } from 'lucide-react';

export default function InterviewerSpeaker({ textToSpeak, autoPlay = true }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [rate, setRate] = useState(1.0);
  const synthRef = useRef(window.speechSynthesis || null);

  useEffect(() => {
    if (!synthRef.current || !textToSpeak || isMuted) return;

    synthRef.current.cancel();

    if (autoPlay) {
      speakText();
    }

    return () => {
      synthRef.current?.cancel();
    };
  }, [textToSpeak]);

  const speakText = () => {
    if (!synthRef.current || !textToSpeak || isMuted) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Pick an English voice
    const voices = synthRef.current.getVoices();
    const englishVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) || voices.find(v => v.lang.startsWith('en'));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synthRef.current.speak(utterance);
  };

  const togglePlay = () => {
    if (!synthRef.current) return;
    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
    } else {
      speakText();
    }
  };

  const toggleMute = () => {
    if (!synthRef.current) return;
    if (!isMuted) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-teal-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Interviewer Audio</span>
        </span>
        {isPlaying && (
          <div className="flex items-center gap-0.5 ml-2">
            <span className="w-1 h-2.5 bg-teal-400 rounded-full animate-bounce [animation-delay:0s]"></span>
            <span className="w-1 h-4 bg-teal-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
            <span className="w-1 h-3 bg-teal-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
            <span className="w-1 h-5 bg-teal-400 rounded-full animate-bounce [animation-delay:0.45s]"></span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/20 font-medium transition-colors"
          title={isPlaying ? "Pause question audio" : "Listen to question"}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-teal-400" />}
          <span>{isPlaying ? 'Pause' : 'Listen'}</span>
        </button>

        <button
          type="button"
          onClick={toggleMute}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          title={isMuted ? "Unmute AI voice" : "Mute AI voice"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
        </button>
      </div>
    </div>
  );
}
