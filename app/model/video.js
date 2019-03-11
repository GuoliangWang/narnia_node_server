'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE, FLOAT } = app.Sequelize;

  const User = app.model.define('video', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      cover: STRING,
      url: STRING,
      create_userid: STRING,
      created_at: DATE,
      updated_at: DATE,
      is_del: INTEGER,
      privacy: INTEGER,
      status: INTEGER,
      slice_id: INTEGER,
      width: INTEGER,
      height: INTEGER,
      size: INTEGER,
      duration: FLOAT,
      title: STRING
  });

  return User;
};