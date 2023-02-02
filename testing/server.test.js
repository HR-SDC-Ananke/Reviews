const axios = require('axios');
const server = require('../server/index.js');
const mongoose = require('mongoose');
require('dotenv').config();
const { sortBy, getRatings, getRecommended, getCharacteristics } = require('../helpers/helpers.js');
const exampleData = require('../exampleData/exampleReviews.js');
const mongodb = require('../db/index.js');

describe('Reviews', () => {
  afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
  });

  describe('Helper Functions', () => {
    const reviews = exampleData.product6000Reviews;

    describe('sortBy', () => {
      it('should sort reviews by helpfulness', () => {
        const expected = reviews.slice().sort((a, b) => b.helpfulness - a.helpfulness);
        const result = reviews.slice().sort((a, b) => sortBy(a, b, 'helpful'));
        expect(result).toEqual(expected);

        let isSorted = true;
        for (let i = 0; i < result.length - 1; i++) {
          if (result[i].helpfulness < result[i+1].helpfulness) isSorted = false;
        }
        expect(isSorted).toBe(true);
      });
      it('should sort reviews by date', () => {
        const expected = reviews.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const result = reviews.slice().sort((a, b) => sortBy(a, b, 'newest'));
        expect(result).toEqual(expected);

        let isSorted = true;
        for (let i = 0; i < result.length - 1; i++) {
          if (new Date(result[i].date).getTime() > new Date(result[i+1].date).getTime()) isSorted = false;
        }
        expect(isSorted).toBe(true);
      });
      it.todo('should sort reviews by relevance');
    });
    describe('getRatings', () => {
      it('should return a ratings object with correct values', () => {
        const expected = { 1: 2, 2: 3, 3: 1, 4: 3, 5: 5 };
        const result = getRatings(reviews);
        expect(result).toEqual(expected);
      });
    });
    describe('getRecommended', () => {
      it('should return a recommended object with the correct values', () => {
        const expected = { 0: 2, 1: 12 };
        const result = getRecommended(reviews);
        expect(result).toEqual(expected);
      });
    });
    describe('getCharacteristics', () => {
      it('should return a characteristics object with the correct values', () => {
        const expected = { "Quality": { id: 19956, value: "3.0714" } };
        const result = getCharacteristics(reviews);
        expect(Object.keys(result).length).toBe(Object.keys(expected).length);
        Object.keys(result).forEach(charName => {
          expect(result[charName]).toEqual(expected[charName]);
        });
      });
    });
  });

  describe('Routes', () => {
    describe('Get /reviews/', () => {
      // increase allowable test time from 5000ms
      jest.setTimeout(10000);
      const url = `http://localhost:${process.env.PORT}`;

      it('should return all reviews for a given product id', async () => {
        const response = await axios.get(`${url}/reviews/?product_id=1`)
        .catch(err => console.log(`error getting product with id 1`));
        expect(response.data.results.length).toBe(2);
        expect(response.status).toBe(200);
      });
      it('should send a status code of 400 for a bad request', async () => {
        const response = await axios.get(`${url}/reviews/?product_id=-3`)
        .catch(err => expect(err.response.status).toBe(400));
        expect(response).toBe(undefined);
      });
      it('should default to page 1 and count 5 when given no query params', async () => {
        const response = await axios.get(`${url}/reviews/?product_id=6000`)
        .catch(err => console.log(`error getting reviews for product with id 6000`));
        expect(response.data.results.length).toBe(5);
        expect(response.data.page).toBe(0);
        expect(response.data.count).toBe(5);
      });
      it('should take a count parameter and return the correct number of reviews per page', async () => {
        const response = await axios.get(`${url}/reviews/?product_id=6000&count=7`)
        .catch(err => console.log(`error getting reviews for product 6000`));
        expect(response.data.results.length).toBe(7);
        expect(response.data.count).toBe(7);
      });
      it('should take a page parameter and return the correct page', async () => {
        const response = await axios.get(`${url}/reviews/?product_id=6000`)
        .catch(err => console.log(`error getting reviews for product with id 6000`));
        const pagedResponse = await axios.get(`${url}/reviews/?product_id=6000&page=2`)
        .catch(err => console.log(`error getting reviews for product 6000 page 2`));
        expect(response.data.results.length).toBe(5);
        expect(pagedResponse.data.results.length).toBe(5);
        const review_ids = response.data.results.map(res => res.review_id);
        const page2_review_ids = pagedResponse.data.results.map(res => res.review_id);
        review_ids.forEach(review_id => expect(page2_review_ids.includes(review_id)).toBe(false));
        expect(response.data.page).toBe(0);
        expect(pagedResponse.data.page).toBe(1);
      });
      it('should take a page and count parameter and return the correct reviews', async () => {
        const response = await axios.get(`${url}/reviews?product_id=6000&count=7&page=2`)
        .catch(err => console.log(`error getting reviews for product 6000 page 2 count 7`));
        expect(response.data.results.length).toBe(7);
        expect(response.data.page).toBe(1);
        expect(response.data.count).toBe(7);
      });
      describe('sort', () => {
        it('should sort reviews by helpfulness', async () => {
          const response = await axios.get(`${url}/reviews?product_id=6000&sort=helpful&count=12`)
          .catch(err => console.log(err));
          const sorted = response.data.results.slice().sort((a, b) => b.helpfulness - a.helpfulness);
          expect(response.data.results).toEqual(sorted);

          const unsorted = await axios.get(`${url}/reviews?product_id=6000&count=12`)
          .catch(err => console.log(err));
          expect(unsorted.data.results).not.toEqual(sorted);

          let isSorted = true;
          for (let i = 0; i < response.data.results.length - 1; i++) {
            if (response.data.results[i].helpfulness < response.data.results[i+1].helpfulness) isSorted = false;
          }
          expect(isSorted).toBe(true);
        });
        // currently, relevance sort doesn't do anything but return '0'
        // still checking to make sure it's not broken
        it('should sort reviews by relevance', async () => {
          const response = await axios.get(`${url}/reviews?product_id=6000&sort=relevant`)
          .catch(err => console.log(err));
          expect(response.data.results.length).toBe(5);
        });
        it('should sort reviews by date', async () => {
          const response = await axios.get(`${url}/reviews?product_id=6000&count=12&sort=newest`)
          .catch(err => console.log(err));
          const sorted = response.data.results.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          expect(response.data.results).toEqual(sorted);
        });

        it.todo('should not return reported reviews');
      });
    });

    describe('Get /reviews/meta', () => {
      jest.setTimeout(10000);
      const url = `http://localhost:${process.env.PORT}`;

      it('should get meta data for a given product_id', async () => {
        const response = await axios.get(`${url}/reviews/meta?product_id=1`)
        .catch(err => console.log(err));
        const expected = { product_id: "1", ratings: { 4: 1, 5: 1 },
          recommended: { 0: 1, 1: 1 },
          characteristics: {
            Fit: { id: 1, value: "4.0000" },
            Length: { id: 2, value: "3.5000" },
            Comfort: { id: 3, value: "5.0000" },
            Quality: { id: 4, value: "4.0000" }
          }
        };
        const wrong = { product_id: 1, ratings: { 4: 1, 5: 1 },
          recommended: { 0: 1, 1: 1 },
          characteristics: {
            Fit: { id: 1, value: "2.5000" },
            Length: { id: 7, value: "3.5000" },
            Comfort: { id: 3, value: "5.0000" },
            Quality: { id: 4, value: "3.0000" }
          }
        };
        expect(response.data).toEqual(expected);
        expect(response.data).not.toEqual(wrong);
      });
    });

    describe.skip('POST /reviews', () => {
      // TO DO, DELETE THE NEW REVIEWS FROM THE DATABASE AFTER TESTING
      const url = `http://localhost:${process.env.PORT}`;

      it('should post a new review to the database', async () => {
        const review = {
          product_id: "2",
          rating: 5,
          summary: "great product!",
          body: "really great product. I'm happy, lol",
          recommend: true,
          name: "carl",
          email: "carl@gmail.com",
          photos: ["photourl.com", "photo2.url.com"],
          characteristics: { "5": 3 }
        };
        const count = await mongodb.Review.find({ product_id: 2 }).count();

        let newReview = await axios.post(`${url}/reviews`, review).catch(err => console.log(err));
        console.log(newReview.data);
        let reviewInDatabase = await mongodb.Review.findOne({ review_id: newReview.data.review_id }).catch(err => console.log(err));
        expect(reviewInDatabase).not.toBe(undefined);
        expect(reviewInDatabase.summary).toBe(review.summary);

        const newCount = await mongodb.Review.find({ product_id: 2 }).count();
        expect(newCount).toBe(count + 1);

      });
    });

    describe('PUT /reviews/:review_id/helpful', () => {
      const url = `http://localhost:${process.env.PORT}`;
      it('should increment helpfulness on PUT request', async () => {
        const review_id = 1;
        const review = await mongodb.Review.findOne({ review_id });
        const helpfulness = review.helpfulness;
        const response = await axios.put(`${url}/reviews/${review_id}/helpful`);
        expect(response.status).toBe(204);
        const updated = await mongodb.Review.findOne({ review_id });
        const result = updated.helpfulness;
        expect(result).toBe(helpfulness + 1);
      });
    });

    describe('PUT /reviews/:review_id/report', () => {
      const url = `http://localhost:${process.env.PORT}`;
      it('should updated reported field on PUT report request', async () => {
        const review_id = 2000;
        const review = await mongodb.Review.findOne( { review_id });
        const reported = review.reported;
        expect(reported).toBe(false);
        const response = await axios.put(`${url}/reviews/${review_id}/report`);
        expect(response.status).toBe(204);

        const updated = await mongodb.Review.findOne({ review_id });
        const result = updated.reported;
        expect(result).toBe(true);

        const changeBack = await mongodb.Review.findOneAndUpdate({ review_id }, { reported });
        const newResult = await mongodb.Review.findOne({ review_id });
        expect(newResult.reported).toBe(false);
      });
    });
  });
});