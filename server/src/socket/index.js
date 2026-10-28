import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getAllowedOrigins } from '../config/cors.js';

let io = null;

export function initSocket(httpServer) {
  const allowedOrigins = getAllowedOrigins();

  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : '*',
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Thiếu token xác thực'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) return next(new Error('Tài khoản không hợp lệ'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Token không hợp lệ hoặc đã hết hạn'));
    }
  });

  io.on('connection', (socket) => {
    socket.join('global');
  });

  return io;
}

export function getIO() {
  return io;
}
