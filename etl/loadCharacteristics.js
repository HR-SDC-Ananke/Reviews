const etl = require('./etl.js');

let characteristicsFile;
if (process.argv.length === 3) {
  characteristicsFile = process.argv[2];
}

const loadCharacteristics = async () => {
  console.time('loadCharacteristics');
  await etl.loadCharacteristics(characteristicsFile);
  console.timeEnd('loadCharacteristics');
}

loadCharacteristics();