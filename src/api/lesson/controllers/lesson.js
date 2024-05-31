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
      const { name, module } = ctx.request.body;

      // Vérifiez si le module existe
      const existingModule = await strapi.entityService.findOne(
        "api::module.module",
        module
      );

      if (!existingModule) {
        return ctx.throw(404, "Module not found");
      }

      // Créez la leçon
      const createdLesson = await strapi.entityService.create(
        "api::lesson.lesson",
        {
          data: {
            nom: name,
            module: module,
            publishedAt: new Date(), // Publier automatiquement la leçon
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
