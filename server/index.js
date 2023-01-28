const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const axios = require('axios');
const mongodb = require('../db/index.js');
const mongoose = require('mongoose');
const { sortBy, getRatings, getRecommended, getCharacteristics } = require('../helpers/helpers.js');

const app = express();

// middleware for logging requests to the console
app.use(morgan('tiny'));
app.use(express.json());

// connect to the database
mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/sdc-reviews');

app.get('/reviews/', async (req, res) => {
  console.log(`req params: ${JSON.stringify(req.query)}`);
  const count = parseInt(req.query.count || 5);
  const page = parseInt(req.query.page || 1) - 1;
  const sort = req.query.sort || "newest";
  const product_id = req.query.product_id;
  let reviews = [];

  if (!product_id) {
    reviews = await mongodb.Review.find({}).catch(err => res.sendStatus(400));
  } else {
    reviews = await mongodb.Review.find({ product_id }).catch(err => res.sendStatus(400));
  }

  if (!reviews.length) {
    res.sendStatus(400);
  } else {
    // rename 'recommended' key to 'recommend'
    reviews.forEach(review => {
      review.recommend = review.recommended;
      delete review['recommended'];
    });

    // sort the data
    reviews.sort((a, b) => sortBy(a, b, sort));
    if (reviews.length > page * count) {
      reviews = reviews.slice(page * count, (page + 1) * count);
    }

    const result = { product: product_id, page, count, results: reviews };
    res.status(200).send(result);
  }
});

app.get('/reviews/meta', async (req, res) => {
  const product_id = req.query.product_id;
  if (!product_id) return res.sendStatus(400);
  const reviews = await mongodb.Review.find({ product_id }).catch(err => res.sendStatus(400));

  let ratings = {};
  let recommended = {};
  let characteristics = {};
  if (reviews.length) {
    ratings = getRatings(reviews);
    recommended = getRecommended(reviews);
    characteristics = getCharacteristics(reviews);
  }

  const productMeta = { product_id, ratings, recommended, characteristics };
  res.status(200).send(productMeta);
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

module.exports = server;
