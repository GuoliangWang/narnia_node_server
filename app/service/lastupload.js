'use strict';

const Service = require('egg').Service;
const iconst = require('../const');
// const OSSClient = require('ali-oss');
// const crypto = require('crypto');
const moment = require('moment');

function toInt(str) {
  if (typeof str === 'number') return str;
  if (!str) return str;
  return parseInt(str, 10) || 0;
}

class LastuploadService extends Service {

  async updateLastUploadVideo(video) {
    const { ctx } = this;
    const Sequelize = this.app.Sequelize;
    const Op = Sequelize.Op;
    const sliceQuery = {
      where: {
        id: {
          [Op.eq]: video.slice_id,
        },
      },
    };
    const slice = await ctx.model.Slice.findOne(sliceQuery);
    const chapterQuery = {
      where: {
        id: {
          [Op.eq]: slice.chapter_id,
        },
      },
    };
    const chapter = await ctx.model.Chapter.findOne(chapterQuery);
    const bookQuery = {
      where: {
        id: {
          [Op.eq]: chapter.book_id,
        },
      },
    };
    const book = await ctx.model.Book.findOne(bookQuery);
    const videoStr = JSON.stringify(video);
    const bookLastuploadKey = iconst.redisKey.bookLastuploadPre + book.id;
    const chapterLastuploadKey = iconst.redisKey.chapterLastuploadPre + chapter.id;
    const sliceLastuploadKey = iconst.redisKey.sliceLastuploadPre + slice.id;
    const latestVideoStr = await this.app.redis.get(bookLastuploadKey);
    if (latestVideoStr) {
      const latestVideo = JSON.parse(latestVideoStr);
      if (latestVideo.id > video.id) { // 只保存最近上传的
        return;
      }
    }
    await this.app.redis.set(bookLastuploadKey, videoStr);
    await this.app.redis.set(chapterLastuploadKey, videoStr);
    await this.app.redis.set(sliceLastuploadKey, videoStr);
    let bookLastUpload = ctx.model.BookLastUpload.findOne({
      where: {
        book_id: {
          [Op.eq]: book.id,
        },
      },
    });
    if (!bookLastUpload) {
      bookLastUpload = { book_id: book.id };
    }
    bookLastUpload.video_id = video.id;
    bookLastUpload.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    ctx.model.BookLastUpload.upsert(bookLastUpload);
    let chapterLastUpload = ctx.model.ChapterLastUpload.findOne({
      where: {
        chapter_id: {
          [Op.eq]: chapter.id,
        },
      },
    });
    if (!chapterLastUpload) {
      chapterLastUpload = { chapter_id: chapter.id };
    }
    chapterLastUpload.video_id = video.id;
    chapterLastUpload.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    ctx.model.ChapterLastUpload.upsert(chapterLastUpload);
    let sliceLastUpload = ctx.model.SliceLastUpload.findOne({
      where: {
        slice_id: {
          [Op.eq]: slice.id,
        },
      },
    });
    if (!sliceLastUpload) {
      sliceLastUpload = { slice_id: slice.id };
    }
    sliceLastUpload.video_id = video.id;
    sliceLastUpload.updated_at = moment().format('YYYY-MM-DD HH:mm:ss');
    ctx.model.SliceLastUpload.upsert(sliceLastUpload);
  }

  async bookLastUploadVideos(bookIds) {
    const { ctx } = this;
    const Sequelize = this.app.Sequelize;
    const Op = Sequelize.Op;
    const videos = [];
    const bookIdArray = bookIds.split(',');
    for (let i = 0; i < bookIdArray.length; i++) {
      const id = toInt(bookIdArray[i]);
      const key = iconst.redisKey.bookLastuploadPre + id;
      const videoStr = await this.app.redis.get(key);
      if (videoStr) {
        const video = JSON.parse(videoStr);
        video.book_id = id;
        console.log('redis video:', video);
        videos.push(video);
      } else {
        const bookLastUpload = await ctx.model.BookLastUpload.findOne({
          where: {
            book_id: {
              [Op.eq]: id,
            },
          },
        });
        if (bookLastUpload) {
          const video = await ctx.model.Video.findOne({
            where: {
              id: {
                [Op.eq]: bookLastUpload.video_id,
              },
            },
          });
          const videoJSON = video.toJSON();
          await this.app.redis.set(key, JSON.stringify(videoJSON));
          videoJSON.book_id = id;
          console.log('mysql videoJSON:', videoJSON);
          videos.push(videoJSON);
        }
      }
    }
    // console.log('videos', videos)
    return videos;
  }

  async chapterLastUploadVideos(chapterIds) {
    const { ctx } = this;
    const Sequelize = this.app.Sequelize;
    const Op = Sequelize.Op;
    const videos = [];
    const chapterIdArray = chapterIds.split(',');
    for (let i = 0; i < chapterIdArray.length; i++) {
      const id = toInt(chapterIdArray[i]);
      const key = iconst.redisKey.chapterLastuploadPre + id;
      const videoStr = await this.app.redis.get(key);
      if (videoStr) {
        const video = JSON.parse(videoStr);
        video.chapter_id = id;
        console.log('redis video:', video);
        videos.push(video);
      } else {
        const chapterLastUpload = await ctx.model.ChapterLastUpload.findOne({
          where: {
            chapter_id: {
              [Op.eq]: id,
            },
          },
        });
        if (chapterLastUpload) {
          const video = await ctx.model.Video.findOne({
            where: {
              id: {
                [Op.eq]: chapterLastUpload.video_id,
              },
            },
          });
          const videoJSON = video.toJSON();
          await this.app.redis.set(key, JSON.stringify(videoJSON));
          videoJSON.chapter_id = id;
          console.log('mysql videoJSON:', videoJSON);
          videos.push(videoJSON);
        }
      }
    }
    // console.log('videos', videos)
    return videos;
  }

  async sliceLastUploadVideos(sliceIds) {
    const { ctx } = this;
    const Sequelize = this.app.Sequelize;
    const Op = Sequelize.Op;
    const videos = [];
    const sliceIdArray = sliceIds.split(',');
    for (let i = 0; i < sliceIdArray.length; i++) {
      const id = toInt(sliceIdArray[i]);
      const key = iconst.redisKey.sliceLastuploadPre + id;
      const videoStr = await this.app.redis.get(key);
      if (videoStr) {
        const video = JSON.parse(videoStr);
        video.slice_id = id;
        console.log('redis video:', video);
        videos.push(video);
      } else {
        const sliceLastUpload = await ctx.model.SliceLastUpload.findOne({
          where: {
            slice_id: {
              [Op.eq]: id,
            },
          },
        });
        if (sliceLastUpload) {
          const video = await ctx.model.Video.findOne({
            where: {
              id: {
                [Op.eq]: sliceLastUpload.video_id,
              },
            },
          });
          const videoJSON = video.toJSON();
          await this.app.redis.set(key, JSON.stringify(videoJSON));
          videoJSON.slice_id = id;
          console.log('mysql videoJSON:', videoJSON);
          videos.push(videoJSON);
        }
      }
    }
    // console.log('videos', videos)
    return videos;
  }


}

module.exports = LastuploadService;
