"use strict";

/**
 * module controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::module.module", ({ strapi }) => ({
  async create(ctx) {
    try {
      const { data } = ctx.request.body;

      console.log(data);
      console.log("ctx.request.body");

      if (!data.nom || !data.parcour) {
        return ctx.badRequest("Le nom du module et le parcours sont requis");
      }

      const dataIntiale = {
        nom: data.nom,
        parcour: data.parcour,
      };
      const newModule = await strapi.entityService.create(
        "api::module.module",
        {
          data: {
            nom: dataIntiale.nom,
            parcour: dataIntiale.parcour,
            users_permissions_user: ctx.state.user.id,
          },
        }
      );

      ctx.send({ message: "Module créé avec succès", data: newModule });
    } catch (error) {
      console.error("Erreur lors de la création du module:", error);
      ctx.throw(500, "Une erreur est survenue lors de la création du module");
    }
  },
  async find(ctx) {
    try {
      const { _page = 1, _limit = 5, _q = "", parcour } = ctx.query;
      const page = parseInt(_page, 10) || 1;
      const limit = parseInt(_limit, 10) || 5;
      const query = _q || "";
      const userId = ctx.state.user.id;

      const result = await strapi
        .service("api::module.module")
        .findModules(page, limit, query, parcour, userId);

      ctx.send(result);
    } catch (error) {
      console.error("Erreur lors de la récupération des modules:", error);
      ctx.throw(
        500,
        "Une erreur est survenue lors de la récupération des modules"
      );
    }
  },
  // /-------------------------------------------------------------------------------------/
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const module = await strapi.entityService.findOne(
        "api::module.module",
        id
      );

      if (!module) {
        return ctx.throw(404, "Module non trouvé");
      }

      ctx.send({
        message: "Module trouvé avec succès",
        data: module,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du module:", error);
      ctx.throw(
        500,
        "Une erreur est survenue lors de la récupération du module"
      );
    }
  },

  /*****************************************************************************************/
  async delete(ctx) {
    try {
      const { id } = ctx.params;

      // Vérifiez si le module existe
      const existingModule = await strapi.entityService.findOne(
        "api::module.module",
        id
      );

      if (!existingModule) {
        return ctx.throw(404, "Module non trouvé");
      }

      // Trouver toutes les leçons liées au module
      const relatedLessons = await strapi.entityService.findMany(
        "api::lesson.lesson",
        {
          filters: { module: id },
        }
      );

      // Supprimer toutes les leçons liées
      await Promise.all(
        relatedLessons.map((lesson) =>
          strapi.entityService.delete("api::lesson.lesson", lesson.id)
        )
      );

      // Supprimer le module
      await strapi.entityService.delete("api::module.module", id);

      ctx.send({
        message: "Module et leçons liées supprimés avec succès",
      });
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du module et des leçons liées:",
        error
      );
      ctx.throw(
        500,
        "Une erreur est survenue lors de la suppression du module et des leçons liées"
      );
    }
  },
  /********************************************************************************************/
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { nom } = ctx.request.body;
      if (!nom) {
        return ctx.badRequest("Le nom du module et le parcours sont requis");
      }

      // Vérifiez si le module existe
      const existingModule = await strapi.entityService.findOne(
        "api::module.module",
        id
      );
      if (!existingModule) {
        return ctx.throw(404, "Module non trouvé");
      }

      const updatedModule = await strapi.entityService.update(
        "api::module.module",
        id,
        {
          data: {
            nom,
            users_permissions_user: ctx.state.user.id,
          },
        }
      );

      ctx.send({
        message: "Module mis à jour avec succès",
        data: updatedModule,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du module:", error);
      ctx.throw(
        500,
        "Une erreur est survenue lors de la mise à jour du module"
      );
    }
  },
}));
