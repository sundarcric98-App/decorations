import app from './app.js';
import { prisma } from './config/database.js';

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`✨ Sathuragiri Decoration Backend API Server ✨`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
  console.log(`🛡️ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`======================================================\n`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP Server closed.');
    await prisma.$disconnect();
    console.log('Prisma disconnected.');
    process.exit(0);
  });

  // Force close after 10s if stuck
  setTimeout(() => {
    console.error('Forcing shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
