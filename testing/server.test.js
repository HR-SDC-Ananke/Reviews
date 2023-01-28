const axios = require('axios');
const server = require('../server/index.js');
const mongoose = require('mongoose');
require('dotenv').config();

describe('Reviews', () => {
  afterAll(async () => {
    await server.close();
    await mongoose.connection.close();
  });

  describe('Get /reviews/', () => {
    // increase allowable test time from 5000ms
    jest.setTimeout(10000);
    const url = `http://localhost:${process.env.PORT}`;

    it('should return all reviews for a given product id', async () => {
      const response = await axios.get(`${url}/reviews/?product_id=1`)
      .catch(err => console.log(`error getting product with id 1`));
      expect(response.data.length).toBe(2);
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
      expect(response.data.length).toBe(5);
    });
    it('should take a count parameter and return the correct number of reviews per page', async () => {
      const response = await axios.get(`${url}/reviews/?product_id=6000&count=7`)
      .catch(err => console.log(`error getting reviews for product 6000`));
      expect(response.data.length).toBe(7);
    });
    it('should take a page parameter and return the correct page', async () => {
      const response = await axios.get(`${url}/reviews/?product_id=6000`)
      .catch(err => console.log(`error getting reviews for product with id 6000`));
      const pagedResponse = await axios.get(`${url}/reviews/?product_id=6000&page=2`)
      .catch(err => console.log(`error getting reviews for product 6000 page 2`));
      expect(response.data.length).toBe(5);
      expect(pagedResponse.data.length).toBe(5);
      const review_ids = response.data.map(res => res.review_id);
      const page2_review_ids = pagedResponse.data.map(res => res.review_id);
      review_ids.forEach(review_id => expect(page2_review_ids.includes(review_id)).toBe(false));
    });
    it('should take a page and count parameter and return the correct reviews', async () => {
      const response = await axios.get(`${url}/reviews?product_id=6000&count=7&page=2`)
      .catch(err => console.log(`error getting reviews for product 6000 page 2 count 7`));
      expect(response.data.length).toBe(7);
    });
    describe('sort', () => {
      it('should sort reviews by helpfulness', async () => {
        const response = await axios.get(`${url}/reviews?product_id=6000&sort=helpful&count=12`)
        .catch(err => console.log(err));
        const sorted = response.data.slice().sort((a, b) => a.helpfulness - b.helpfulness);
        expect(response.data).toEqual(sorted);

        const unsorted = await axios.get(`${url}/reviews?product_id=6000&count=12`)
        .catch(err => console.log(err));
        expect(unsorted.data).not.toEqual(sorted);
      });
      // currently, relevance sort doesn't do anything but return '0'
      // still checking to make sure it's not broken
      it('should sort reviews by relevance', async () => {
        const response = await axios.get(`${url}/reviews?product_id=6000&sort=relevant`)
        .catch(err => console.log(err));
        expect(response.data.length).toBe(5);
      });
      it('should sort reviews by date', async () => {
        const response = await axios.get(`${url}/reviews?product_id=6000&count=12&sort=newest`)
        .catch(err => console.log(err));
        const sorted = response.data.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        expect(response.data).toEqual(sorted);
      });
    });
  });
});