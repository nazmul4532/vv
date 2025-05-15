const express = require('express');
const app = express();

const PORT = process.env.PORT || 4000;
const LIMIT = parseInt(process.env.LIMIT || "500", 10);

app.use(express.json());

app.post('/', (req, res) => {
  const input = req.body.input;

  if (input > LIMIT) {
    return res.status(200).send('I am Kaifa, and I am available');
  } else {
    return res.status(503).send('Kaifa cannot handle this request');
  }
});

app.listen(PORT, () => {
  console.log(`Kaifa running on port ${PORT}, LIMIT > ${LIMIT}`);
});
