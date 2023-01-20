const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const mongodb = require('./index.js');
const sqldb = require('./sql/models.js');

// reviewsFile: path.join(__dirname, '../../data/reviews.csv')
// not hardcoded so I can test with smaller datasets
const loadReviews = (reviewsFile, cb) => {
  console.log(`loading reviews...`);

  fs.createReadStream(reviewsFile)
  .pipe(parse({ delimiter: ',', from_line: 2 }))
  .on('data', (row) => {
    const review = {
      review_id: row[0],
      product_id: row[1],
      rating: row[2],
      date: row[3],
      summary: row[4],
      body: row[5],
      recommended: row[6],
      reported: row[7],
      reviewer_name: row[8],
      reviewer_email: row[9],
      response: row[10],
      helpfulness: row[11],
      photos: []
    }
    console.log(JSON.stringify(review));
    const reviewInstance = new mongodb.Review(review);
    reviewInstance
    .save((err, result) => {
      if (err) return cb(err);
    });
  })
  .on('end', () => {
    console.log(`finished saving reviews`);
    cb();
  })
  .on('error', (err) => cb(err));
};

const loadPhotos = (photosFile, cb) => {
  console.log(`loading photos...`);
  cb();
};

const loadCharacteristics = (characteristicsFile, cb) => {
  console.log(`loading characteristics...`);
  cb();
}

const loadCharReviews = (charReviewsFile, cb) => {
  console.log(`loading characteristic reviews...`);
  cb();
}

module.exports = { loadReviews, loadPhotos, loadCharacteristics, loadCharReviews };