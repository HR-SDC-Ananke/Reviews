const etl = require('./etl');

let photosFile;
if (process.argv.length === 3) {
  photosFile = process.argv[2];
}

const loadPhotos = async () => {
  console.time('loadPhotos');
  await etl.loadPhotos(photosFile);
  console.timeEnd('loadPhotos');
}

loadPhotos();