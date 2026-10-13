import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Clock, AlertCircle } from 'lucide-react';

export default function AudioRecorder({ onTranscriptUpdate, onDurationUpdate, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  const [micError, setMicError] = useState('');
  const [isListeningActive, setIsListeningActive] = useState(false);

  const isRecordingRef = useRef(false);
  const durationRef = useRef(0);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamRef = useRef(null);
  const accumulatedTextRef = useRef('');

  // Keep callback refs up to date without re-triggering effect
  const onTranscriptUpdateRef = useRef(onTranscriptUpdate);
  const onDurationUpdateRef = useRef(onDurationUpdate);

  useEffect(() => {
    onTranscriptUpdateRef.current = onTranscriptUpdate;
  }, [onTranscriptUpdate]);

  useEffect(() => {
    onDurationUpdateRef.current = onDurationUpdate;
  }, [onDurationUpdate]);

  // Initialize SpeechRecognition on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListeningActive(true);
        setMicError('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = accumulatedTextRef.current;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptPiece + ' ';
          } else {
            interim += transcriptPiece;
          }
        }

        accumulatedTextRef.current = final;
        const fullTranscript = (final + interim).trim();

        if (onTranscriptUpdateRef.current && fullTranscript) {
          onTranscriptUpdateRef.current(fullTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Microphone access was denied. Please allow microphone permissions in Chrome.');
          stopRecording();
        } else if (event.error === 'no-speech') {
          // Normal pause, keep listening
        } else if (event.error === 'audio-capture') {
          setMicError('No microphone hardware detected.');
          stopRecording();
        }
      };

      recognition.onend = () => {
        setIsListeningActive(false);
        // Automatically restart if user hasn't explicitly stopped recording
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or restarting
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
      setIsSupported(false);
    }

    return () => {
      isRecordingRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    if (!isSupported) {
      alert('Speech recognition is not natively supported in this browser. Please use Google Chrome or type your answer directly.');
      return;
    }

    setMicError('');
    accumulatedTextRef.current = '';

    // 1. Request microphone stream to ensure browser permissions are active
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err) {
      console.warn('getUserMedia error:', err);
      setMicError('Microphone permission required. Please click the lock icon in the address bar to allow microphone.');
      return;
    }

    // 2. Set recording state and start timer
    setIsRecording(true);
    isRecordingRef.current = true;
    durationRef.current = 0;
    setDuration(0);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      durationRef.current += 1;
      setDuration(durationRef.current);
      if (onDurationUpdateRef.current) {
        onDurationUpdateRef.current(durationRef.current);
      }
    }, 1000);

    // 3. Start speech recognition engine
    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.warn('recognition start exception:', err);
      // If already started, ignore
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    isRecordingRef.current = false;

    // Stop duration interval
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop microphone stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Stop speech recognition
    try {
      recognitionRef.current?.stop();
    } catch (err) {
      console.warn('recognition stop exception:', err);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={disabled}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-md ${
              isRecording
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30 hover:bg-rose-600'
                : 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-teal-500/20'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-4 h-4" />
                <span>Stop Voice Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-slate-950 font-bold" />
                <span>Start Voice Answer (Mic)</span>
              </>
            )}
          </button>

          {/* Live duration timer & waveform animation */}
          {isRecording ? (
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span className="font-bold">{formatTime(duration)}</span>
              <div className="flex items-center gap-1 ml-1.5">
                <span className="w-1 h-3 bg-rose-400 rounded-full animate-bounce [animation-delay:0s]"></span>
                <span className="w-1 h-5 bg-rose-400 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                <span className="w-1 h-2 bg-rose-400 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                <span className="w-1 h-4 bg-rose-400 rounded-full animate-bounce [animation-delay:0.45s]"></span>
              </div>
              <span className="text-[10px] text-rose-300 font-sans ml-1">Listening...</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 flex items-center gap-1.5 hidden sm:flex">
              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Click to speak, or type into the response box below</span>
            </span>
          )}
        </div>

        {isRecording && (
          <span className="text-[11px] text-teal-400 font-mono font-medium animate-pulse">
            ● Transcribing Live Speech
          </span>
        )}
      </div>

      {micError && (
        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{micError}</span>
        </div>
      )}
    </div>
  );
}
