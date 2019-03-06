/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};
  // add your user config here
  const userConfig = {
    myAppName: 'naniar_node_server',
    sequelize: {
      username: 'root',
      password: "Wolf7758521",
      dialect: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      database: 'narnia_app',
    }
  };

  userConfig.weixin = {
    mysql: {
        host: userConfig.sequelize.host,
        port: userConfig.sequelize.port,
        user: userConfig.sequelize.username,
        db: "narnia_auth",
        pass: userConfig.sequelize.password,
        char: 'utf8mb4'
    }
  }
  return {
    ...config,
    ...userConfig,
  };
};

