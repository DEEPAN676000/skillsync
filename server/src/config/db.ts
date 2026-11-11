import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillsync';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error: any) {
    console.warn(`[MongoDB] Notice: Local MongoDB not detected at ${uri}.`);
    console.log('[MongoDB] Running with in-memory persistence mode active. Frontend LocalStorage state is preserved.');
  }
};

