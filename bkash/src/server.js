if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const indexRoutes = require('./routes/index.routes');
const { checkAllServicesHealth } = require('./controllers/handler.controller');

const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use('/', indexRoutes);

// Run initial background health check before starting the server
checkAllServicesHealth().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Bkash running on port ${PORT}`);
  });

  // Run health checks every 30 minutes (background)
  setInterval(() => {
    checkAllServicesHealth();
  }, 30 * 60 * 1000);
});
