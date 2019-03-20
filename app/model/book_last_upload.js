'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const model = app.model.define('BookLastUpload', {
      id: { type: INTEGER, primaryKey: true, autoIncrement: true },
      book_id: INTEGER,
      video_id: INTEGER,
      created_at: DATE,
      updated_at: DATE,
  });

  return model;
};