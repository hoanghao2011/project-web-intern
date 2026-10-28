import { io } from 'socket.io-client';

const apiBaseUrl = import.meta.env.VITE_API_URL || '/api';
const socketUrl = apiBaseUrl.replace(/\/api\/?$/, '') || undefined;

let socket = null;

export function connectSocket(token) {
  if (socket) socket.disconnect();

  socket = io(socketUrl, {
    auth: { token },
    autoConnect: true,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function getSocket() {
  return socket;
}
