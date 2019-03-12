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
    const errors = this.app.validator.validate({slice_id: 'id'}, ctx.query)
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
        id: {
          [Op.lt]: before_video_id
        },
        slice_id: {
          [Op.eq]: slice_id
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
        }
      }
    }
    const min_video_id = await ctx.model.Video.min('id', queryMinId)
    let openIdList = []
    const conf = this.app.config.aliOss
    // await promiseForReadVideoSts(item)
     
    const {respList, users} = await this.setReferenceForVideos(list, userInfo)
    // const respList = []
    // for(let i = 0; i < list.length; i++) {
    //   const item = list[i]
    //   openIdList.push(item.create_userid)
    //   let authorized = false
    //   if (item.create_userid === userInfo.openId) { // 作者本人有权
    //     authorized = true
    //   } else if (item.status !== iconst.applyStatus.approved) { // 未审核通过的,其他人无权观看
    //     authorized = false
    //   } else if (item.privacy === iconst.privacy.public) { // 审核通过的公开资源都有权观看
    //     authorized = false
    //   } else { // 作者允许观看的，才可观看
    //     const authrity = await ctx.model.VideoAuthrity.findOne({ where: {video_id: item.id} })
    //     if (authrity && authrity.auth === iconst.auth.read) {
    //       authorized = true
    //     }
    //   }
    //   item.authorized = authorized ? 1 : 0
    //   if (authorized) {
    //     const urlKey = 'sts:video:url:'+item.id
    //     const coverKey = 'sts:video:cover:'+item.id
    //     let redisUrl = await this.app.redis.get(urlKey)
    //     let redisCover = await this.app.redis.get(coverKey)
    //     if (!redisUrl) {
    //       let stsRes = await this.promiseForReadVideoSts(item)
    //       if (stsRes) {
    //         redisUrl = stsRes.videoUrl
    //         redisCover = stsRes.coverUrl
    //         await this.app.redis.set(urlKey, redisUrl)
    //         await this.app.redis.expire(urlKey, conf.TokenExpireTime / 2)
    //         await this.app.redis.set(coverKey, redisCover)
    //         await this.app.redis.expire(coverKey, conf.TokenExpireTime / 2)
    //       }
    //     }
    //     if (redisUrl) {
    //       item.url = redisUrl
    //     } 
    //     if (redisCover){
    //       item.cover = redisCover
    //     }
    //   }
    //   respList.push(Object.assign({authorized}, item.toJSON()))
    // }
    // const openIdSet = new Set(openIdList)
    // openIdList = Array.from(openIdSet)
    // const users = await this.app.wafer.AuthDbService.getUsersByOpenIdList(openIdList)
    // console.log('respList', respList)
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
      slice_id: 'id',
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
    const contentObj = {}
    await ctx.model.Message.create({ from_userid: create_userid, to_userid: 1, type: iconst.msgType.applyShowVideo, is_del: 0, content: JSON.stringify(contentObj), ref_id: video.id, status: iconst.msgStatus.waitingOpt })
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
    const errors = this.app.validator.validate({id: 'id'}, ctx.query)
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
    const favoriteList = this.app.model.Favorite.findAll(favoriteQuery)
    const isFavorite = favoriteList.length > 0 ? 1 : 0
    const createUserInfo = JSON.parse(users[0].user_info)
    const {msgList, users: msgUsers} = await ctx.service.message.videoApplyMsgListFor(videoInfo, userInfo)
    // const msgList = this.app.model.Message.findAll()

    ctx.state.data = { video_info: videoInfo, user_info: userInfo, create_user_info:createUserInfo, is_favorite:isFavorite, apply_msg_list:msgList, apply_msg_users:msgUsers }
    console.log('ctx.state.data,', ctx.state.data)
  }

  async update() {

  }

  async delete() {

  }

  promiseForReadVideoSts(video) {  
    return new Promise((resolve) => {
      const openId = video.create_userid
      const host = 'https://www.narniaclub.com'
      const videoPath = video.url.substring(host.length + 1)
      const coverPath = video.cover.substring(host.length + 1)
      console.log('coverPath:', coverPath)
      const conf = this.app.config.aliOss
      // let policy = JSON.stringify(conf.bucketReadPolicy)
      let policy = JSON.stringify(conf.AllPolicy)
      // if (conf.PolicyFile) {
      //   policy = fs.readFileSync(path.resolve(__dirname, conf.PolicyFile)).toString('utf-8');
      // }
      const client = new OSSClient.STS({
        accessKeyId: conf.AccessKeyId,
        accessKeySecret: conf.AccessKeySecret
      });
      client.assumeRole(conf.RoleArn, policy, conf.TokenExpireTime).then((result) => {
        const oss = new OSSClient({
          region: 'oss-cn-beijing',
          accessKeyId: result.credentials.AccessKeyId,
          accessKeySecret: result.credentials.AccessKeySecret,
          stsToken: result.credentials.SecurityToken,
          bucket: 'narnia-app'
        })
        const videoUrl = oss.signatureUrl(videoPath, {expires: conf.TokenExpireTime})
        const coverUrl = oss.signatureUrl(coverPath, {expires: conf.TokenExpireTime})
        const res = {
          videoUrl,
          coverUrl
        }
        resolve(res)
      }).catch((err) => {
        console.log('err:', err)
        debug('Catch Error: %o', err)
        resolve(null)
      });
    })
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
        const authrity = await ctx.model.VideoAuthrity.findOne({ where: {video_id: item.id} })
        if (authrity && authrity.auth === iconst.auth.read) {
          authorized = true
          auth = authrity.auth
        }
      }
      authorized = authorized ? 1 : 0
      if (authorized) {
        const urlKey = 'sts:video:url:'+item.id
        const coverKey = 'sts:video:cover:'+item.id
        let redisUrl = await this.app.redis.get(urlKey)
        let redisCover = await this.app.redis.get(coverKey)
        if (!redisUrl) {
          let stsRes = await this.promiseForReadVideoSts(item)
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


}

module.exports = VideoController;