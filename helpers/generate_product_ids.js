const mongodb = require('../db/index.js');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const generateProductIds = async () => {
  mongoose.connect('mongodb://localhost:27017/sdc-reviews');

  const productIds = [];
  for (let i = 0; i < 10000; i++) {
    const product_id = Math.floor(Math.random() * 1000000);
    console.log(`productId: ${product_id}`);
    const reviewCount = await mongodb.Review.find({ product_id }).count();
    if (reviewCount && !productIds.includes(product_id)) productIds.push(product_id);
  }
  fs.writeFile(path.join(__dirname, '../exampleData/productIds.js'), JSON.stringify(productIds), err => {
    if (err) {
      return console.error(err);
    }

    console.log('productIds written to file');
    mongoose.connection.close();
  });
};

generateProductIds();