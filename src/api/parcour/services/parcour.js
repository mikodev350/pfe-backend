"use strict";

/**
 * parcour service
 */

const { createCoreService } = require("@strapi/strapi").factories;

module.exports = createCoreService("api::parcour.parcour", ({ strapi }) => ({
  async createPathway(data, userId) {
    // Créer le parcours
    const createdPathway = await strapi.entityService.create(
      "api::parcour.parcour",
      {
        data: {
          nom: data.nom,
          type: data.type,
          etablissement: data.etablissement,
          publishedAt: new Date(), // Publier le parcours
          users_permissions_user: userId,
        },
      }
    );

    // Créer les modules
    for (const moduleData of data.modules) {
      const createdModule = await strapi.entityService.create(
        "api::module.module",
        {
          data: {
            nom: moduleData.nom,
            parcour: createdPathway.id,
            publishedAt: new Date(), // Publier le module
            users_permissions_user: userId,
          },
        }
      );

      // Créer les leçons pour chaque module
      if (moduleData.lessons && moduleData.lessons.length > 0) {
        for (const lessonName of moduleData.lessons) {
          if (lessonName) {
            // Vérifier que le nom de la leçon n'est pas vide
            await strapi.entityService.create("api::lesson.lesson", {
              data: {
                nom: lessonName,
                module: createdModule.id,
                publishedAt: new Date(), // Publier la leçon
                users_permissions_user: userId,
              },
            });
          }
        }
      }

      // Associer les ressources au module
      if (moduleData.resources && moduleData.resources.length > 0) {
        for (const resourceData of moduleData.resources) {
          await strapi.entityService.create("api::resource.resource", {
            data: {
              nom: resourceData.nom,
              format: resourceData.format,
              module: createdModule.id,
              publishedAt: new Date(), // Publier la ressource
              users_permissions_user: userId,
            },
          });
        }
      }
    }

    return createdPathway;
  },

  async findPathways(page, limit, query, userId) {
    const start = (page - 1) * limit;

    // Rechercher les parcours avec pagination et filtre de recherche
    const [parcours, total] = await Promise.all([
      strapi.db.query("api::parcour.parcour").findMany({
        populate: ["users_permissions_user"],
        where: {
          $or: [
            { nom: { $contains: query } },
            { etablissement: { $contains: query } },
          ],
          users_permissions_user: {
            id: userId,
          },
        },
        offset: start,
        limit,
      }),
      strapi.db.query("api::parcour.parcour").count({
        where: {
          $or: [
            { nom: { $contains: query } },
            { etablissement: { $contains: query } },
          ],
          users_permissions_user: {
            id: userId,
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: parcours,
      meta: {
        pagination: {
          page,
          pageSize: limit,
          pageCount: totalPages,
          total,
        },
      },
    };
  },
  async updatePathway(id, data) {
    return await strapi.entityService.update("api::parcour.parcour", id, {
      data: {
        nom: data.nom,
        type: data.type,
        etablissement: data.etablissement === null ? "" : data.etablissement,
        autoApprentissage:
          data.autoApprentissage === null ? false : data.autoApprentissage,
      },
    });
  },

  async findOnePathway(id) {
    return await strapi.entityService.findOne("api::parcour.parcour", id, {
      populate: {
        modules: {
          populate: ["lessons"],
        },
      },
    });
  },

  async deletePathway(id) {
    // Vérifiez si le parcours existe
    const existingPathway = await strapi.entityService.findOne(
      "api::parcour.parcour",
      id
    );

    if (!existingPathway) {
      throw new Error("Parcours non trouvé");
    }

    // Trouver tous les modules liés au parcours
    const relatedModules = await strapi.entityService.findMany(
      "api::module.module",
      {
        filters: { parcour: id },
      }
    );

    // Supprimer toutes les leçons et les modules liés
    for (const module of relatedModules) {
      // Trouver toutes les leçons liées au module
      const relatedLessons = await strapi.entityService.findMany(
        "api::lesson.lesson",
        {
          filters: { module: module.id },
        }
      );

      // Supprimer toutes les leçons liées
      await Promise.all(
        relatedLessons.map((lesson) =>
          strapi.entityService.delete("api::lesson.lesson", lesson.id)
        )
      );

      // Supprimer le module
      await strapi.entityService.delete("api::module.module", module.id);
    }

    // Supprimer le parcours
    await strapi.entityService.delete("api::parcour.parcour", id);
  },
}));

// "use strict";

// /**
//  * parcour service
//  */

// const { createCoreService } = require("@strapi/strapi").factories;

// module.exports = createCoreService("api::parcour.parcour");
