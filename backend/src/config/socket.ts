import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('join:event', (eventId: string) => {
      socket.join(`event:${eventId}`);
      console.log(`👤 ${socket.id} joined event:${eventId}`);
    });

    socket.on('leave:event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized. Call initSocket() first.');
  }
  return io;
}
