'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const Chapter = app.model.define('chapter', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      title: STRING,
      cover: STRING,
      created_at: DATE,
      updated_at: DATE,
      book_id: INTEGER
  });

  return Chapter;
};