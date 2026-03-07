/**
 * Database connection helper
 * Connects to MongoDB using MONGODB_URI environment variable and
 * configures mongoose options used across the backend.
 */
import mongoose from 'mongoose';
import logger from './logger.js';

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Add it to your .env file.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  console.log('MongoDB connected');
  logger.info('MongoDB connected successfully');
}

export default connectDatabase;
