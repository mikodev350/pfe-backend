"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::lesson.lesson", ({ strapi }) => ({
  async create(ctx) {
    try {
      const { data } = ctx.request.body;

      if (!data.nom || !data.module) {
        return ctx.badRequest("Le nom de la leçon et le module sont requis");
      }

      const existingModule = await strapi.entityService.findOne(
        "api::module.module",
        data.module
      );

      if (!existingModule) {
        return ctx.throw(404, "Module non trouvé");
      }

      const newLesson = await strapi.entityService.create(
        "api::lesson.lesson",
        {
          data: {
            nom: data.nom,
            module: data.module,
            users_permissions_user: ctx.state.user.id,
            publishedAt: new Date(),
          },
        }
      );

      ctx.send({ message: "Leçon créée avec succès", data: newLesson });
    } catch (error) {
      console.error("Erreur lors de la création de la leçon :", error);
      ctx.throw(500, "Une erreur est survenue lors de la création de la leçon");
    }
  },

  async find(ctx) {
    try {
      const { _page = 1, _limit = 5, _q = "", module } = ctx.query;
      const page = parseInt(_page, 10) || 1;
      const limit = parseInt(_limit, 10) || 5;
      const query = _q || "";
      const userId = ctx.state.user.id;

      const result = await strapi
        .service("api::lesson.lesson")
        .findLessons(page, limit, query, module, userId);

      ctx.send(result);
    } catch (error) {
      console.error("Erreur lors de la récupération des leçons:", error);
      ctx.throw(
        500,
        "Une erreur est survenue lors de la récupération des leçons"
      );
    }
  },

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { nom } = ctx.request.body;

      console.log("====================================");
      console.log("this is  puttt data ");
      console.log(ctx.request.body);

      console.log("====================================");
      if (!nom) {
        return ctx.badRequest("Le nom de la leçon est requis");
      }

      const existingLesson = await strapi.entityService.findOne(
        "api::lesson.lesson",
        id
      );

      if (!existingLesson) {
        return ctx.throw(404, "Leçon non trouvée");
      }

      const updatedLesson = await strapi.entityService.update(
        "api::lesson.lesson",
        id,
        {
          data: {
            nom,
            users_permissions_user: ctx.state.user.id,
            publishedAt: new Date(),
          },
        }
      );

      ctx.send({
        message: "Leçon mise à jour avec succès",
        data: updatedLesson,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la leçon :", error);
      ctx.throw(
        500,
        "Une erreur est survenue lors de la mise à jour de la leçon"
      );
    }
  },

  async delete(ctx) {
    try {
      const { id } = ctx.params;

      const existingLesson = await strapi.entityService.findOne(
        "api::lesson.lesson",
        id
      );

      if (!existingLesson) {
        return ctx.throw(404, "Leçon non trouvée");
      }

      await strapi.entityService.delete("api::lesson.lesson", id);

      ctx.send({
        message: "Leçon supprimée avec succès",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression de la leçon :", error);
      ctx.throw(
        500,
        "Une erreur est survenue lors de la suppression de la leçon"
      );
    }
  },
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const userId = ctx.state.user.id;

      const existingLesson = await strapi.entityService.findOne(
        "api::lesson.lesson",
        id,
        {
          filters: { users_permissions_user: userId },
        }
      );

      if (!existingLesson) {
        return ctx.throw(404, "Leçon non trouvée");
      }

      ctx.send({
        message: "Leçon récupérée avec succès",
        data: existingLesson,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération de la leçon :", error);
      ctx.throw(
        500,
        "Une erreur est survenue lors de la récupération de la leçon"
      );
    }
  },
}));
