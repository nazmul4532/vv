if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = require('./app');
const connectToDatabase = require('./config/db');
const { checkAllServicesHealth } = require('./controllers/handler.controller');

const PORT = process.env.PORT || 5050;

const startServer = async () => {
  try {
    try {
      await connectToDatabase();
      console.log('✅ Connected to database');
    } catch (dbError) {
      console.error('❌ Failed to connect to the database:', dbError);
      process.exit(1);
    }

    try {
      await checkAllServicesHealth();
      console.log('✅ Initial health check complete');
    } catch (healthError) {
      console.warn('⚠️ Initial health check failed (continuing anyway):', healthError);
    }


    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    setInterval(async () => {
      try {
        await checkAllServicesHealth();
        console.log('🔁 Background health check succeeded');
      } catch (intervalError) {
        console.warn('⚠️ Background health check failed:', intervalError);
      }
    }, 30 * 60 * 1000);
  } catch (unexpectedError) {
    console.error('🔥 Unexpected error during startup:', unexpectedError);
    process.exit(1);
  }
};

startServer();
