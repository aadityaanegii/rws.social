import { Server } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

let io: Server;

// User presence map
const userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

export function initSocket(server: HTTPServer) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme123') as any;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    const userSocketSet = userSockets.get(userId)!;
    userSocketSet.add(socket.id);
    
    // Send initial online users to the newly connected user
    socket.emit('initial_online_users', Array.from(userSockets.keys()));
    
    // Join their own room for global notifications
    socket.join(`user_${userId}`);
    
    // Broadcast user online status if it's their first connection
    if (userSocketSet.size === 1) {
      socket.broadcast.emit('user_status', { userId, status: 'online' });
    }

    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    socket.on('typing', ({ chatId, receiverId }) => {
      socket.to(`chat_${chatId}`).emit('typing', { chatId, userId });
    });
    
    socket.on('stop_typing', ({ chatId }) => {
      socket.to(`chat_${chatId}`).emit('stop_typing', { chatId, userId });
    });

    socket.on('disconnect', () => {
      const userSocketSet = userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          userSockets.delete(userId);
          io.emit('user_status', { userId, status: 'offline', lastSeen: new Date() });
        }
      }
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}

export function generateChatId(user1: string, user2: string) {
  return [user1, user2].sort().join('_');
}
