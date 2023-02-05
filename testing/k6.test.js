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
      executor: 'ramping-arrival-rate',
      timeUnit: '1s',
      preAllocatedVUs: 500,
      stages: [
        { duration: '10s', target: 350 },
        { duration: '30s', target: 350 },
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
  // const lowIDs = [1, 2, 4, 5, 7];
  // const midIDs = [10001, 10002, 10003, 10004, 10005];
  // const bigIDs = [1000000, 1000002, 1000003, 1000004, 1000005];
  // const dispersedIDs = [1, 100, 1000, 10001, 1000000];

  // const id = lowIDs[Math.floor(Math.random() * 5)];
  // const id = midIDs[Math.floor(Math.random() * 5)];
  // const id = bigIDs[Math.floor(Math.random() * 5)];
  // const id = dispersedIDs[Math.floor(Math.random() * 5)];

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