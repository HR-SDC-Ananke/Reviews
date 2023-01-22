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

  beforeEach(async () => {
    await mongodb.Review.deleteMany({});
    // await mongodb.ProductMeta.deleteMany({});
  });

  afterEach(async () => {
    await mongodb.Review.deleteMany({});
    // await mongodb.ProductMeta.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should successfully load reviews into the database in succession', async () => {
    await etl.loadReviews(reviewsFile);

    const results = await mongodb.Review.find({});
    // console.log(JSON.stringify(results, null, 2));
    expect(results.length).toBe(9);
  });

  it('should successfully add photos to reviews loaded in the database', async () => {
    await etl.loadReviews(reviewsFile);
    await etl.loadPhotos(photosFile);

    const results = await mongodb.Review.find({});
    expect(results.length).toBe(9);

    const review5 = await mongodb.Review.findOne({ review_id: 5 });
    console.log(`review5: ${review5.photos}`);
    expect(review5.photos).not.toBe(null);
    expect(review5.photos.length).toBe(3);
    expect(review5.photos.map(photo => photo.id).includes(2)).toBe(true);
    expect(review5.photos.map(photo => photo.id).includes(3)).toBe(true);
    expect(review5.photos.filter(photo => photo.id === 3)[0].url).toBe('https://images.unsplash.com/photo-1487349384428-12b47aca925e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80');
  });

  it('should successfully add characteristics to the reviews loaded in the database', async () => {
    await etl.loadCharacteristics(characteristicsFile);

    const results = await mongodb.product

  });

  it.todo('should successfully add characteristic reviews to the reviews loaded in the database');

  it.todo('should load all data from all csv files into the database');
});