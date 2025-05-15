const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const LIMIT = parseInt(process.env.LIMIT || "300", 10);

app.use(express.json());

app.post('/', (req, res) => {
  const input = req.body.input;

  if (input < LIMIT) {
    return res.status(200).send('I am AMS, and I am available');
  } else {
    return res.status(503).send('AMS cannot handle this request');
  }
});

app.listen(PORT, () => {
  console.log(`AMS running on port ${PORT}, LIMIT < ${LIMIT}`);
});
