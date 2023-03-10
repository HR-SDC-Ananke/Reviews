import http from 'k6/http';
import { sleep, check } from 'k6';
const productIds = require('../exampleData/productIds.js');

const target = 100; // requests per second

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      stages: [
        { duration: '10s', target },
        { duration: '30s', target },
        { duration: '10s', target: 0 }
      ]
    }
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<50']
  }
};

export default function () {
  const url = 'http://localhost:5000';
  const id = productIds[Math.floor(Math.random() * productIds.length)];
  const reviewsByProduct = http.get(`${url}/reviews?product_id=${id}`);
  check(reviewsByProduct, { 'Get status is 200': r => r.status === 200 });
  sleep(1);
}