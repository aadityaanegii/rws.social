import mongoose from 'mongoose';

let mongoServer: any;

export async function connectDB() {
  let uri = process.env.MONGODB_URI;
  
  if (!uri) {
    if (process.env.VERCEL) {
      throw new Error("MONGODB_URI is required on Vercel");
    }
    console.warn('MONGODB_URI is not set. Using in-memory MongoDB for development/preview...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoServer = await MongoMemoryServer.create();
    uri = mongoServer.getUri();
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}
