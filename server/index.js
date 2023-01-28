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
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/sdc-reviews');

app.get('/reviews/', async (req, res) => {
  console.log(`req params: ${JSON.stringify(req.query)}`);
  const count = req.query.count || 5;
  const page = req.query.page || 1;
  const sort = req.query.sort || "newest";
  const product_id = req.query.product_id;
  let reviews;

  if (!product_id) {
    reviews = await mongodb.Review.find({}).catch(err => res.sendStatus(400));
  } else {
    reviews = await mongodb.Review.find({ product_id }).catch(err => res.sendStatus(400));
  }

  const sortBy = (a, b, descriptor) => {
    if (descriptor === 'newest') return a.date.getTime() - b.date.getTime();
    if (descriptor === 'helpful') return a.helpfulness - b.helpfulness;
    return 0;
  }

  reviews.sort((a, b) => sortBy(a, b, sort));
  if (reviews.length > (page - 1) * count) {
    reviews = reviews.slice((page - 1) * count, page * count);
  }

  !reviews.length ? res.sendStatus(400) : res.status(200).send(reviews);
});


const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

module.exports = server;
