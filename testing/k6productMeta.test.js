import http from 'k6/http';
import { sleep, check } from 'k6';
const productIds = require('../exampleData/productIds.js');

const target = 1; // requests per second

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
  const productMeta = http.get(`${url}/reviews/meta?product_id=${id}`);
  check(productMeta, {
    'Get status is 200': r => r.status === 200,
    'Get valid product_id': r => r.status === 200 && r.json().product_id
  });
  sleep(1);
}