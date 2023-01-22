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

    const readable = fs.createReadStream(reviewsFile).pipe(parse({ delimiter: ',', from_line: 2 }));

    readable.on('data', async (row) => {
      row = stripQuotes(row);

      let review = {
        review_id: parseInt(row[0]),
        product_id: parseInt(row[1]),
        rating: parseInt(row[2]),
        date: parseInt(row[3]),
        summary: row[4],
        body: row[5],
        recommended: row[6] === 'true' ? true : false,
        reported: row[7] === 'true' ? true : false,
        reviewer_name: row[8],
        reviewer_email: row[9],
        response: row[10],
        helpfulness: parseInt(row[11]),
        photos: []
      };

      const reviewInstance = new mongodb.Review(review);
      readable.pause();
      await reviewInstance.save();
      readable.resume();
    });
    readable.on('end', () => {
      console.log(`finished saving reviews`);
      resolve();
    });
    readable.on('error', (err) => reject(err));
  });
};

const loadPhotos = (photosFile) => {
  return new Promise((resolve, reject) => {
    console.log(`loading photos...`);

    const readable = fs.createReadStream(photosFile).pipe(parse({ delimiter: ",", from_line: 2 }));

    readable.on('data', async (row) => {
      row = stripQuotes(row);
      const id = row[0];
      const review_id = parseInt(row[1]);
      const url = row[2];
      readable.pause();
      const review = await mongodb.Review.findOne({ review_id });
      console.log(`review for review_id ${review_id}: ${review}`);
      review.photos.push({ id, url });
      await review.save();
      readable.resume();
    });

    readable.on('end', () => {
      console.log('finished saving photos');
      resolve();
    });

    readable.on('error', err => reject(err));
  });
};


const loadCharReviews = (charReviewsFile) => {
  return new Promise((resolve, reject) => {
    console.log(`loading characteristic reviews...`);

    const readable = fs.createReadStream(charReviewsFile).pipe(parse({ delimiter: ",", from_line: 2 }));
    readable.on('data', async (row) => {
      row = stripQuotes(row);
      const id = parseInt(row[1]);
      const review_id = parseInt(row[2]);
      const value = parseInt(row[3]);
      readable.pause();
      const review = await mongodb.Review.findOne({ review_id });
      console.log(`review with id: ${review_id}: ${review}`);
      review.characteristics.push({ name: '', id, value });
      await review.save();
      console.log(`updated review ${review_id}: ${review}`);
      readable.resume();
    });

    readable.on('end', () => {
      console.log('finished saving characteristic reviews');
      resolve();
    });

    readable.on('error', err => reject(err));
  });
}

const loadCharacteristics = (characteristicsFile) => {
  return new Promise((resolve, reject) => {
    console.log(`loading characteristics...`);

    const readable = fs.createReadStream(characteristicsFile).pipe(parse({ delimiter: ",", from_line: 2 }));
    readable.on('data', async (row) => {
      row = stripQuotes(row);
      const id = parseInt(row[0]);
      const product_id = parseInt(row[1]);
      const name = row[2];
      readable.pause();
      const review = await mongodb.Review.findOne({ characteristics: { id } });
      review.characteristics.filter(char => char.id === id)[0].name = name;
      review.save();
      readable.resume();
    });

    readable.on('end', () => {
      console.log('finished saving characteristics');
      resolve();
    });

    readable.on('error', err => reject(err));
  });
}


module.exports = { loadReviews, loadPhotos, loadCharacteristics, loadCharReviews };