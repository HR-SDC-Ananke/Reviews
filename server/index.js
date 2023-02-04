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
    res.status(400).send(reviews);
  } else {
    // rename 'recommended' key to 'recommend'
    reviews.forEach(review => {
      review.recommend = review.recommended;
      delete review['recommended'];
    });

    // filter out reported reviews
    let unreported = reviews.filter(review => !review.reported);

    // sort the data
    unreported.sort((a, b) => sortBy(a, b, sort));
    if (unreported.length > page * count) {
      unreported = unreported.slice(page * count, (page + 1) * count);
    }

    const result = { product: product_id, page, count, results: unreported };
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

app.post('/reviews', async (req, res) => {
  // will need to make unique later
  let photos = [];
  if (req.body.photos.length) {
    photos = req.body.photos.map(photo => {
      return { id: Math.floor((Math.random() * 1000000000) + 5000000), url: photo }
    });
  }
  let data = await mongodb.Review.findOne({
    product_id: parseInt(req.body.product_id)
  }, { "characteristics": 1, "_id": 0 })
  .catch(err => console.log(`error retrieving data`, err));

  let chars = data.characteristics;

  console.log(JSON.stringify(chars));

  let characteristics = chars.map(char => {
    let result = Object.keys(req.body.characteristics)
    .map(charId => ({ id: parseInt(charId), value: req.body.characteristics[charId] }))
    .filter(charObj => charObj.id === char.id)[0];
    result.name = char.name;
    return result;
  });
  let review = {
    product_id: parseInt(req.body.product_id),
    rating: req.body.rating,
    summary: req.body.summary,
    recommended: req.body.recommend || false,
    reported: false,
    body: req.body.body,
    date: Date.now(),
    reviewer_name: req.body.name || "anonymous",
    reviewer_email: req.body.email || "",
    helpfulness: 0,
    photos,
    characteristics // need to transform
  }

  if (!review.rating || !review.summary || !review.body || !review.characteristics.length) {
    return res.sendStatus(400);
  }

  let review_id = Math.floor((Math.random() * 1000000000) + 5000000);
  let review_id_exists = await mongodb.Review.find({ review_id }).count();
  while (review_id_exists) {
    review_id = Math.floor((Math.random() * 1000000000) + 5000000);
    review_id_exists = await mongodb.Review.find({ review_id }).count();
  }

  review.review_id = review_id;

  let newReview = await (new mongodb.Review(review)).save().catch(err => console.log(err));
  res.status(201).send(newReview);
});

app.put(`/reviews/:review_id/helpful`, async (req, res) => {
  const review_id = req.params.review_id;
  const update = await mongodb.Review.findOneAndUpdate({ review_id }, { $inc: { helpfulness: 1 } });
  res.sendStatus(204);
});

app.put(`/reviews/:review_id/report`, async (req, res) => {
  const review_id = req.params.review_id;
  const update = await mongodb.Review.findOneAndUpdate({ review_id }, { reported: true });
  res.sendStatus(204);
})

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`listening on port ${port}...`);
});

module.exports = server;
