const mongoose = require('mongoose');
const { Schema } = mongoose;

// mongoose.set('strictQuery', false);
// mongoose.connect('mongodb://localhost:27017/sdc-reviews');

// Schemas
const reviewSchema = new Schema({
  review_id: { type: Number, index: true },
  product_id: Number,
  rating: Number,
  summary: String,
  recommended: Boolean,
  reported: Boolean,
  response: String,
  body: String,
  date: Date,
  reviewer_name: String,
  reviewer_email: String,
  helpfulness: Number,
  photos: [{ id: { type: Number, index: true }, url: String }],
  characteristics: [{ name: String, id: { type: Number, index: true }, value: Number }]
});

// const productMetaSchema = new Schema({
//   product_id: Number,
//   ratings: { 0: Number, 1: Number, 2: Number, 3: Number, 4: Number, 5: Number },
//   recommended: { true: Number, false: Number },
//   characteristics: [{ name: String, id: Number }]
// });

// Models
const Review = mongoose.model('Review', reviewSchema);
// const ProductMeta = mongoose.model('ProductMeta', productMetaSchema);

module.exports = { Review };