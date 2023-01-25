const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const mongodb = require('../db/index.js');
const sqldb = require('../db/sql/models.js');

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
    let buffer = [];

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
        photos: [],
        characteristics: []
      };

      const reviewInstance = new mongodb.Review(review);
      buffer.push({ insertOne: { document: reviewInstance } });
      if (count % 10000 === 0) {
        readable.pause();
        await mongodb.Review.bulkWrite(buffer);
        readable.resume();
        buffer = [];
      }
      count++;
    });

    readable.on('end', async () => {
      if (buffer.length) {
        readable.pause();
        await mongodb.Review.bulkWrite(buffer);
        readable.resume();
      }
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
    let buffer = [];

    const readable = fs.createReadStream(photosFile).pipe(parse({ delimiter: ",", from_line: 2 }));

    readable.on('data', async (row) => {
      if (count % 10000 === 0) {
        console.log(`${count} photos loaded...`);
      }
      row = stripQuotes(row);
      const id = row[0];
      const review_id = parseInt(row[1]);
      const url = row[2];
      const update = {
        updateOne: {
          filter: { review_id },
          update: { $push: { photos: { id, url } } }
        }
      };
      buffer.push(update);
      if (count % 10000 === 0) {
        readable.pause();
        await mongodb.Review.bulkWrite(buffer);
        readable.resume();
        buffer = [];
      }
      count++;
    });

    readable.on('end', async () => {
      if (buffer.length) {
        readable.pause();
        await mongodb.Review.bulkWrite(buffer);
        readable.resume();
      }
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
    let buffer = [];

    const readable = fs.createReadStream(charReviewsFile).pipe(parse({ delimiter: ",", from_line: 2 }));
    readable.on('data', async (row) => {
      if (count % 10000 === 0) {
        console.log(`${count} characteristic reviews loaded...`);
      }
      row = stripQuotes(row);
      const id = parseInt(row[1]);
      const review_id = parseInt(row[2]);
      const value = parseInt(row[3]);
      const update = {
        updateOne: {
          filter: { review_id },
          update: { $push: { characteristics: { name: '', id, value } } }
        }
      };
      buffer.push(update);
      if (count % 10000 === 0) {
        readable.pause();
        await mongodb.Review.bulkWrite(buffer);
        readable.resume();
        buffer = [];
      }
      count++;
    });

    readable.on('end', async () => {
      if (buffer.length) {
        readable.pause();
        await mongodb.Review.bulkWrite(buffer);
        readable.resume();
      }
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
    let buffer = [];

    const readable = fs.createReadStream(characteristicsFile).pipe(parse({ delimiter: ",", from_line: 2 }));
    readable.on('data', async (row) => {
      if (count % 10000 === 0) {
        console.log(`${count} characteristics loaded...`);
      }
      row = stripQuotes(row);
      const id = parseInt(row[0]);
      const product_id = parseInt(row[1]);
      const name = row[2];
      const update = {
        updateMany: {
          filter: { 'characteristics.id': id },
          update: { $set: { 'characteristics.$[char].name': name } },
          arrayFilters: [{ 'char.id': id }]
        }
      };
      buffer.push(update);
      if (count % 10000 === 0) {
        readable.pause();
        await mongodb.Review.bulkWrite(buffer);
        readable.resume();
        buffer = [];
      }
      count++;
    });

    readable.on('end', async () => {
      if (buffer.length) {
        readable.pause();
        await mongodb.Review.bulkWrite(buffer);
        readable.resume();
      }
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
if (process.argv.length >= 5 && argv[1] === 'run') {
  const filepaths = process.argv.slice(2).map(arg => path.join(__dirname, '../', arg));
  process.argv.length === 5 ? updateReviewsData(...filepaths) : runETL(...filepaths);
}

module.exports = { loadReviews, loadPhotos, loadCharacteristics, loadCharReviews };