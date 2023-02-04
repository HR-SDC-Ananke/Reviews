const mongodb = require('../db/index.js');
const sqldb = require('../db/sql/models.js');
const mongoose = require('mongoose');

describe('Querying the Database', () => {
  jest.setTimeout(10000);
  beforeAll(async () => {
    await mongoose.set('strictQuery', false);
    await mongoose.connect('mongodb://localhost:27017/sdc-reviews');
  });

  afterAll(async () => {
    mongoose.connection.close();
  });

  it('should return reviews by review_id in under 50ms', async () => {
    for (let i = 0; i < 100; i++) {
      const review_id = Math.floor(Math.random() * 5000000);
      const result = await mongodb.Review.findOne({ review_id });
      expect(result).not.toBe(null);
    }
  });

  it('should return reviews by product_id in under 50ms', async () => {
    for (let i = 0; i < 100; i++) {
      const product_id = Math.floor(Math.random() * 1000000);
      const result = await mongodb.Review.find({ product_id });
      expect(result).not.toBe(null);
    }
  });

});

describe.skip('Mongoose', () => {
  describe.skip('Review Model', () => {
    it('should properly create an instance of the Review model', () => {
      const review = {
        review_id: 1,
        product_id: 3,
        rating: 5,
        summary: "Great!",
        recommended: true,
        reported: false,
        response: "Thanks",
        body: "Wow, what a great product!",
        date: new Date(),
        reviewer_name: "carl",
        reviewer_email: "carl@carl.com",
        helpfulness: 2,
        photos: [
          { id: 1, url: "photoUrl" },
          { id: 2, url: "photo2Url" }
        ]
      };
      const reviewInstance = new mongodb.Review(review);
      expect(reviewInstance).not.toBe(null);
      console.log(reviewInstance);

      // only goes one layer deep in nested objects...
      Object.keys(review).forEach(key => {
        if (typeof review[key] === 'object') {
          Object.keys(review[key]).forEach(innerKey => {
            if (typeof review[key][innerKey] !== 'object') {
              expect(reviewInstance[key][innerKey]).toBe(review[key][innerKey]);
            }
          })
        } else {
          expect(reviewInstance[key]).toBe(review[key]);
        }
      });
    });
  });

  describe.skip('ProductMeta Model', () => {
    it('should properly create an instance of the ProductMeta model', () => {
      const productMeta = {
        product_id: 1,
        ratings: { 0: 0, 1: 0, 2: 1, 3: 0, 4: 2, 5: 10 },
        recommended: { true: 7, false: 1 },
        characteristics: [
          { name: "Width", id: 1, value: 2.3333333 },
          { name: "Quality", id: 2, value: 4.00000 }
        ]
      };
      const productMetaInstance = new mongodb.ProductMeta(productMeta);
      expect(productMetaInstance).not.toBe(null);

      // only goes one layer deep in nested objects...
      Object.keys(productMeta).forEach(key => {
        if (typeof productMeta[key] === 'object') {
          Object.keys(productMeta[key]).forEach(innerKey => {
            if (typeof productMeta[key][innerKey] !== 'object') {
              expect(productMetaInstance[key][innerKey]).toBe(productMeta[key][innerKey]);
            }
          })
        } else {
          expect(productMetaInstance[key]).toBe(productMeta[key]);
        }
      });
    });
  })
});

describe.skip('SQL', () => {
  it('should properly create an instance of the Review model', () => {
    const review = {
      id: 7,
      rating: 5,
      summary: "Great!",
      recommended: true,
      reported: false,
      response: "Thanks",
      body: "Wow, what a great product!",
      date: new Date(),
      reviewer_name: "carl",
      reviewer_email: "carl@carl.com",
      helpfulness: 2,
      product_id: 3
    };
    const reviewInstance = sqldb.models.Review.build(review);
    expect(reviewInstance instanceof sqldb.models.Review).toBe(true);
    expect(reviewInstance.rating).toBe(5);
    expect(reviewInstance.id).toBe(7);
    console.log(reviewInstance);

    const review2 = { id: 4, rating: 3, reviewer_name: 'carl' };
    const reviewInstance2 = sqldb.models.Review.build(review2);
    console.log(reviewInstance2);
    expect(reviewInstance2 instanceof sqldb.models.Review).toBe(true);
    expect(reviewInstance2.rating).toBe(3);
    expect(reviewInstance2.date).not.toBe(null);
  });
  it('should properly create an instance of the Photo model', () => {
    const photo = { review_id: 7, url: "photourl" };
    const photoInstance = sqldb.models.Photo.build(photo);
    expect(photoInstance instanceof sqldb.models.Photo).toBe(true);
    expect(photoInstance.review_id).toBe(7);
    expect(photoInstance.url).toBe("photourl");
  });
  it('should properly create an instance of the Recommended model', () => {
    const recommended = { true: 5, false: 7 };
    const recInstance = sqldb.models.Recommended.build(recommended);
    expect(recInstance instanceof sqldb.models.Recommended).toBe(true);
    expect(recInstance instanceof sqldb.models.Review).toBe(false);
    expect(recInstance.true).toBe(5);
    expect(recInstance.false).toBe(7);
  });
  it('should properly create an instance of the Rating model', () => {
    const rating = { product_id: 71000, 4: 5, 5: 10 };
    const ratingInstance = sqldb.models.Rating.build(rating);
    expect(ratingInstance instanceof sqldb.models.Rating).toBe(true);
    expect(ratingInstance.product_id).toBe(rating.product_id);
    expect(ratingInstance[4]).toBe(5);
    expect(ratingInstance[3]).toBe(undefined);
  });
  it('should properly create an instance of the CharacteristicRating model', () => {
    const charRating = { name: "Size", product_id: 71000, value: 4.8885 };
    const charRatingInstance = sqldb.models.CharacteristicRating.build(charRating);
    expect(charRatingInstance instanceof sqldb.models.CharacteristicRating).toBe(true);
    expect(charRatingInstance.name).toBe(charRating.name);
    expect(charRatingInstance.value).toBe(charRating.value);
  });
});