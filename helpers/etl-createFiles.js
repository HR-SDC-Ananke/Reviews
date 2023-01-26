const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');

const createFile = (srcFile, outFile, rowCount) => {
  return new Promise((resolve, reject) => {
    let count = 0;
    let data = [];
    let columns;
    let stringifier;

    const readable = fs.createReadStream(srcFile).pipe(parse({ delimiter: ",", to_line: rowCount }));
    console.log('reading source file...');

    readable.on('data', async (row) => {
      // console.log(row);
      if (count === 0) {
        columns = row;
        stringifier = stringify({ header: true, columns });
      } else {
        data.push(row);
      }
      count++;
    });

    readable.on('end', () => {
      console.log('finished reading source file');

      const writeable = fs.createWriteStream(outFile);
      console.log('writing to output file...');

      data.forEach(row => stringifier.write(row));
      stringifier.pipe(writeable);
      console.log('finished writing data');
    });

    readable.on('error', err => reject(err));
  });
};

// create file
if (process.argv.length === 5) {
  console.log(process.argv);
  createFile(process.argv[2], process.argv[3], process.argv[4]);
}