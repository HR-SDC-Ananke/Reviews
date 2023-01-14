const mongoose = require('mongoose');

// Schemas
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  review_id: Number,
  rating: Number,
  summary: String,
  recommend: Boolean,
  response: String,
  body: String,
  date: Date,
  reviewer_name: String,
  helpfulness: Number,
  photos: [{
    id: Number,
    url: String
  }]
});

const productMetaSchema = new Schema({
  product_id: Number,
  ratings: { 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number },
  recommended: { true: Number, false: Number },
  characteristics: [{ name: String, id: Number, value: Number }]
});