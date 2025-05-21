if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const app = require('./app');
const connectToDatabase = require('./config/db');

const PORT = process.env.PORT || 4000;

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Kaifa running on port ${PORT}`);
  });
});

