const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const mongodb = require('./index.js');
const sqldb = require('./sql/models.js');

// helper function for removing single quotes from string data
const stripQuotes = (data) => data.map(entry => {
  if (entry[0] === '\'' && entry[entry.length - 1] === '\'') {
    return entry.substring(1, entry.length - 1);
  }
  return entry;
});

// file not hardcoded so I can test with smaller datasets
const loadReviews = (reviewsFile) => {
  return new Promise((resolve, reject) => {
    console.log(`loading reviews...`);

    fs.createReadStream(reviewsFile)
    .pipe(parse({ delimiter: ',', from_line: 2 }))
    .on('data', async (row) => {
      // console.log(row);
      row = stripQuotes(row);
      console.log(row);
      let review = {
        review_id: parseInt(row[0].replaceAll('\'', '')),
        product_id: parseInt(row[1].replaceAll('\'', '')),
        rating: parseInt(row[2].replaceAll('\'', '')),
        date: parseInt(row[3].replaceAll('\'', '')),
        summary: row[4],
        body: row[5],
        recommended: row[6] === 'true' ? true : false,
        reported: row[7] === 'true' ? true : false,
        reviewer_name: row[8],
        reviewer_email: row[9],
        response: row[10],
        helpfulness: parseInt(row[11].replaceAll('\'', '')),
        photos: []
      };
      console.log(JSON.stringify(review));
      const reviewInstance = new mongodb.Review(review);
      reviewInstance.save();
    })
    .on('end', async () => {
      console.log(`finished saving reviews`);
      resolve();
    })
    .on('error', (err) => reject(err))
  });
};

const loadPhotos = (photosFile) => {
  return new Promise((resolve, reject) => {
    console.log(`loading photos...`);
    resolve();
  });
};

const loadCharacteristics = (characteristicsFile) => {
  return new Promise((resolve, reject) => {
    console.log(`loading characteristics...`);
    resolve();
  });
}

const loadCharReviews = (charReviewsFile) => {
  return new Promise((resolve, reject) => {
    console.log(`loading characteristic reviews...`);
    resolve();
  });
}

module.exports = { loadReviews, loadPhotos, loadCharacteristics, loadCharReviews };