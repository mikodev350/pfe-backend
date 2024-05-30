"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::lesson.lesson", ({ strapi }) => ({
  async find(ctx) {
    try {
      const { _page = 1, _limit = 5, _q = "", moduleId } = ctx.query;

      const start = (_page - 1) * _limit;

      const [lessons, total] = await strapi.db
        .query("api::lesson.lesson")
        .findWithCount({
          where: {
            nom: { $contains: _q },
            module: moduleId,
          },
          start,
          limit: _limit,
          sort: { createdAt: "DESC" },
        });

      ctx.send({
        data: lessons,
        meta: {
          pagination: {
            page: _page,
            pageSize: _limit,
            pageCount: Math.ceil(total / _limit),
            total,
          },
        },
      });
    } catch (error) {
      ctx.throw(500, "Error fetching lessons");
    }
  },

  async create(ctx) {
    try {
      const { data } = ctx.request.body;

      const createdLesson = await strapi.entityService.create(
        "api::lesson.lesson",
        {
          data: {
            nom: data.nom,
            module: data.moduleId,
            publishedAt: new Date(), // Automatically publish the lesson
          },
        }
      );

      ctx.send({
        message: "Lesson created successfully",
        data: createdLesson,
      });
    } catch (error) {
      ctx.throw(500, "Error creating lesson");
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      const updatedLesson = await strapi.entityService.update(
        "api::lesson.lesson",
        id,
        {
          data: {
            nom: data.nom,
            publishedAt: new Date(), // Automatically publish the updated lesson
          },
        }
      );

      ctx.send({
        message: "Lesson updated successfully",
        data: updatedLesson,
      });
    } catch (error) {
      ctx.throw(500, "Error updating lesson");
    }
  },
}));
