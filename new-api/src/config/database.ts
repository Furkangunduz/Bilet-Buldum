import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  try {
    const connectionString = env.ENV === 'development' ? env.MONGODB_LOCAL_URI : env.MONGODB_URI;
    console.log('Trying to connect to:', connectionString);
    const connection = await mongoose.connect(connectionString);
    console.log(`Connected to MongoDB: ${connection.connection.host}:${connection.connection.port}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
} 