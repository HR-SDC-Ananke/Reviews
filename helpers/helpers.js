
// takes a sorting descriptor 'helpful', 'newest' or 'relevant' and sorts reviews accordingly
const sortBy = (a, b, descriptor) => {
  if (descriptor === 'newest') return new Date(a.date).getTime() - new Date(b.date).getTime();
  if (descriptor === 'helpful') return b.helpfulness - a.helpfulness;
  return 0;
}

// takes a reviews array and returns a ratings object
const getRatings = (reviewsArr) => {
  return reviewsArr.reduce((ratingsObj, review) => {
    !ratingsObj[review.rating] ? ratingsObj[review.rating] = 1 : ratingsObj[review.rating] += 1;
    return ratingsObj;
  }, {});
};

// takes a reviews array and returns a recommended object
const getRecommended = (reviewsArr) => {
  return reviewsArr.reduce((recObj, review) => {
    review.recommended ? recObj[1] += 1 : recObj[0] += 1;
    return recObj;
  }, { 0: 0, 1: 0 });
}

const getCharacteristics = (reviewsArr) => {
  let counts = {};

  return reviewsArr.reduce((recObj, review) => {
    review.characteristics.forEach(char => {
      if (!counts.hasOwnProperty(char.name)) {
        counts[char.name] = { count: 1, sum: char.value };
      } else {
        counts[char.name].count += 1;
        counts[char.name].sum = counts[char.name].sum + char.value;
      }
      const average = counts[char.name].sum / counts[char.name].count;
      recObj[char.name] = { "id": char.id, "value": average.toFixed(4) };
    });
    return recObj;
  }, {});
}

module.exports = { sortBy, getRatings, getRecommended, getCharacteristics };