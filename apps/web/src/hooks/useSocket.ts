import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

export function useSocket(namespace = '') {
  const [socket, setSocket] = useState<Socket | null>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const socketIo = io(`${apiUrl}${namespace}`, {
      auth: { token },
      transports: ['websocket'],
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [namespace, token]);

  return socket;
}
