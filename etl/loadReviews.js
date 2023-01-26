const etl = require('./etl');

let reviewsFile;
if (process.argv.length === 3) {
  reviewsFile = process.argv[2];
}

const loadReviews = async () => {
  console.time('loadReviews');
  await etl.loadReviews(reviewsFile);
  console.timeEnd('loadReviews');
}

loadReviews();