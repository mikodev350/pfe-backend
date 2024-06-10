"use strict";

/**
 * parcour controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::parcour.parcour", ({ strapi }) => ({
  async create(ctx) {
    try {
      const { data } = ctx.request.body;

      // Log de débogage
      console.log("Received data:", data);

      // Créer le parcours
      const createdPathway = await strapi.entityService.create(
        "api::parcour.parcour",
        {
          data: {
            nom: data.nom,
            type: data.type,
            etablissement: data.etablissement,
            publishedAt: new Date(), // Publier le parcours
            users_permissions_user: ctx.state.user.id,
          },
        }
      );

      console.log("Created pathway:", createdPathway);

      // Créer les modules
      for (const moduleData of data.modules) {
        const createdModule = await strapi.entityService.create(
          "api::module.module",
          {
            data: {
              nom: moduleData.nom,
              parcour: createdPathway.id,
              publishedAt: new Date(), // Publier le module
              users_permissions_user: ctx.state.user.id,
            },
          }
        );

        console.log("Created module:", createdModule);

        // Créer les leçons pour chaque module
        if (moduleData.lessons && moduleData.lessons.length > 0) {
          for (const lessonName of moduleData.lessons) {
            if (lessonName) {
              // Vérifier que le nom de la leçon n'est pas vide
              const createdLesson = await strapi.entityService.create(
                "api::lesson.lesson",
                {
                  data: {
                    nom: lessonName,
                    module: createdModule.id,
                    publishedAt: new Date(), // Publier la leçon
                    users_permissions_user: ctx.state.user.id,
                  },
                }
              );
              console.log("Created lesson:", createdLesson);
            }
          }
        }

        // Associer les ressources au module
        if (moduleData.resources && moduleData.resources.length > 0) {
          for (const resourceData of moduleData.resources) {
            const createdResource = await strapi.entityService.create(
              "api::resource.resource",
              {
                data: {
                  nom: resourceData.nom,
                  format: resourceData.format,
                  module: createdModule.id,
                  publishedAt: new Date(), // Publier la ressource
                  users_permissions_user: ctx.state.user.id,
                },
              }
            );
            console.log("Created resource:", createdResource);
          }
        }
      }

      ctx.send({
        message: "Pathway created successfully",
        data: createdPathway,
      });
    } catch (error) {
      console.error("Error creating pathway:", error);
      ctx.throw(500, "An error occurred while creating the pathway");
    }
  },

  async find(ctx) {
    try {
      const { _page = 1, _limit = 5, _q = "" } = ctx.query;
      const page = parseInt(_page, 10);
      const limit = parseInt(_limit, 10);
      const start = (page - 1) * limit;

      // Rechercher les parcours avec pagination et filtre de recherche
      const [parcours, total] = await Promise.all([
        strapi.query("api::parcour.parcour").findMany({
          populate: ["users_permissions_user"],
          where: {
            $or: [
              { nom: { $contains: _q } },
              { etablissement: { $contains: _q } },
            ],
            users_permissions_user: {
              id: ctx.state.user.id,
            },
          },
          offset: start,
          limit,
        }),
        strapi.query("api::parcour.parcour").count({
          where: {
            $or: [
              { nom: { $contains: _q } },
              { etablissement: { $contains: _q } },
            ],
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      ctx.send({
        data: parcours,
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
      console.error("Error retrieving pathways:", error);
      ctx.throw(500, "An error occurred while retrieving the pathways");
    }
  },
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { pathwayData } = ctx.request.body;
      const updatedPathway = await strapi.entityService.update(
        "api::parcour.parcour",
        id,
        {
          data: {
            nom: pathwayData.nom,
            type: pathwayData.type,
            etablissement: pathwayData.etablissement,
            autoApprentissage: pathwayData.autoApprentissage,
          },
        }
      );
      ctx.send({
        message: "Pathway updated successfully",
        data: updatedPathway,
      });
    } catch (error) {
      console.error("Error updating pathway:", error);
      ctx.throw(500, "An error occurred while updating the pathway");
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const pathway = await strapi.entityService.findOne(
        "api::parcour.parcour",
        id,
        {
          populate: {
            modules: {
              populate: ["lessons"],
            },
          },
        }
      );

      if (!pathway) {
        return ctx.throw(404, "Pathway not found");
      }

      ctx.send({
        data: pathway,
      });
    } catch (error) {
      console.error("Error fetching pathway:", error);
      ctx.throw(500, "An error occurred while fetching the pathway");
    }
  },
}));
