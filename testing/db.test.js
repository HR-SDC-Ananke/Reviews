const mongodb = require('../db/index.js');
const sqldb = require('../db/sql/models.js');

describe('Mongoose', () => {
  describe('Review Model', () => {
    it('should properly create an instance of the Review model', () => {
      const review = {
        review_id: 1,
        rating: 5,
        summary: "Great!",
        recommend: true,
        response: "Thanks",
        body: "Wow, what a great product!",
        date: new Date(),
        reviewer_name: "carl",
        helpfulness: 2,
        photos: [
          { id: 1, url: "photoUrl" },
          { id: 2, url: "photo2Url" }
        ]
      };
      const reviewInstance = new mongodb.Review(review);
      expect(reviewInstance).not.toBe(null);

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

  describe('ProductMeta Model', () => {
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

describe('SQL', () => {
  it('should properly create an instance of the Review model', () => {
    const review = {
      id: 7,
      rating: 5,
      summary: "Great!",
      recommend: true,
      response: "Thanks",
      body: "Wow, what a great product!",
      date: new Date(),
      reviewer_name: "carl",
      helpfulness: 2
    };
    const reviewInstance = sqldb.models.Review.build(review);
    expect(reviewInstance instanceof sqldb.models.Review).toBe(true);
    expect(reviewInstance.rating).toBe(5);
    expect(reviewInstance.id).toBe(7);

    const review2 = { id: 4, rating: 3, reviewer_name: 'carl' };
    const reviewInstance2 = sqldb.models.Review.build(review2);
    console.log(reviewInstance2);
    expect(reviewInstance2 instanceof sqldb.models.Review).toBe(true);
    expect(reviewInstance2.rating).toBe(3);
    expect(reviewInstance2.date).not.toBe(null);
  });
  it.todo('should properly create an instance of the Photo model');
  it.todo('should properly create an instance of the Recommended model');
  it.todo('should properly create an instance of the Rating model');
  it.todo('should properly create an instance of the CharacteristicRating model');
});