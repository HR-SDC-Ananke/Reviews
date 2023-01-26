const etl = require('./etl.js');

let charReviewsFile;
if (process.argv.length === 3) {
  charReviewsFile = process.argv[2];
}

const loadCharReviews = async () => {
  console.time('loadCharReviews');
  await etl.loadCharReviews(charReviewsFile);
  console.timeEnd('loadCharReviews');
}

loadCharReviews();