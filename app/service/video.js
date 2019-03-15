
const Service = require('egg').Service;
const iconst = require('../const')
const OSSClient = require('ali-oss');
const crypto = require('crypto')
const moment = require('moment')

function toInt(str) {
  if (typeof str === 'number') return str;
  if (!str) return str;
  return parseInt(str, 10) || 0;
}

class MessageService extends Service {

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

  


}
module.exports = MessageService;