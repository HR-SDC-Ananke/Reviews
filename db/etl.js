const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const mongodb = require('./index.js');
const sqldb = require('./sql/models.js');

fs.createReadStream(path.join(__dirname, '../../data/characteristics.csv'))
.pipe(parse({ delimiter: ',', from_line: 2 }))
.on('data', (row) => {
  console.log(row);
})