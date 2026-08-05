import { useEffect, useState, useRef } from "react";

export function useRealtime(channel: string, onMessage: (data: unknown) => void) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // In production, connect to actual WebSocket server
    // For demo, simulate connection
    const wsUrl = `${import.meta.env.VITE_WS_URL || "wss://api.buildsignal.net/ws"}/${channel}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => setIsConnected(false);
      ws.onerror = () => setIsConnected(false);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch {
          onMessage(event.data);
        }
      };

      return () => {
        ws.close();
      };
    } catch {
      setIsConnected(false);
    }
  }, [channel, onMessage]);

  return { isConnected, ws: wsRef.current };
}
