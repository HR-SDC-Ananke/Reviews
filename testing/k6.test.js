import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  const url = 'http://localhost:5000';
  for (let id = 1; id <= 1000; id++) {
    http.get(`${url}/reviews?product_id=${id}`);
  }
  sleep(1);
  //sleep(1);
}