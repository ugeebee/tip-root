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
  const token = searchParams.get('token');
  const streamerID = searchParams.get('streamer_id');

  const [queue, setQueue] = useState<TipAlert[]>([]);
  const [currentAlert, setCurrentAlert] = useState<TipAlert | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // 1. Establish Secure SSE Connection
  useEffect(() => {
    if (!token || !streamerID) return;

    const abortController = new AbortController();

    const connectToStream = async () => {
      try {
        // Authenticated request passing streamer_id in query and token in header
        const response = await fetch(`https://api.ugbhartariya.com/api/overlay/stream?streamer_id=${streamerID}`, {
          headers: { 'Authorization': `Bearer ${token}` },
          signal: abortController.signal
        });

        if (!response.ok) return;

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const messages = buffer.split('\n\n');
            buffer = messages.pop() || '';

            for (const msg of messages) {
              if (msg.startsWith('data: ')) {
                const newTip: TipAlert = JSON.parse(msg.substring(6));
                setQueue((prev) => [...prev, newTip]);
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error("Stream error:", err);
      }
    };

    connectToStream();
    return () => abortController.abort();
  }, [token, streamerID]);

  // 2. Sequential Queue Manager
  useEffect(() => {
    if (queue.length > 0 && !currentAlert) {
      const nextTip = queue[0];
      setCurrentAlert(nextTip);
      setIsVisible(true);
      setQueue((prev) => prev.slice(1));

      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setCurrentAlert(null), 1000); 
      }, 5000); // Display for 5 seconds
    }
  }, [queue, currentAlert]);

  if (!token || !streamerID) return <div>Missing Parameters</div>;

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-transparent">
      <div className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        {currentAlert && (
          <div className="text-center">
            <h1 className="text-5xl text-white">{currentAlert.name} tipped ₹{currentAlert.amount}!</h1>
            <p className="text-2xl text-gray-100 mt-4">"{currentAlert.message}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OverlayPage() {
  return <Suspense><OverlayEngine /></Suspense>;
}