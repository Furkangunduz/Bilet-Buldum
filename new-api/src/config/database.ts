import mongoose from 'mongoose';
import { env } from './env';

export async function connectDatabase(): Promise<void> {
  try {
    const connection = await mongoose.connect(env.ENV === 'development' ? env.MONGODB_LOCAL_URI : env.MONGODB_URI);
    console.log(`Connected to MongoDB: ${connection.connection.host}:${connection.connection.port}`);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
} 