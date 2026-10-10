import app from './app.js';
import { env } from './config/env.js';
import { db } from './config/db.js';

const startServer = async () => {
  try {
    console.log('--- Initializing ShopSmart AI Engine ---');
    await db.init();

    app.listen(env.PORT, () => {
      console.log(`====================================================`);
      console.log(` ShopSmart AI Server is LIVE on port ${env.PORT}`);
      console.log(` Health endpoint: http://localhost:${env.PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Fatal startup error:', err);
    process.exit(1);
  }
};

startServer();
