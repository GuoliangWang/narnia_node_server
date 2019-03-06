'use strict';

const path = require('path');

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
};

module.exports.sequelize = {
  enable: true,
  package: 'egg-sequelize'
}
module.exports.wafer = {
  enable: true,
  path: path.join(__dirname, '../plugins/wafer-egg'),
}
module.exports.validate = {
  enable: true,
  package: 'egg-validate',
};
module.exports.redis = {
  enable: true,
  package: 'egg-redis',
};