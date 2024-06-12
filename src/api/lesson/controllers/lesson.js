"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::lesson.lesson", ({ strapi }) => ({
  async find(ctx) {
    try {
      const { _page = 1, _limit = 5, _q = "", moduleId } = ctx.query;
      const page = parseInt(_page, 10);
      const limit = parseInt(_limit, 10);
      const start = (page - 1) * limit;

      const where = {
        nom: { $contains: _q },
        module: moduleId,
        users_permissions_user: {
          id: ctx.state.user.id,
        },
      };

      const [lessons, total] = await strapi.db
        .query("api::lesson.lesson")
        .findWithCount({
          where,
          start,
          limit,
          sort: { createdAt: "DESC" },
        });

      ctx.send({
        data: lessons,
        meta: {
          pagination: {
            page,
            pageSize: limit,
            pageCount: Math.ceil(total / limit),
            total,
          },
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des leçons :", error);
      ctx.throw(500, "Erreur lors de la récupération des leçons");
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
        return ctx.throw(404, "Module non trouvé");
      }

      // Créez la leçon
      const createdLesson = await strapi.entityService.create(
        "api::lesson.lesson",
        {
          data: {
            nom: name,
            module: module,
            users_permissions_user: ctx.state.user.id,
            publishedAt: new Date(), // Publier automatiquement la leçon
          },
        }
      );

      ctx.send({
        message: "Leçon créée avec succès",
        data: createdLesson,
      });
    } catch (error) {
      ctx.throw(500, "Erreur lors de la création de la leçon");
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
            users_permissions_user: ctx.state.user.id,
            publishedAt: new Date(), // Publier automatiquement la leçon mise à jour
          },
        }
      );

      ctx.send({
        message: "Leçon mise à jour avec succès",
        data: updatedLesson,
      });
    } catch (error) {
      ctx.throw(500, "Erreur lors de la mise à jour de la leçon");
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;

      // Vérifiez si la leçon existe
      const existingLesson = await strapi.entityService.findOne(
        "api::lesson.lesson",
        id
      );

      if (!existingLesson) {
        return ctx.throw(404, "Leçon non trouvée");
      }

      // Supprimez la leçon
      await strapi.entityService.delete("api::lesson.lesson", id);

      ctx.send({
        message: "Leçon supprimée avec succès",
      });
    } catch (error) {
      ctx.throw(500, "Erreur lors de la suppression de la leçon");
    }
  },
}));
