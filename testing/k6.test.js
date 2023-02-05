import http from 'k6/http';
import { sleep, check } from 'k6';
const productIds = require('../exampleData/productIds.js');

// TODO
// 1. Generate set of valid product_ids
// 2. Create multiple scenarios using vus and sleeping
// 3. Make test files for each get request

export const options = {
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      stages: [
        { duration: '5s', target: 10 },
        { duration: '10s', target: 10 },
        { duration: '5s', target: 0 }
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
  // console.log(`id: ${id}`);
  check(reviewsByProduct, {
    'Get status is 200': r => r.status === 200
  });

  // const productMeta = http.get(`${url}/reviews/meta?product_id=${id}`);
  // check(productMeta, {
  //   'Get status is 200': r => r.status === 200,
  //   'Get valid product_id': r => r.status === 200 && r.json().product_id
  // });
  sleep(1);
}