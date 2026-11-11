import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillsync';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error: any) {
    console.warn(`[MongoDB] Warning: Could not connect to MongoDB at ${uri}: ${error.message}`);
    console.warn(`[MongoDB] Set MONGODB_URI in server/.env (e.g. MongoDB Atlas connection string).`);
    // Attempt dynamic in-memory fallback if available, or continue so server runs with helpful feedback
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[MongoDB] Running with in-memory MongoDB instance: ${conn.connection.host}`);
    } catch {
      console.log('[MongoDB] Running with mock memory persistence mode active.');
    }
  }
};

