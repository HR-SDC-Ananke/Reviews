const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schemas
const reviewSchema = new Schema({
  review_id: { type: Number, index: true, unique: true },
  product_id: { type: Number, index: true },
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


// Models
const Review = mongoose.model('Review', reviewSchema);

module.exports = { Review };