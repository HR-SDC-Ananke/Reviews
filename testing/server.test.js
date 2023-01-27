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
    const url = `http://localhost:${process.env.PORT}`;
    it('should return all reviews for a given product id', async () => {
      const response = await axios.get(`${url}/reviews/1`)
      .catch(err => console.log(err));
      expect(response.data.length).toBe(2);
      expect(response.status).toBe(200);
    });
    it('should send a status code of 400 for a bad request', async () => {
      const response = await axios.get(`${url}/reviews/-3`)
      .catch(err => expect(err.response.status).toBe(400));
      expect(response).toBe(undefined);
    })
  });
});