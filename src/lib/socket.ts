import { io, Socket } from 'socket.io-client';
import { toast as toastify } from 'react-toastify';
import { showToast } from './utils';
import { removeDataFromLocalStorage } from './localStorageHelper';

let socket: Socket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let countdownTimer: ReturnType<typeof setInterval> | null = null;
const reconnectToastId = 'socket-reconnect';

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '');

const clearReconnectSchedule = (): void => {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  if (countdownTimer) clearInterval(countdownTimer);
  reconnectTimer = null;
  countdownTimer = null;
  toastify.dismiss(reconnectToastId);
};

export const reconnectSocket = (reconnectInSeconds = 10): void => {
  if (!socket || socket.connected || reconnectTimer) return;

  let secondsLeft = Math.max(1, Math.ceil(reconnectInSeconds));

  const updateToastMessage = (secs: number) => {
    const msg = `Connection lost. Reconnecting in ${secs}s...`;
    if (toastify.isActive(reconnectToastId)) {
      toastify.update(reconnectToastId, { render: msg });
    } else {
      showToast(msg, 'warning', {
        autoClose: false,
        toastId: reconnectToastId,
      });
    }
  };

  updateToastMessage(secondsLeft);

  countdownTimer = setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft >= 0) {
      updateToastMessage(secondsLeft);
    }
  }, 1000);

  reconnectTimer = setTimeout(() => {
    clearReconnectSchedule();

    if (socket && !socket.connected) {
      console.log('[Socket.IO] Attempting to reconnect...');
      socket.connect();
    }
  }, secondsLeft * 1000);
};

export const disconnectSocket = (): void => {
  clearReconnectSchedule();
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const handleTokenExpired = async (): Promise<void> => {
  disconnectSocket();
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')}/user/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (e) {
    console.error('Logout error on expired token:', e);
  }
  removeDataFromLocalStorage('user');
  const redirectUrl = window.location.pathname + window.location.search;
  window.location.href = `/login?redirect_url=${encodeURIComponent(redirectUrl)}`;
};

export const socketConnect = (): Socket => {
  if (socket) {
    if (!socket.connected && !socket.active && !reconnectTimer) {
      socket.connect();
    }
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
    clearReconnectSchedule();
  });

  socket.on('connect_error', async (err) => {
    console.warn('[Socket.IO] Connection Error:', err.message);
    const isTokenExpired = err.message?.toString()?.toLowerCase()?.includes('jwt expired');

    if (isTokenExpired) {
      await handleTokenExpired();
    } else {
      reconnectSocket(10);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', reason);
    if (reason === 'io client disconnect') {
      // Intentional logout/disconnect
      return;
    }
    reconnectSocket(10);
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  if (!socket) {
    return socketConnect();
  }
  return socket;
};


