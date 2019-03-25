// app/controller/users.js
const Controller = require('egg').Controller;
const iconst = require('../const')
const debug = require('debug')('VideoController')
const OSSClient = require('ali-oss');
const crypto = require('crypto')
const moment = require('moment')

function toInt(str) {
  if (typeof str === 'number') return str;
  if (!str) return str;
  return parseInt(str, 10) || 0;
}

class VideoController extends Controller {
  async list() {
    const ctx = this.ctx;
     let userInfo
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        userInfo = ctx.state.$wxInfo.userinfo
    } else {
        ctx.state.code = -1
        return
    }
    ctx.query.slice_id = toInt(ctx.query.slice_id)
    const errors = this.app.validator.validate({slice_id: {type: 'int'} }, ctx.query)
    if (errors) {
      ctx.body = errors
      ctx.status = 422
      return
    }
    const Sequelize = this.app.Sequelize
    const Op = Sequelize.Op
    const slice_id = toInt(ctx.query.slice_id)
    let before_video_id = toInt(ctx.query.before_video_id)
    if (!before_video_id) {
      before_video_id = Number.MAX_SAFE_INTEGER
    }
    const query = { 
      where: {
        [Op.or]: [
          {
            create_userid: {
              [Op.eq]: userInfo.openId
            }
          },
          {
            status: {
              [Op.eq]: iconst.applyStatus.approved
            }
          }
        ],
        id: {
          [Op.lt]: before_video_id
        },
        slice_id: {
          [Op.eq]: slice_id
        },
        is_del: {
          [Op.eq]: 0
        }
      },
      order: [
        ['id', 'DESC']
      ],
      limit: 20
    }
    const list = await ctx.model.Video.findAll(query);
    const queryMinId = { 
      where: {
        slice_id: {
          [Op.eq]: slice_id
        },
        is_del: {
          [Op.eq]: 0
        }
      }
    }
    const min_video_id = await ctx.model.Video.min('id', queryMinId)
    const {respList, users} = await this.setReferenceForVideos(list, userInfo)
    ctx.state.data = { list: respList, min_video_id, users }
  }

  async save() {
    const ctx = this.ctx;
     let userInfo
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        userInfo = ctx.state.$wxInfo.userinfo
    } else {
        ctx.state.code = -1
        return
    }
    const rules = {
      slice_id: {type: 'int'},
      url: {type: 'string'},
      cover: {type: 'string'},
      privacy: {type: 'int'},
      duration: {type: 'number'}
    }
    console.log('ctx.body:', ctx.request.body)
    const errors = this.app.validator.validate(rules, ctx.request.body)
    if (errors) {
      ctx.body = errors
      ctx.status = 422
      return
    }
    const { slice_id, title, url, cover, privacy, width, height, size, duration } = ctx.request.body;
    // created_at updated_at 看看是否有默认值
    const create_userid = userInfo.openId
    const status = iconst.applyStatus.waitingApproval
    const is_del = 0
    const video = await ctx.model.Video.create({ slice_id, title, url, cover, privacy, width, height, size, duration, create_userid, status, is_del });
    const msg = await ctx.service.message.applyShowVideo(video)
    if (!msg) {
      ctx.status = 500;
      ctx.body = 'send apply msg fail';
      return
    }
    ctx.status = 201;
    ctx.body = video;
  }

  async info() {
    const ctx = this.ctx;
    let userInfo
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        userInfo = ctx.state.$wxInfo.userinfo
    } else {
        ctx.state.code = -1
        return
    }
    ctx.query.id = toInt(ctx.query.id)
    const errors = this.app.validator.validate({id: {type: 'int'} }, ctx.query)
    if (errors) {
      ctx.body = errors
      ctx.status = 422
      return
    }
    const videoId = ctx.query.id
    const Sequelize = this.app.Sequelize
    const Op = Sequelize.Op
    const query = { 
      where: {
        id: {
          [Op.eq]: videoId
        }
      }
    }
    const list = await ctx.model.Video.findAll(query);
    if(list.length === 0) {
      ctx.body = 'video not found'
      ctx.status = 404
      return
    }
    const {respList, users} = await this.setReferenceForVideos(list, userInfo)
    if (users.length === 0) {
      ctx.body = 'video creater not found'
      ctx.status = 404
      return
    }
    const videoInfo = respList[0]
    const favoriteQuery = { 
      where: {
        userid: {
          [Op.eq]: userInfo.openId
        },
        type: {
          [Op.eq]: iconst.favoriteType.video
        },
        target_id: {
          [Op.eq]: videoInfo.id
        },
        is_del: {
          [Op.eq]: 0
        },
      }
    }
    const favoriteList = await this.app.model.Favorite.findAll(favoriteQuery)
    const isFavorite = favoriteList.length > 0 ? 1 : 0
    const createUserInfo = JSON.parse(users[0].user_info)
    const {msgList, users: msgUsers} = await ctx.service.message.videoApplyMsgListFor(videoInfo.id, userInfo)
    // const msgList = this.app.model.Message.findAll()

    ctx.state.data = { video_info: videoInfo, user_info: userInfo, create_user_info:createUserInfo, is_favorite:isFavorite, apply_msg_list:msgList, apply_msg_users:msgUsers }
    console.log('ctx.state.data,', ctx.state.data)
  }

  async update() {
    const ctx = this.ctx;
     let userInfo
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        userInfo = ctx.state.$wxInfo.userinfo
    } else {
        ctx.state.code = -1
        return
    }
    const rules = {
      id: {type: 'int'},
    }
    const errors = this.app.validator.validate(rules, ctx.request.body)
    if (errors) {
      ctx.body = errors
      ctx.status = 422
      return
    }
    const Sequelize = this.app.Sequelize
    const Op = Sequelize.Op
    const { id, privacy } = ctx.request.body;
    const video =  await ctx.model.Video.findByPk(id);
    if (!video) {
      ctx.body = `video id:${id} not exist`
      ctx.status = 400
      return
    }
    if (video.create_userid !== userInfo.openId) {
      ctx.body = `you are not creater`
      ctx.status = 400
      return
    }
    const values = {}
    if (privacy) {
      values.privacy = privacy
    }
    const updateResult = await ctx.model.Video.update(
      values, 
      {
        where: {
          id: {
            [Op.eq]: id
          }
      }
    })
    if (updateResult[0] === 0) {
      ctx.body = `did not update anything`
      ctx.status = 400
      return
    }
    ctx.state.data = "operated"
  }

  async delete() {
    const ctx = this.ctx;
     let userInfo
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        userInfo = ctx.state.$wxInfo.userinfo
    } else {
        ctx.state.code = -1
        return
    }
    const rules = {
      id: {type: 'int'},
    }
    const errors = this.app.validator.validate(rules, ctx.request.body)
    if (errors) {
      ctx.body = errors
      ctx.status = 422
      return
    }
    const Sequelize = this.app.Sequelize
    const Op = Sequelize.Op
    const { id } = ctx.request.body;
    const video =  await ctx.model.Video.findByPk(id);
    if (!video) {
      ctx.body = `video id:${id} not exist`
      ctx.status = 400
      return
    }
    if (video.create_userid !== userInfo.openId) {
      ctx.body = `you are not creater`
      ctx.status = 400
      return
    }
    const values = { is_del: 1 }
    const updateResult = await ctx.model.Video.update(
      values, 
      {
        where: {
          id: {
            [Op.eq]: id
          }
      }
    })
    if (updateResult[0] === 0) {
      ctx.body = `did not update anything`
      ctx.status = 400
      return
    }
    ctx.state.data = "operated"
  }
  async approveShow() {
    const ctx = this.ctx;
     let userInfo
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        userInfo = ctx.state.$wxInfo.userinfo
    } else {
        ctx.state.code = -1
        return
    }
    const isAdmin = await ctx.service.user.isAdmin()
    if (!isAdmin) {
      ctx.body = 'you are not admin'
      ctx.status = 400
      return
    }
    const rules = {
      message_id: {type: 'int'},
      approved: {type: 'int'},
    }
    console.log('ctx.body:', ctx.request.body)
    const errors = this.app.validator.validate(rules, ctx.request.body)
    if (errors) {
      ctx.body = errors
      ctx.status = 422
      return
    }
    const Op = this.app.Sequelize.Op
    const { message_id, approved } = ctx.request.body;
    const msg = await this.app.model.Message.findOne({
      where: {
        id: {
          [Op.eq]: message_id
        }
      }
    })
    if (!msg) {
      ctx.status = 400;
      ctx.body = `msg id [${message_id}] not exist`
      return
    }
    const video = await ctx.model.Video.findOne({
      where: {
        id: {
          [Op.eq]: msg.ref_id
        }
      }
    });
    if (!video) {
      ctx.status = 400;
      ctx.body = `video id [${msg.ref_id}] not exist`
      return
    }
    let status
    if (approved) {
      if (video.status === iconst.applyStatus.approved) {
        ctx.status = 400;
        ctx.body = `video id [${msg.ref_id}] have been approved `
        return
      } 
      status = iconst.applyStatus.approved
    } else {
      if (video.status === iconst.applyStatus.rejected) {
        ctx.status = 400;
        ctx.body = `video id [${msg.ref_id}] have been rejected `
        return
      } 
      status = iconst.applyStatus.rejected
    }
    console.log('change status:', status)
    const updateResult = await ctx.model.Video.update(
      { status }, 
      { 
        where: {
          id: {
            [Op.eq]: video.id
          }
        } 
      }
    )
    const updateCount = updateResult[0]
    if (updateCount != 1) {
      ctx.status = 500
      ctx.body = `Video.update number: ${updateCount}`
      return
    }
    const sendMsgResult = await ctx.service.message.approveShowVideo(msg, video, approved)
    if(!sendMsgResult.success) {
      ctx.status = 500
      ctx.body = sendMsgResult.message
      return
    }
    if (approved) {
      await ctx.service.lastupload.updateLastUploadVideo(video)
    }
    ctx.state.data = 'operated'
  }

  async adminDelete() {
    const ctx = this.ctx;
     let userInfo
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        userInfo = ctx.state.$wxInfo.userinfo
    } else {
        ctx.state.code = -1
        return
    }
    const isAdmin = await ctx.service.user.isAdmin()
    if (!isAdmin) {
      ctx.body = 'you are not admin'
      ctx.status = 400
      return
    }
    const rules = {
      message_id: {type: 'int'}
    }
    console.log('ctx.body:', ctx.request.body)
    const errors = this.app.validator.validate(rules, ctx.request.body)
    if (errors) {
      ctx.body = errors
      ctx.status = 422
      return
    }
    const Op = this.app.Sequelize.Op
    const { message_id } = ctx.request.body;
    const msg = await this.app.model.Message.findOne({
      where: {
        id: {
          [Op.eq]: message_id
        }
      }
    })
    if (!msg) {
      ctx.status = 400;
      ctx.body = `msg id [${message_id}] not exist`
      return
    }
    const video = await ctx.model.Video.findOne({
      where: {
        id: {
          [Op.eq]: msg.ref_id
        }
      }
    });
    if (!video) {
      ctx.status = 400;
      ctx.body = `video id [${msg.ref_id}] not exist`
      return
    }
    const updateResult = await ctx.model.Video.update(
      { is_del: 1 }, 
      { 
        where: {
          id: {
            [Op.eq]: video.id
          }
        } 
      }
    )
    const updateCount = updateResult[0]
    if (updateCount != 1) {
      ctx.status = 500
      ctx.body = `Video.update number: ${updateCount}`
      return
    }
    const sendMsgResult = await ctx.service.message.adminDeleteShowVideo(msg, video)
    if(!sendMsgResult.success) {
      ctx.status = 500
      ctx.body = sendMsgResult.message
      return
    }
    ctx.state.data = 'operated'
  }  

  async setReferenceForVideos(list, userInfo) {
    const ctx = this.ctx
    let openIdList = []
    const conf = this.app.config.aliOss
    // await promiseForReadVideoSts(item)
    const respList = []
    for(let i = 0; i < list.length; i++) {
      const item = list[i]
      openIdList.push(item.create_userid)
      let authorized = false
      let auth = 0
      if (item.create_userid === userInfo.openId) { // 作者本人有权
        authorized = true
      } else if (item.status !== iconst.applyStatus.approved) { // 未审核通过的,其他人无权观看
        authorized = false
      } else if (item.privacy === iconst.privacy.public) { // 审核通过的公开资源都有权观看
        authorized = true
      } else { // 作者允许观看的，才可观看
        const authrity = await ctx.model.VideoAuthrity.findOne({ where: {video_id: item.id, user_id: userInfo.openId} })
        if (authrity && authrity.auth === iconst.auth.read) {
          authorized = true
          auth = authrity.auth
        }
      }
      authorized = authorized ? 1 : 0
      if (authorized) {
        const urlKey = iconst.redisKey.stsVideoUrlPre + item.id
        const coverKey = iconst.redisKey.stsVideoCoverPre + item.id
        let redisUrl = await this.app.redis.get(urlKey)
        let redisCover = await this.app.redis.get(coverKey)
        if (!redisUrl) {
          let stsRes = await ctx.service.video.promiseForReadVideoSts(item)
          // let stsRes = await this.promiseForReadVideoSts(item)
          if (stsRes) {
            redisUrl = stsRes.videoUrl
            redisCover = stsRes.coverUrl
            await this.app.redis.set(urlKey, redisUrl)
            await this.app.redis.expire(urlKey, conf.TokenExpireTime / 2)
            await this.app.redis.set(coverKey, redisCover)
            await this.app.redis.expire(coverKey, conf.TokenExpireTime / 2)
          }
        }
        if (redisUrl) {
          item.url = redisUrl
        } 
        if (redisCover){
          item.cover = redisCover
        }
      }
      respList.push(Object.assign({authorized, auth}, item.toJSON()))
    }
    const openIdSet = new Set(openIdList)
    openIdList = Array.from(openIdSet)
    const users = await this.app.wafer.AuthDbService.getUsersByOpenIdList(openIdList)
    console.log('users length:', users.length)
    return { respList: respList, users }    
  }

  async uploadedList() {
    const ctx = this.ctx;
     let userInfo
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        userInfo = ctx.state.$wxInfo.userinfo
    } else {
        ctx.state.code = -1
        return
    }
    const Sequelize = this.app.Sequelize
    const Op = Sequelize.Op
    let before_video_id = toInt(ctx.query.before_video_id)
    if (!before_video_id) {
      before_video_id = Number.MAX_SAFE_INTEGER
    }
    const query = { 
      where: {
        create_userid: {
          [Op.eq]: userInfo.openId
        },
        id: {
          [Op.lt]: before_video_id
        },
        is_del: {
          [Op.eq]: 0
        }
      },
      order: [
        ['id', 'DESC']
      ],
      limit: 20
    }
    const list = await ctx.model.Video.findAll(query);
    const queryMinId = { 
      where: {
        create_userid: {
          [Op.eq]: userInfo.openId
        },
        is_del: {
          [Op.eq]: 0
        }
      }
    }
    const min_video_id = await ctx.model.Video.min('id', queryMinId)
    const {respList, users} = await this.setReferenceForVideos(list, userInfo)
    ctx.state.data = { list: respList, min_video_id, users }
  }

}

module.exports = VideoController;