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
  async bookLastUplad() {
    const ctx = this.ctx;
     let userInfo
    if (ctx.state.$wxInfo.loginState === 1) {
        // loginState 为 1，登录态校验成功
        userInfo = ctx.state.$wxInfo.userinfo
    } else {
        ctx.state.code = -1
        return
    }
    const bookIds = ctx.query.book_ids
    if (bookIds.length > 0) {
      //todo
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
    let openIdList = []
    const conf = this.app.config.aliOss
    // await promiseForReadVideoSts(item)
     
    const {respList, users} = await this.setReferenceForVideos(list, userInfo)
    ctx.state.data = { list: respList, min_video_id, users }
  }
}

module.exports = VideoController;