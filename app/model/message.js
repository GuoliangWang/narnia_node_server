'use strict';

module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const User = app.model.define('message', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    from_userid: STRING,
    to_userid: STRING,
    type: INTEGER, // 【1:上传视频】【2:视频审核通过】【3:视频审核未通过】【4:视频违规被删除】【5:申请观看】【6:同意观看】 【7:拒绝观看】
    content: { type: STRING(4096) }, // 根据不同的的消息type, 存放制定json格式数据
    created_at: DATE,
    updated_at: DATE,
    is_del: INTEGER,
    ref_id: INTEGER,
    status: INTEGER,
  });

  return User;
};
