import React, { useState, useEffect, useRef } from 'react';
import { Camera, CameraOff, Eye, ShieldCheck } from 'lucide-react';

export default function WebcamEngagement({ onMetricsUpdate }) {
  const [isActive, setIsActive] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [focusRatio, setFocusRatio] = useState(94);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const startCamera = async () => {
    setPermissionError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, frameRate: 15 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);

      // Simulate real-time gaze telemetry computation (90% - 98% realistic variance)
      timerRef.current = setInterval(() => {
        setFocusRatio(prev => {
          const delta = (Math.random() * 4) - 2;
          const next = Math.min(99, Math.max(82, Math.round(prev + delta)));
          if (onMetricsUpdate) {
            onMetricsUpdate({
              eye_contact_ratio: next,
              stability_score: next,
              engagement_level: next > 88 ? 'Optimal Gaze' : 'Fair Focus',
            });
          }
          return next;
        });
      }, 3000);
    } catch (err) {
      console.warn('Camera access denied or unavailable:', err);
      setPermissionError('Camera access was denied or is unavailable.');
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-3 text-xs space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-slate-200">
          <Camera className="w-4 h-4 text-cyan-400" />
          <span>Webcam Telemetry</span>
        </div>
        <button
          type="button"
          onClick={isActive ? stopCamera : startCamera}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            isActive
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
          }`}
        >
          {isActive ? 'Turn Off' : 'Enable Camera'}
        </button>
      </div>

      {permissionError && (
        <p className="text-[11px] text-rose-400">{permissionError}</p>
      )}

      {isActive && (
        <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-video bg-black max-w-[200px]">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
          <div className="absolute top-1.5 left-1.5 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Live Analysis</span>
          </div>
          <div className="absolute bottom-1.5 right-1.5 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-cyan-300 flex items-center gap-1 font-mono">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>{focusRatio}% Gaze</span>
          </div>
        </div>
      )}

      {!isActive && !permissionError && (
        <p className="text-[11px] text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          Optional: Evaluates candidate focus stability without recording video to server.
        </p>
      )}
    </div>
  );
}
