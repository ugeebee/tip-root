'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { HeartHandshake } from 'lucide-react';

interface TipAlert {
  client_key: string;
  name: string;
  amount: number;
  message: string;
}

function OverlayEngine() {
  const searchParams = useSearchParams();
  const streamerId = searchParams.get('streamer_id');
  const token = searchParams.get('token'); // NEW: Extract the token

  const [queue, setQueue] = useState<TipAlert[]>([]);
  const [currentAlert, setCurrentAlert] = useState<TipAlert | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);

  // 1. Connect to the Secure Go OBS Engine
  useEffect(() => {
    // NEW: Wait for BOTH parameters
    if (!streamerId || !token) return;

    // NEW: Connect using the full secure URL with the token
    const eventSource = new EventSource(
      `https://streamer.tip-root.in/api/overlay/stream?streamer_id=${streamerId}&token=${token}`
    );

    eventSource.onmessage = (event) => {
      // NEW: Ignore heartbeat messages so it doesn't crash the JSON parser
      if (event.data === ": heartbeat") return;

      try {
        const newTip = JSON.parse(event.data);
        // Add incoming tips to the queue
        setQueue((prev) => [...prev, newTip]);
      } catch (err) {
        console.error('Failed to parse overlay event:', err);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE Connection dropped. Reconnecting...", error);
    };

    return () => eventSource.close();
  }, [streamerId, token]);

  // 2. The Queue Manager (Plays animations sequentially)
  useEffect(() => {
    if (queue.length > 0 && !currentAlert) {
      // Pull the first tip from the queue
      const nextTip = queue[0];
      setCurrentAlert(nextTip);
      setIsVisible(true);

      // Trigger TTS reading the alert (Using Audio API + Google TTS for OBS Compatibility)
      const textToSpeak = `${nextTip.name} tipped ${nextTip.amount}. ${nextTip.message || ''}`;

      try {
        // OBS Browser Source often lacks voices for window.speechSynthesis, so we use an Audio object
        // We route this through our own Next.js API to bypass Google's strict browser CORS/Referer blocks.
        const ttsUrl = `/api/tts?text=${encodeURIComponent(textToSpeak)}`;
        const audio = new Audio(ttsUrl);

        audio.play().catch(e => {
          console.warn("Audio play failed (OBS might need 'Control audio via OBS' checked):", e);
          if (e.name === 'NotAllowedError') {
            setAudioBlocked(true);
          }
          // Fallback to native synthesis if Audio API is strictly blocked
          if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(textToSpeak);
            window.speechSynthesis.speak(utterance);
          }
        });
      } catch (err) {
        console.error("TTS failed:", err);
      }

      // Remove it from the queue
      setQueue((prev) => prev.slice(1));

      // Hide the alert after 8 seconds, wait 1 second, then process the next
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentAlert(null);
        }, 1000); // 1s cooldown between alerts
      }, 8000); // 8s display time
    }
  }, [queue, currentAlert]);

  // NEW: Warn if the URL is missing the security token
  if (!streamerId || !token) {
    return <div className="text-white p-4 font-mono">⚠️ Missing streamer_id or security token parameter</div>;
  }

  return (
    // The background must be completely transparent for OBS
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-transparent font-sans relative">

      {/* Browser Autoplay Unblocker */}
      {audioBlocked && (
        <button 
          onClick={() => setAudioBlocked(false)}
          className="absolute top-4 left-4 bg-red-600 text-white px-6 py-3 rounded-xl font-bold shadow-2xl z-[9999] animate-bounce"
        >
          🔇 Click anywhere on page to enable Audio! (Browser blocked autoplay)
        </button>
      )}

      {/* Live Badge */}
      <div className="absolute top-8 right-8 flex items-center gap-3 bg-black/50 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20 shadow-lg z-50">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,1)]" />
        <span className="text-white font-semibold tracking-wide text-sm drop-shadow-md">Tip-Root is live</span>
      </div>

      {/* The Alert Box */}
      <div
        className={`
          flex flex-col items-center justify-center text-center max-w-xl
          transition-all duration-700 ease-in-out transform
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10'}
        `}
      >
        {currentAlert && (
          <>
            {/* Pulsing Icon */}
            <div className="w-24 h-24 bg-gradient-to-tr from-[#6D28D9] to-[#9333EA] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(109,40,217,0.6)] mb-6 animate-pulse">
              <HeartHandshake size={48} className="text-white" />
            </div>

            {/* Title */}
            <h1 className="text-5xl font-extrabold text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] mb-2 tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {currentAlert.name}
              </span>
              {' '}tipped ₹{currentAlert.amount}!
            </h1>

            {/* Message */}
            {currentAlert.message && (
              <div className="mt-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                <p className="text-2xl text-gray-100 font-medium leading-relaxed drop-shadow-md">
                  "{currentAlert.message}"
                </p>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}

export default function OverlayPage() {
  return (
    <Suspense fallback={<div className="bg-transparent w-screen h-screen"></div>}>
      <OverlayEngine />
    </Suspense>
  );
}