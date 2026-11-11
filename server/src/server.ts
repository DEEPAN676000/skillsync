import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[SkillSync] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`[SkillSync] API Endpoints available at http://localhost:${PORT}/api`);
    });
  } catch (error: any) {
    console.error(`[SkillSync] Failed to initialize server:`, error.message);
    process.exit(1);
  }
};

startServer();

