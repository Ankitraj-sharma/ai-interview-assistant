import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Clock } from 'lucide-react';

export default function AudioRecorder({ onTranscriptUpdate, onDurationUpdate, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript + ' ';
      }
      if (onTranscriptUpdate) {
        onTranscriptUpdate(finalTranscript.trim());
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition status:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone permission was denied. Please allow microphone access in your browser.');
        stopRecording();
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        // Automatically restart if ongoing
        try {
          recognition.start();
        } catch {
          // Ignore restart error
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, onTranscriptUpdate]);

  const startRecording = () => {
    if (!isSupported) {
      alert('Speech recognition is not natively supported in this browser. Please use Google Chrome or type your answer directly.');
      return;
    }

    setIsRecording(true);
    setDuration(0);

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.log('Recognition start error:', e);
    }

    timerRef.current = setInterval(() => {
      setDuration((prev) => {
        const next = prev + 1;
        if (onDurationUpdate) onDurationUpdate(next);
        return next;
      });
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.log('Recognition stop error:', e);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={disabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-md ${
          isRecording
            ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
            : 'bg-teal-600 text-slate-950 hover:bg-teal-500 shadow-teal-500/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isRecording ? (
          <>
            <MicOff className="w-4 h-4" />
            <span>Stop Recording</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-slate-950 font-bold" />
            <span className="font-semibold">Voice Answer (Mic)</span>
          </>
        )}
      </button>

      {/* Live duration timer & animation */}
      {isRecording && (
        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs">
          <Clock className="w-3.5 h-3.5 animate-spin" />
          <span>{formatTime(duration)}</span>
          <div className="flex items-center gap-0.5 ml-2">
            <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce"></span>
            <span className="w-1 h-5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
            <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
            <span className="w-1 h-4 bg-rose-400 rounded-full animate-bounce [animation-delay:0.45s]"></span>
          </div>
        </div>
      )}

      {!isRecording && (
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Volume2 className="w-3.5 h-3.5 text-slate-500" />
          Speak your answer or type into the box below
        </span>
      )}
    </div>
  );
}
