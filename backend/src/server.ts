import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Flight Reservation Backend Running`);
  console.log(`📡 URL: http://localhost:${env.PORT}`);
  console.log(`🏥 Health Check: http://localhost:${env.PORT}/api/health`);
  console.log(`🌐 Environment: ${env.NODE_ENV}`);
  console.log(`=========================================`);
});
