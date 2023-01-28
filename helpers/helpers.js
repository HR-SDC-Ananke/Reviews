
// takes a sorting descriptor 'helpful', 'newest' or 'relevant' and sorts reviews accordingly
const sortBy = (a, b, descriptor) => {
  if (descriptor === 'newest') return a.date.getTime() - b.date.getTime();
  if (descriptor === 'helpful') return a.helpfulness - b.helpfulness;
  return 0;
}

// takes a reviews array and returns a ratings object
const getRatings = (reviewsArr) => {
  return reviewsArr.reduce((ratingsObj, review) => {
    !ratingsObj[review.rating] ? ratingsObj[review.rating] = 1 : ratingsObj[review.rating] += 1;
    return ratingsObj;
  }, {});
};

module.exports = { sortBy, getRatings };