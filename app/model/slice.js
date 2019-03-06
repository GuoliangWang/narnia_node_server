'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const Slice = app.model.define('slice', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      title: STRING,
      cover: STRING,
      created_at: DATE,
      updated_at: DATE,
      text: STRING,
      chapter_id: INTEGER
  });

  return Slice;
};