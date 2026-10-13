import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Clock, AlertCircle, Sparkles, Globe2, CheckCircle2 } from 'lucide-react';
import { voiceAPI } from '../api/client';

export default function AudioRecorder({ onTranscriptUpdate, onDurationUpdate, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [language, setLanguage] = useState('en-IN'); // en-IN default for high Indian English accuracy
  const [liveTranscript, setLiveTranscript] = useState('');
  const [micError, setMicError] = useState('');
  const [isTranscribingAI, setIsTranscribingAI] = useState(false);

  const isRecordingRef = useRef(false);
  const durationRef = useRef(0);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const accumulatedHistoryRef = useRef('');

  const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
  const onDurationUpdateRef = useRef(onDurationUpdate);

  useEffect(() => {
    onTranscriptUpdateRef.current = onTranscriptUpdate;
  }, [onTranscriptUpdate]);

  useEffect(() => {
    onDurationUpdateRef.current = onDurationUpdate;
  }, [onDurationUpdate]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecordingSession();
    };
  }, []);

  const stopRecordingSession = () => {
    isRecordingRef.current = false;
    setIsRecording(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
  };

  const startRecording = async () => {
    setMicError('');
    setLiveTranscript('');
    accumulatedHistoryRef.current = '';
    audioChunksRef.current = [];

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicError('Web Speech API is not supported in this browser. Please use Google Chrome or type your answer.');
      return;
    }

    // 1. Prompt for mic permission, then keep audio stream for MediaRecorder backup
    let audioStream = null;
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.warn('Microphone access denied:', err);
      setMicError('Microphone permission denied. Please allow microphone access in your browser settings.');
      return;
    }

    // Initialize MediaRecorder for optional AI Audio backup
    try {
      const mediaRecorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      mediaRecorder.start(500);
    } catch (e) {
      console.warn('MediaRecorder init failed, relying on Web Speech:', e);
    }

    // 2. Set active recording flags and start duration counter
    setIsRecording(true);
    isRecordingRef.current = true;
    durationRef.current = 0;
    setDuration(0);

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      durationRef.current += 1;
      setDuration(durationRef.current);
      if (onDurationUpdateRef.current) {
        onDurationUpdateRef.current(durationRef.current);
      }
    }, 1000);

    // 3. Create fresh SpeechRecognition instance on demand
    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognition.maxAlternatives = 1;

      let sessionFinal = '';

      recognition.onresult = (event) => {
        let interim = '';
        sessionFinal = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            sessionFinal += res[0].transcript + ' ';
          } else {
            interim += res[0].transcript;
          }
        }

        const combined = (accumulatedHistoryRef.current + ' ' + sessionFinal + interim).trim();
        setLiveTranscript(combined);
        if (onTranscriptUpdateRef.current && combined) {
          onTranscriptUpdateRef.current(combined);
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error event:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Microphone permission blocked by browser.');
          stopRecordingSession();
        } else if (event.error === 'network') {
          setMicError('Network issue with speech recognition service. You can use "Transcribe with AI" below.');
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          accumulatedHistoryRef.current = (accumulatedHistoryRef.current + ' ' + sessionFinal).trim();
          try {
            recognition.start();
          } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('SpeechRecognition start error:', err);
    }
  };

  const stopRecording = () => {
    stopRecordingSession();
  };

  // Fallback: Transcribe recorded audio with backend Gemini AI
  const handleAITranscribe = async () => {
    if (audioChunksRef.current.length === 0) {
      setMicError('No audio recorded yet. Please record voice before transcribing.');
      return;
    }

    setIsTranscribingAI(true);
    setMicError('');
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', audioBlob, 'candidate_answer.webm');

      const res = await voiceAPI.transcribeAudio(formData);
      if (res.data?.transcription) {
        const text = res.data.transcription;
        setLiveTranscript(text);
        if (onTranscriptUpdateRef.current) {
          onTranscriptUpdateRef.current(text);
        }
      } else {
        setMicError('AI audio transcription returned empty. Please speak closer to your mic or type your answer.');
      }
    } catch (err) {
      console.warn('AI transcription error:', err);
      setMicError('AI transcription failed. Please check your network or enter answer manually.');
    } finally {
      setIsTranscribingAI(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled || isTranscribingAI}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30 hover:bg-rose-600'
                : 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-teal-500/20'
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
                <span>Start Voice Answer</span>
              </>
            )}
          </button>

          {/* Accent / Language Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs">
            <Globe2 className="w-3.5 h-3.5 text-teal-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isRecording}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="en-IN" className="bg-slate-900 text-slate-100">English (India)</option>
              <option value="en-US" className="bg-slate-900 text-slate-100">English (US)</option>
              <option value="en-GB" className="bg-slate-900 text-slate-100">English (UK)</option>
            </select>
          </div>

          {/* Live duration timer & waveform animation */}
          {isRecording && (
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-bold">{formatTime(duration)}</span>
              <div className="flex items-center gap-1 ml-1.5">
                <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce [animation-delay:0s]"></span>
                <span className="w-1 h-5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1 h-4 bg-rose-400 rounded-full animate-bounce [animation-delay:0.45s]"></span>
              </div>
              <span className="text-[10px] text-rose-300 font-sans ml-1">Live Mic Active</span>
            </div>
          )}
        </div>

        {/* AI Audio Transcribe Fallback Button */}
        {!isRecording && audioChunksRef.current.length > 0 && (
          <button
            type="button"
            onClick={handleAITranscribe}
            disabled={isTranscribingAI}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 hover:bg-teal-500/25 text-xs font-semibold transition-colors"
            title="Transcribe recorded audio with Gemini AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>{isTranscribingAI ? 'Gemini Transcribing...' : '✨ Transcribe with AI'}</span>
          </button>
        )}
      </div>

      {/* Live Transcript Preview Box */}
      {isRecording && (
        <div className="p-3 rounded-xl bg-slate-900/60 border border-teal-500/20 text-xs space-y-1 animate-fade-in">
          <div className="flex items-center gap-1.5 text-teal-400 font-bold text-[11px]">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            <span>Real-Time Speech Detection:</span>
          </div>
          <p className="text-slate-300 font-mono italic">
            {liveTranscript ? `"${liveTranscript}"` : 'Listening... speak clearly into your microphone.'}
          </p>
        </div>
      )}

      {micError && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{micError}</span>
        </div>
      )}
    </div>
  );
}
