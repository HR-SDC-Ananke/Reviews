const path = require('path');
const mongoose = require('mongoose');
const etl = require('../db/etl.js');
const mongodb = require('../db/index.js');

const reviewsFile = path.join(__dirname, '../../data/reviews_small.csv');
const photosFile = path.join(__dirname, '../../data/reviews_photos_small.csv');
const characteristicsFile = path.join(__dirname, '../../data/characteristics_small.csv');
const charReviewsFile = path.join(__dirname, '../../data/characteristics_reviews_small.csv');

describe('Mongoose ETL', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/sdc-reviews');
  });

  afterAll(async () => {
    await mongodb.Review.deleteMany({});
    await mongodb.ProductMeta.deleteMany({});
    await mongoose.connection.close();
  });

  it('should load all csv files into the database in succession', async () => {
    await etl.loadReviews(reviewsFile)
    .then(() => etl.loadPhotos(photosFile))
    .then(() => etl.loadCharacteristics(characteristicsFile))
    .then(() => etl.loadCharReviews(charReviewsFile))
    .then(() => mongodb.Review.find({}))
    .then((results) => {
      console.log(JSON.stringify(results));
      expect(results.length).toBe(9);
    })
    .catch(err => console.log('error loading data', err));
  });
});