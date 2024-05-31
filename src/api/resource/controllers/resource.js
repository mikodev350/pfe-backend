"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::resource.resource",
  ({ strapi }) => ({
    async create(ctx) {
      try {
        const {
          resourceName,
          format,
          parcours,
          module,
          lesson,
          WriteText,
          youtubeLink,
          image,
          audio,
          pdf,
          video,
          link,
          bookReference,
        } = ctx.request.body;

        // Vérifier et associer les fichiers uploadés
        const createData = {
          nom: resourceName,
          format: format,
          note: WriteText,
          link: link,
          bookReference: bookReference,
          image: image?.id || null,
          audio: audio?.id || null,
          pdf: pdf?.id || null,
          video: video?.id || null,
        };

        console.log(createData);
        // Créer la ressource
        const newResource = await strapi.entityService.create(
          "api::resource.resource",
          {
            data: createData,
          }
        );

        // Associer la ressource aux parcours
        for (const parcourId of parcours) {
          await strapi.entityService.update("api::parcour.parcour", parcourId, {
            data: {
              resources: [
                ...(
                  await strapi.entityService.findOne(
                    "api::parcour.parcour",
                    parcourId
                  )
                ).resources,
                newResource.id,
              ],
            },
          });
        }

        // Associer la ressource aux modules
        for (const moduleId of module) {
          await strapi.entityService.update("api::module.module", moduleId, {
            data: {
              resources: [
                ...(
                  await strapi.entityService.findOne(
                    "api::module.module",
                    moduleId
                  )
                ).resources,
                newResource.id,
              ],
            },
          });
        }

        // Associer la ressource aux leçons
        for (const lessonId of lesson) {
          await strapi.entityService.update("api::lesson.lesson", lessonId, {
            data: {
              resources: [
                ...(
                  await strapi.entityService.findOne(
                    "api::lesson.lesson",
                    lessonId
                  )
                ).resources,
                newResource.id,
              ],
            },
          });
        }

        ctx.send({
          message: "Resource created successfully",
          data: newResource,
        });
      } catch (error) {
        ctx.throw(500, "Error creating resource");
      }
    },
  })
);

// 'use strict';

// /**
//  * resource controller
//  */

// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::resource.resource');
