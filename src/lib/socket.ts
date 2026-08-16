import { io, Socket } from 'socket.io-client';
import { getJwtToken } from './localStorageHelper';
import { toast } from 'react-toastify';

let socket: Socket | null = null;
let reconnectToastId: string | number | null = null;
let countdownInterval: NodeJS.Timeout | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
const RECONNECT_DELAY_SEC = 10;

const clearReconnectTimer = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

const dismissReconnectToast = () => {
  if (reconnectToastId) {
    toast.dismiss(reconnectToastId);
    reconnectToastId = null;
  }
};

const handleReconnectCycle = () => {
  clearReconnectTimer();

  let secondsLeft = RECONNECT_DELAY_SEC;
  if (!reconnectToastId || !toast.isActive(reconnectToastId)) {
    reconnectToastId = toast.warn(`Connection lost. Reconnecting in ${secondsLeft}s...`, {
      position: 'bottom-center',
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });
  } else {
    toast.update(reconnectToastId, {
      render: `Connection lost. Reconnecting in ${secondsLeft}s...`,
      type: 'warning',
    });
  }

  countdownInterval = setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft > 0) {
      if (reconnectToastId) {
        toast.update(reconnectToastId, {
          render: `Connection lost. Reconnecting in ${secondsLeft}s...`,
        });
      }
    } else {
      if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
      }
      if (reconnectToastId) {
        toast.update(reconnectToastId, {
          render: 'Attempting to reconnect...',
        });
      }
    }
  }, 1000);

  reconnectTimer = setTimeout(() => {
    if (socket && !socket.connected) {
      socket.connect();
    }
  }, RECONNECT_DELAY_SEC * 1000);
};

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

export const setupSocket = (): Socket => {
  const token = getJwtToken();
  
  if (socket) {
    // If token has changed or socket disconnected, update auth token and attempt connection
    if (token) {
      socket.auth = { token };
    }
    if (!socket.connected && !socket.active) {
      socket.connect();
    }
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: false, // Handle reconnection manually with fixed 10s countdown delay
    transports: ['websocket', 'polling'],
    auth: {
      token: token || '',
    },
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected successfully. ID:', socket?.id);
    if (reconnectToastId) {
      toast.dismiss(reconnectToastId);
      reconnectToastId = null;
      toast.success('Successfully connected to server!', {
        position: 'bottom-center',
        autoClose: 3000,
      });
    }
    clearReconnectTimer();
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket.IO] Connection Error:', err.message);
    handleReconnectCycle();
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', reason);
    if (reason === 'io client disconnect') {
      // Intentional disconnect by client
      clearReconnectTimer();
      dismissReconnectToast();
      return;
    }
    handleReconnectCycle();
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  if (!socket) {
    return setupSocket();
  }
  const token = getJwtToken();
  if (token && socket.auth && typeof socket.auth === 'object') {
    socket.auth.token = token;
  }
  if (!socket.connected && !socket.active) {
    socket.connect();
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    clearReconnectTimer();
    dismissReconnectToast();
    socket.disconnect();
    socket = null;
  }
};

