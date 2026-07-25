import app from './app';
import { config } from './config';

const server = app.listen(config.port, () => {
  console.log(`[Server] Page Pulse Pro API listening on port ${config.port} in ${config.nodeEnv} mode`);
});

process.on('SIGTERM', () => {
  console.log('[Server] SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('[Server] Process terminated.');
  });
});
