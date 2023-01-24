const path = require('path');
const mongoose = require('mongoose');
const etl = require('../db/etl.js');
const mongodb = require('../db/index.js');

const reviewsFile = path.join(__dirname, '../../data/reviews_small.csv');
const photosFile = path.join(__dirname, '../../data/reviews_photos_small.csv');
const characteristicsFile = path.join(__dirname, '../../data/characteristics_small.csv');
const charReviewsFile = path.join(__dirname, '../../data/characteristic_reviews_small.csv');

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
    expect(results.length).toBe(9);
  });

  it('should successfully add photos to reviews loaded in the database', async () => {
    await etl.loadReviews(reviewsFile);
    await etl.loadPhotos(photosFile);

    const results = await mongodb.Review.find({});
    expect(results.length).toBe(9);

    const review5 = await mongodb.Review.findOne({ review_id: 5 });
    expect(review5.photos).not.toBe(null);
    expect(review5.photos.length).toBe(3);
    expect(review5.photos.map(photo => photo.id).includes(2)).toBe(true);
    expect(review5.photos.map(photo => photo.id).includes(3)).toBe(true);
    expect(review5.photos.filter(photo => photo.id === 3)[0].url).toBe('https://images.unsplash.com/photo-1487349384428-12b47aca925e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80');
  });

  it('should successfully add characteristic reviews to the reviews loaded in the database', async () => {
    await etl.loadReviews(reviewsFile);
    await etl.loadCharReviews(charReviewsFile);

    const results = await mongodb.Review.find({});
    expect(results.length).toBe(9);

    const review1 = await mongodb.Review.findOne({ review_id: 1 });
    expect(review1.characteristics).not.toBe(null);
    expect(review1.characteristics.length).toBe(4);

    expect(review1.characteristics.filter(char => char.id === 4)[0].value).toBe(4);
  });

  it('should add characteristic names to all characteristics on all reviews loaded in the database', async () => {
    await etl.loadReviews(reviewsFile);
    await etl.loadCharReviews(charReviewsFile);
    await etl.loadCharacteristics(characteristicsFile);

    const results = await mongodb.Review.find({});
    expect(results.length).toBe(9);

    const review1 = await mongodb.Review.findOne({ review_id: 1 });
    expect(review1.characteristics).not.toBe(null);
    expect(review1.characteristics.length).toBe(4);

    const review2 = await mongodb.Review.findOne({ review_id: 2 });

    let charNames = ['Fit', 'Length', 'Comfort', 'Quality'];
    let fakeCharNames = ['Snugness', 'Opacity'];
    let chars = review1.characteristics.map(char => char.name);
    let chars2 = review2.characteristics.map(char2 => char2.name);
    charNames.forEach(charName => expect(chars.includes(charName) && chars2.includes(charName)).toBe(true));
    fakeCharNames.forEach(charName => expect(chars.includes(charName) || chars2.includes(charName)).toBe(false));
    expect(review1.characteristics.filter(char => char.id === 4)[0].value).toBe(4);
  });

  it('should load all data from all csv files into the database', async () => {
    console.time('etlTest');
    await etl.loadReviews(reviewsFile);
    await etl.loadPhotos(photosFile);
    await etl.loadCharReviews(charReviewsFile);
    await etl.loadCharacteristics(characteristicsFile);
    console.timeEnd('etlTest');

    const results = await mongodb.Review.find({});
    expect(results.length).toBe(9);

    const review1 = await mongodb.Review.findOne({ review_id: 1 });
    expect(review1.characteristics.length).toBe(4);
    const charNames = ['Fit', 'Length', 'Comfort', 'Quality'];
    let chars = review1.characteristics.map(char => char.name);
    charNames.forEach(charName => expect(chars.includes(charName)).toBe(true));

    const review5 = await mongodb.Review.findOne({ review_id: 5 });
    expect(review5.photos).not.toBe(null);
    expect(review5.photos.length).toBe(3);
    expect(review5.photos.map(photo => photo.id).includes(2)).toBe(true);
    expect(review5.photos.map(photo => photo.id).includes(3)).toBe(true);
    expect(review5.photos.filter(photo => photo.id === 3)[0].url).toBe('https://images.unsplash.com/photo-1487349384428-12b47aca925e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80');
  });
});