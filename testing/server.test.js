const axios = require('axios');
const server = require('../server/index.js');
const mongoose = require('mongoose');
require('dotenv').config();
const { sortBy, getRatings, getRecommended, getCharacteristics } = require('../helpers/helpers.js');
const exampleData = require('../exampleData/exampleReviews.js');

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
      });
    });
  });

});