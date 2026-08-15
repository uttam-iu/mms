import { io, Socket } from 'socket.io-client';
import { getJwtToken } from './localStorageHelper';
import { toast } from 'react-toastify';

let socket: Socket | null = null;
let reconnectToastId: string | number | null = null;
let countdownInterval: NodeJS.Timeout | null = null;
let currentDelaySec = 20; // 20s initial delay (increments by 20s on each attempt)

const clearReconnectTimer = () => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
  if (reconnectToastId) {
    toast.dismiss(reconnectToastId);
    reconnectToastId = null;
  }
};

const startReconnectCountdown = () => {
  clearReconnectTimer();

  let secondsLeft = currentDelaySec;
  reconnectToastId = toast.warn(`Reconnecting in ${secondsLeft}s...`, {
    position: 'bottom-center',
    autoClose: false,
    closeOnClick: false,
    draggable: false,
  });

  countdownInterval = setInterval(() => {
    secondsLeft -= 1;
    if (secondsLeft > 0) {
      toast.update(reconnectToastId!, {
        render: `Reconnecting in ${secondsLeft}s...`,
      });
    } else {
      toast.update(reconnectToastId!, {
        render: `Attempting to reconnect...`,
      });
      if (countdownInterval) clearInterval(countdownInterval);
      // currentDelaySec += 20; // Increment delay for next attempt (20s -> 40s -> 60s...)
    }
  }, 1000);
};

export const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') 

export const setupSocket = (): Socket => {
  const token = getJwtToken();
  console.log('token:', token);
  if (socket && socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    autoConnect: false,
    reconnection: true,
    reconnectionDelay: 20000, // 1st retry after 20s (2nd attempt at 40s, etc.)
    reconnectionDelayMax: 60000, // Cap at max delay if needed
    randomizationFactor: 0, // Keeps exact linear increment (20s, 40s, 60s...)
    transports: ['websocket', 'polling'],
    auth: {
      token: token || '',
    },
    withCredentials: true,
  });

  socket.on('connect', () => {
    console.log('[Socket.IO] Connected successfully. ID:', socket?.id);
    if (reconnectToastId) {
      toast.success('Reconnected to server!', { position: 'bottom-center', autoClose: 3000 });
    }
    clearReconnectTimer();
    currentDelaySec = 20; // Reset delay on successful connection
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket.IO] Connection Error:', err.message);
    setTimeout(()=>{
      socket?.connect()
    }, 2000)
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.IO] Disconnected:', reason);
    startReconnectCountdown();
    if (reason === 'io server disconnect') {
      // Reconnect manually if server forcibly disconnected
      socket?.connect();
    }
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  if (!socket) {
    return setupSocket();
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
