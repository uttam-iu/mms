import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') ||
  'http://192.168.0.105:5000';

/**
 * Initialize and connect WebSocket via socket.io-client
 */
export const setupSocket = (token?: string): Socket => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
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

