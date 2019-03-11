
const Service = require('egg').Service;
const iconst = require('../const')

class MessageService extends Service {
  // 默认不需要提供构造函数。
  // constructor(ctx) {
  //   super(ctx); 如果需要在构造函数做一些处理，一定要有这句话，才能保证后面 `this.ctx`的使用。
  //   // 就可以直接通过 this.ctx 获取 ctx 了
  //   // 还可以直接通过 this.app 获取 app 了
  // }
  async videoApplyMsgListFor(video, userInfo) {
    const Sequelize = this.app.Sequelize
    const Op = Sequelize.Op
    let msgQuery
    msgQuery = { 
      where: {
        [Op.or]: [
          {
            to_userid: {
              [Op.eq]: userInfo.openId
            }
          },
          {
            from_userid: {
              [Op.eq]: userInfo.openId
            }
          }
        ],
        [Op.and]: {
          ref_id: {
            [Op.eq]: video.id
          }
        },
        [Op.and]: {
          type: {
            [Op.in]: [iconst.msgType.applyWatchVideo, iconst.msgType.applyWatchVideoApproved, iconst.msgType.applyWatchVideoRejected]
          }
        }
      },
      order: [
        ['id', 'ASC']
      ],
      limit: 20
    }
    const msgList = await this.app.model.Message.findAll(msgQuery)
    const openIdList = []
    msgList.forEach(item => {
      if (item.from_userid !== userInfo.openId) {
        openIdList.push(item.from_userid)
      }
      if (item.to_userid !== userInfo.openId) {
        openIdList.push(item.to_userid)
      }
    })
    const users = await this.app.wafer.AuthDbService.getUsersByOpenIdList(openIdList)
    return {msgList, users}
  }
}
module.exports = MessageService;