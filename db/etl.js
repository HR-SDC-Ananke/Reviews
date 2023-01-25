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
    let count = 0;

    const readable = fs.createReadStream(reviewsFile).pipe(parse({ delimiter: ',', from_line: 2 }));

    readable.on('data', async (row) => {
      row = stripQuotes(row);
      if (count % 10000 === 0) {
        console.log(`${count} reviews loaded...`);
      }

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
      count++;
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
    let count = 0;

    const readable = fs.createReadStream(photosFile).pipe(parse({ delimiter: ",", from_line: 2 }));

    readable.on('data', async (row) => {
      if (count % 10000 === 0) {
        console.log(`${count} photos loaded...`);
      }
      row = stripQuotes(row);
      const id = row[0];
      const review_id = parseInt(row[1]);
      const url = row[2];
      readable.pause();
      const review = await mongodb.Review.findOne({ review_id });
      review.photos.push({ id, url });
      await review.save();
      count++;
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
    let count = 0;

    const readable = fs.createReadStream(charReviewsFile).pipe(parse({ delimiter: ",", from_line: 2 }));
    readable.on('data', async (row) => {
      if (count % 10000 === 0) {
        console.log(`${count} characteristic reviews loaded...`);
      }
      row = stripQuotes(row);
      const id = parseInt(row[1]);
      const review_id = parseInt(row[2]);
      const value = parseInt(row[3]);
      readable.pause();
      const review = await mongodb.Review.findOne({ review_id });
      review.characteristics.push({ name: '', id, value });
      await review.save();
      count++;
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
    let count = 0;

    const readable = fs.createReadStream(characteristicsFile).pipe(parse({ delimiter: ",", from_line: 2 }));
    readable.on('data', async (row) => {
      if (count % 10000 === 0) {
        console.log(`${count} characteristics loaded...`);
      }
      row = stripQuotes(row);
      const id = parseInt(row[0]);
      const product_id = parseInt(row[1]);
      const name = row[2];
      readable.pause();
      const reviews = await mongodb.Review.find({ 'characteristics.id': id });
      if (reviews) {
        if (count % 10000 === 0) {
          console.log(`number of reviews with this char id: ${reviews.length}`);
        }
        reviews.forEach(async (review) => {
          review.characteristics.filter(char => char.id === id)[0].name = name;
          await review.save();
          count++;
        });
      }
      readable.resume();
    });

    readable.on('end', () => {
      console.log('finished saving characteristics');
      resolve();
    });

    readable.on('error', err => reject(err));
  });
}

// run etl process with data
const runETL = async (reviewsFile, photosFile, charReviewsFile, characteristicsFile) => {
  console.time('etlProcess');
  await loadReviews(reviewsFile);
  await loadPhotos(photosFile);
  await loadCharReviews(charReviewsFile);
  await loadCharacteristics(characteristicsFile);
  console.timeEnd('etlProcess');
}

const updateReviewsData = async (photosFile, charReviewsFile, characteristicsFile) => {
  console.time('entireUpdateProcess');
  console.time('photosLoad');
  await loadPhotos(photosFile);
  console.timeEnd('photosLoad');
  console.time('charReviewsLoad');
  await loadCharReviews(charReviewsFile);
  console.timeEnd('charReviewsLoad');
  console.time('characteristicsLoad');
  await loadCharacteristics(characteristicsFile);
  console.timeEnd('characteristicsLoad');
  console.timeEnd('entireUpdateProcess');
}

// take command-line arguments for files and load
if (process.argv.length >= 5) {
  const filepaths = process.argv.slice(2).map(arg => path.join(__dirname, '../', arg));
  process.argv.length === 5 ? updateReviewsData(...filepaths) : runETL(...filepaths);
}

module.exports = { loadReviews, loadPhotos, loadCharacteristics, loadCharReviews };