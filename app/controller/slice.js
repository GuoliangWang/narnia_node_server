// app/controller/users.js
const Controller = require('egg').Controller;

function toInt(str) {
  if (typeof str === 'number') return str;
  if (!str) return str;
  return parseInt(str, 10) || 0;
}

class SliceController extends Controller {
  async ref() {
    const { ctx } = this;
    const errors = this.app.validator.validate({slice_ids: {type: 'string'} }, ctx.query)
    if (errors) {
      ctx.body = errors
      ctx.status = 422
      return
    }
    const { slice_ids } = ctx.query
    const last_upload_videos = await ctx.service.lastupload.sliceLastUploadVideos(slice_ids)
    ctx.state.data = { last_upload_videos }
  }
}

module.exports = SliceController;