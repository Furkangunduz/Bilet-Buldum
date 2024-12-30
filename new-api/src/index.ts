import dotenv from 'dotenv';
import express from 'express';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import v1Routes from './routes/v1';
import { CrawlerService } from './services/CrawlerService';

dotenv.config();

const app = express();
const crawlerService = new CrawlerService();

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1', v1Routes);

// Error handling middleware
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

async function startPeriodicCrawler() {
  // Run immediately on startup
  await runCrawler();
  
  // Then run every 10 seconds
  setInterval(runCrawler, 10000);
}

async function startServer() {
  try {
    await connectDatabase();
    
    // Start the server
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });

    // Start the periodic crawler
    await startPeriodicCrawler();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Closing crawler and shutting down...');
  await crawlerService.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Closing crawler and shutting down...');
  await crawlerService.close();
  process.exit(0);
});

startServer(); 