import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(namespace = '') {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const socketIo = io(`${apiUrl}${namespace}`, {
      // In real scenario, pass auth token here.
      transports: ['websocket'],
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [namespace]);

  return socket;
}
