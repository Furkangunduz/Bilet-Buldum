import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import searchAlertsCron from './cron/searchAlerts.cron';
import v1Routes from './routes/v1';

dotenv.config();


async function startServer() {
  try {
    connectDatabase().then(() => {
      console.log('Database connected');
      const app = express();

      app.use(morgan('dev')); 
      app.use(express.json());

      app.use('/api/v1', v1Routes);

      app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        console.error(err.stack);
        res.status(500).json({
          success: false,
          message: 'Internal server error',
          error: env.NODE_ENV === 'development' ? err : undefined
        });
      });

      app.listen(env.PORT, () => {
        console.log(`Server is running on port ${env.PORT}`);
      });
      
      searchAlertsCron.start();
      
      console.log('Search alerts cron job started');
    }).catch((error) => {
      console.error('Failed to connect to database:', error);
      process.exit(1);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing crawler and shutting down...');
  searchAlertsCron.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing crawler and shutting down...');
  searchAlertsCron.stop();
  process.exit(0);
});

startServer(); 