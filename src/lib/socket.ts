import { io, Socket } from 'socket.io-client';
import { getJwtToken } from './localStorageHelper';

let socket: Socket | null = null;

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') 

/**
 * Initialize and connect WebSocket via socket.io-client
 */
export const setupSocket = (): Socket => {
  const token = getJwtToken();
  console.log('token:', token);
  if (socket && socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket', 'polling'],
    auth: {
      token: token || '',
    },
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected successfully. ID:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket.IO] Connection Error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', reason);
  });

  return socket;
};

/**
 * Get active socket instance
 */
export const getSocket = (): Socket | null => {
  if (!socket) {
    return setupSocket();
  }
  return socket;
};

/**
 * Disconnect socket connection
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

