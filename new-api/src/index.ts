import dotenv from 'dotenv';
import express from 'express';
import { connectDatabase } from './config/database';
import { env } from './config/env';
import v1Routes from './routes/v1';

dotenv.config();

const app = express();

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

async function startServer() {
  try {
    await connectDatabase();
    
    app.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 