import 'dotenv/config';

import app from './app.js';
import connectDatabase from './config/database.js';
import logger from './config/logger.js';

const port = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.log(`API server listening on port ${port}`);
      logger.info(`API server started on port ${port}`);
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    logger.error('Server startup failed', { error: error.message, stack: error.stack });
    process.exit(1);
  }
}

startServer();
