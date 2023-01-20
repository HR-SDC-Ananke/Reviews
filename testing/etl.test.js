const etl = require('../db/etl.js');
const mongodb = require('../db/index.js');
const path = require('path');

const reviewsFile = path.join(__dirname, '../../data/reviews_small.csv');
const photosFile = path.join(__dirname, '../../data/reviews_photos_small.csv');
const characteristicsFile = path.join(__dirname, '../../data/characteristics_small.csv');
const charReviewsFile = path.join(__dirname, '../../data/characteristics_reviews_small.csv');

describe('Mongoose ETL', () => {
  it('should load all csv files into the database in succession', () => {
    etl.loadReviews(reviewsFile, (err) => {
      if (err) return console.log(`error loading reviewsFile:`, err);

      etl.loadPhotos(photosFile, (err) => {
        if (err) return console.log('error loading photosFile', err);

        etl.loadCharacteristics(characteristicsFile, (err) => {
          if (err) return console.log('error loading characteristicsFile', err);

          etl.loadCharReviews(charReviewsFile, (err) => {
            if (err) return console.log('error loadking charReviewsFile', err);

            mongodb.Review.find({}, (err, results) => {
              if (err) return console.log('error getting data from mongodb', err);
              console.log(JSON.stringify(results));
              expect(results).not.toBe(null);
            });
          });
        });
      });
    });
  });
});