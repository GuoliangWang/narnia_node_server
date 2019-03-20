'use strict';

/**
 * @param {Egg.Application} app - egg application
 */


module.exports = app => {
  const waferInst = app.wafer
  const { router, controller } = app;
  const basePath = '/app'
  const get = (path, func) => {
    router.get(basePath + path, func);  
  }
  const post = (path, func) => {
    router.post(basePath + path, func);  
  }
  const resources = (name, path, func) => {
    router.resources(name, basePath + path, func);  
  }
  // 登录接口 /app/login
  router.get(basePath + '/login', waferInst.auth.authorizationMiddleware, controller.login.login)
  // 用户信息接口（可以用来验证登录态） /app/user
  router.get(basePath + '/user/info', waferInst.auth.validationMiddleware, controller.users.info)
  router.get(basePath + '/oss/sts', waferInst.auth.validationMiddleware, controller.oss.sts)
  router.get(basePath+ '/video/list', waferInst.auth.validationMiddleware, controller.video.list)
  router.post(basePath+ '/video/save', waferInst.auth.validationMiddleware, controller.video.save)
  router.get(basePath+ '/video/info', waferInst.auth.validationMiddleware, controller.video.info)
  router.get(basePath+ '/message/apply_show_video_msg_list', waferInst.auth.validationMiddleware, controller.message.applyShowVideoMsgList)
  router.get(basePath+ '/message/apply_watch_video_msg_list', waferInst.auth.validationMiddleware, controller.message.applyWathVideoMsgList)
  router.post(basePath+ '/auth/apply_watch', waferInst.auth.validationMiddleware, controller.auth.applyWatch)
  router.post(basePath+ '/auth/approve_watch', waferInst.auth.validationMiddleware, controller.auth.approveWatch)
  router.post(basePath+ '/admin/video/approve_show', waferInst.auth.validationMiddleware, controller.video.approveShow)
  router.post(basePath+ '/admin/video/delete', waferInst.auth.validationMiddleware, controller.video.adminDelete)


  get('/', controller.home.index)
  // resources('users', '/users/index', controller.users)
  get('/book/list', controller.books.list);
  get('/slice/list', controller.slice.list);
  // get('/slice/info', controller.slice.info);
  get('/slice/info', controller.slice.info)
};
