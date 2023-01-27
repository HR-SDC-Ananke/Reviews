const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const axios = require('axios');
const mongodb = require('../db/index.js');
const mongoose = require('mongoose');

const app = express();

// middleware for logging requests to the console
app.use(morgan('tiny'));
app.use(express.json());

// connect to the database
mongoose.connect('mongodb://localhost:27017/sdc-reviews');

app.get('/reviews/:product_id', async (req, res) => {
  console.log(`req params: ${JSON.stringify(req.params)}`);
  const reviews = await mongodb.Review.find({
    product_id: req.params.product_id
  })
  .catch(err => {
    console.log(`error retrieving reviews for product ${product_id}`, err);
    res.sendStatus(500);
  });

  !reviews.length ? res.sendStatus(400) : res.status(200).send(reviews);
});


const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

module.exports = server;
