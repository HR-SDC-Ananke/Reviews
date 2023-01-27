const express = require('express');
require('dotenv').config();
const morgan = require('morgan');

const app = express();

// middleware for logging requests to the console
app.use(morgan('tiny'));

const port = process.env.PORT || 5000;
app.listen(() => {
  console.log(`listening on port ${port}...`);
});