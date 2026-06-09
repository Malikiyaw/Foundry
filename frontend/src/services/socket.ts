import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

let globalSocket: Socket | null = null;

export function getSocket(): Socket {
  if (!globalSocket) {
    globalSocket = io({
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      auth: { token: localStorage.getItem('foundry_token') },
      autoConnect: false,
    });
  }
  return globalSocket;
}

export function connectSocket(token?: string) {
  const socket = getSocket();
  if (socket.connected) return;
  if (token) socket.auth = { token };
  socket.connect();
}

export function disconnectSocket() {
  if (globalSocket) { globalSocket.disconnect(); globalSocket = null; }
}

export function joinProject(projectId: string) {
  const socket = getSocket();
  if (!socket.connected) connectSocket();
  socket.emit('join:project', { projectId });
}

export function leaveProject(projectId: string) {
  const socket = getSocket();
  if (socket.connected) socket.emit('leave:project', { projectId });
}

export function useSocket(): Socket | null {
  const [socket, setSocket] = useState<Socket | null>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    const s = getSocket();
    if (!connectedRef.current) {
      s.connect();
      s.on('connect', () => { connectedRef.current = true; setSocket(s); });
      s.on('disconnect', () => { connectedRef.current = false; setSocket(null); });
      s.on('connect_error', () => { connectedRef.current = false; });
    }
    return () => {};
  }, []);

  return socket;
}
