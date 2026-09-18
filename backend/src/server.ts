import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`=========================================`);
  console.log(`[INFO] Flight Reservation Backend Running`);
  console.log(`[URL] http://localhost:${env.PORT}`);
  console.log(`[HEALTH] http://localhost:${env.PORT}/api/health`);
  console.log(`[ENV] ${env.NODE_ENV}`);
  console.log(`=========================================`);
});
