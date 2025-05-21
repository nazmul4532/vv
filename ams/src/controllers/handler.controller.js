const LIMIT = parseInt(process.env.LIMIT || "300", 10);

const handlePost = (req, res) => {
  const input = req.body.input;

  if (input < LIMIT) {
    return res.status(200).send('I am AMS, and I am available');
  } else {
    return res.status(503).send('AMS cannot handle this request');
  }
};

const healthCheck = (req, res) => {
  res.status(200).send('AMS is healthy');
};

module.exports = { handlePost, healthCheck };
