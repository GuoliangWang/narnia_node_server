'use strict';

const Controller = require('egg').Controller;
const iconst = require('../const')

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }

  async ref() {
  	const { ctx } = this;
    const errors = this.app.validator.validate({book_ids: {type: 'string', allowEmpty: false} }, ctx.query)
    if (errors) {
      ctx.body = errors
      ctx.status = 422
      return
    }
    const { book_ids } = ctx.query
  	const Op = this.app.Sequelize.Op
  	const query = { 
      where: {
        status: {
          [Op.eq]: iconst.popularVideoStatus.on
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
  	const popularVideos = await ctx.model.PopularVideo.findAll(query)
  	const videoIdList = []
  	popularVideos.forEach(item => {
  		videoIdList.push(item.video_id)
  	})
	  const videoQuery = {
      where: {
        id: {
          [Op.in]: videoIdList
        }
      }
    }
    let videos = await ctx.model.Video.findAll(videoQuery)
    videos = await this.preparedVideosFor(videos)
    const last_upload_videos = await ctx.service.lastupload.bookLastUploadVideos(book_ids)
  	ctx.state.data = {videos, last_upload_videos }
  }

  async preparedVideosFor(list) {
    const ctx = this.ctx
    const conf = this.app.config.aliOss
    // await promiseForReadVideoSts(item)
    const respList = []
    for(let i = 0; i < list.length; i++) {
      const item = list[i]
      let authorized = false
      if (item.status !== iconst.applyStatus.approved) { // 未审核通过的,其他人无权观看
        authorized = false
      } else if (item.privacy === iconst.privacy.public) { // 审核通过的公开资源都有权观看
        authorized = true
      }
      authorized = authorized ? 1 : 0
      if (authorized) {
        const urlKey = iconst.redisKey.stsVideoUrlPre + item.id
        const coverKey = iconst.redisKey.stsVideoCoverPre + item.id
        let redisUrl = await this.app.redis.get(urlKey)
        let redisCover = await this.app.redis.get(coverKey)
        if (!redisUrl) {
          let stsRes = await ctx.service.video.promiseForReadVideoSts(item)
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
      respList.push(Object.assign({authorized}, item.toJSON()))
    }
    return respList
  }

}

module.exports = HomeController;
