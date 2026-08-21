import { io, Socket } from 'socket.io-client';
let socket: Socket | null = null;

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

const reconnectSocket = () =>{
  if (socket) {
    if (!socket.connected && !socket.active) {
      socket.connect();
    }
  }
} 

export const socketConnect = (): Socket => {  
  if (socket) {
    reconnectSocket()
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: false,
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected successfully. ID:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket.IO] Connection Error:', err.message);
    reconnectSocket()
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', reason);
    if (reason === 'io client disconnect') {
      return;
    }else reconnectSocket()
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  if (!socket) 
    return socketConnect();
  
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

