"use strict";

/**
 * module controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::module.module", ({ strapi }) => ({
  async create(ctx) {
    try {
      const { nom, parcour } = ctx.request.body;

      if (!nom || !parcour) {
        return ctx.badRequest("Le nom du module et le parcours sont requis");
      }

      const newModule = await strapi.entityService.create(
        "api::module.module",
        {
          data: {
            nom,
            parcour,
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

  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      console.log("Mise à jour du module id:", id, "avec les données:", data);

      const updatedModule = await strapi.entityService.update(
        "api::module.module",
        id,
        {
          data,
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

  async find(ctx) {
    try {
      const { _page = 1, _limit = 5, _q = "", parcour } = ctx.query;
      const page = parseInt(_page, 10);
      const limit = parseInt(_limit, 10);
      const start = (page - 1) * limit;

      const where = {
        users_permissions_user: {
          id: ctx.state.user.id,
        },
      };

      if (parcour) {
        where.parcour = parcour;
      }

      if (_q) {
        where.nom = { $contains: _q };
      }

      const [modules, total] = await Promise.all([
        strapi.query("api::module.module").findMany({
          where,
          offset: start,
          limit,
        }),
        strapi.query("api::module.module").count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      ctx.send({
        data: modules,
        meta: {
          pagination: {
            page,
            pageSize: limit,
            pageCount: totalPages,
            total,
          },
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des modules:", error);
      ctx.throw(
        500,
        "Une erreur est survenue lors de la récupération des modules"
      );
    }
  },

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
}));
