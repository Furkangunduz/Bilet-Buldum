import dotenv from 'dotenv';
import express from 'express';
import morgan from 'morgan';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import searchAlertsCron from './cron/searchAlerts.cron';
import v1Routes from './routes/v1';
import { CrawlerService } from './services/CrawlerService';

dotenv.config();

const app = express();
const crawlerService = new CrawlerService();

// Middleware
app.use(morgan('dev')); // Log requests to the console
app.use(express.json());

// Routes
app.use('/api/v1', v1Routes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: env.NODE_ENV === 'development' ? err : undefined
  });
});

async function runCrawler() {
  try {
    console.log('Starting crawler...');
    const results = await crawlerService.crawl();
    console.log('Crawler results:', results);
  } catch (error) {
    console.error('Crawler error:', error);
  }
}

async function startServer() {
  try {
    await connectDatabase();
    
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });

    searchAlertsCron.start();
    console.log('Search alerts cron job started');

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing crawler and shutting down...');
  await crawlerService.close();
  searchAlertsCron.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing crawler and shutting down...');
  await crawlerService.close();
  searchAlertsCron.stop();
  process.exit(0);
});

startServer(); 