'use strict';

// app/controller/users.js
const Controller = require('egg').Controller;

// function toInt(str) {
//   if (typeof str === 'number') return str;
//   if (!str) return str;
//   return parseInt(str, 10) || 0;
// }

class ChaptersController extends Controller {
  async ref() {
    const { ctx } = this;
    const errors = this.app.validator.validate({ chapter_ids: { type: 'string' } }, ctx.query);
    if (errors) {
      ctx.body = errors;
      ctx.status = 422;
      return;
    }
    const { chapter_ids } = ctx.query;
    const last_upload_videos = await ctx.service.lastupload.chapterLastUploadVideos(chapter_ids);
    ctx.state.data = { last_upload_videos };
  }
}

module.exports = ChaptersController;
