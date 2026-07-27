import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(env.port, () => {
      console.log(`Backend server is running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start backend server.', error);
    process.exit(1);
  }
}

void startServer();

