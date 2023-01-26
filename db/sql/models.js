const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  'sdc_reviews',
  'root',
  '',
  {
    host: 'localhost',
    dialect: 'mysql'
  }
);

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  rating: { type: DataTypes.INTEGER },
  summary: { type: DataTypes.STRING }, // VARCHAR(255)
  recommended: { type: DataTypes.BOOLEAN },
  response: { type: DataTypes.TEXT },
  reported: { type: DataTypes.BOOLEAN },
  body: { type: DataTypes.TEXT },
  date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  reviewer_name: { type: DataTypes.STRING },
  reviewer_email: { type: DataTypes.STRING },
  helpfulness: { type: DataTypes.INTEGER },
  product_id: { type: DataTypes.INTEGER }
});

const Photo = sequelize.define('Photo', {
  url: { type: DataTypes.STRING },
  review_id: {
    type: DataTypes.INTEGER,
    references: { model: Review, key: 'id' }
  }
});

const Recommended = sequelize.define('Recommended', {
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  true: { type: DataTypes.INTEGER },
  false: { type: DataTypes.INTEGER }
});

const Rating = sequelize.define('Rating', {
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  0: { type: DataTypes.INTEGER },
  1: { type: DataTypes.INTEGER },
  2: { type: DataTypes.INTEGER },
  3: { type: DataTypes.INTEGER },
  4: { type: DataTypes.INTEGER },
  5: { type: DataTypes.INTEGER },
});

const CharacteristicRating = sequelize.define('CharacteristicRating', {
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING },
  value: { type: DataTypes.FLOAT }
});

module.exports = sequelize;