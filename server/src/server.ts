import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const portNum = Number(PORT) || 5000;
    app.listen(portNum, '0.0.0.0', () => {
      console.log(`[SkillSync] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${portNum}`);
      console.log(`[SkillSync] API Endpoints available at http://localhost:${portNum}/api`);
    });
    await connectDB();
  } catch (error: any) {
    console.error(`[SkillSync] Failed to initialize server:`, error.message);
    process.exit(1);
  }
};

startServer();

