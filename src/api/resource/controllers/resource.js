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
          parcours: parcours,
          modules: module,
          lessons: lesson,
          publishedAt: new Date(), // Définir la date de publication actuelle
        };

        // Créer la ressource
        const newResource = await strapi.entityService.create(
          "api::resource.resource",
          {
            data: createData,
          }
        );

        ctx.send({
          message: "Resource created successfully",
          data: newResource,
        });
      } catch (error) {
        ctx.throw(500, "Error creating resource");
      }
    },

    /****************************************************/
    async getAllResources(ctx) {
      const resources = await strapi.entityService.findMany(
        "api::resource.resource",
        {
          populate: [
            "parcours",
            "module",
            "lesson",
            "image",
            "audio",
            "pdf",
            "video",
          ],
        }
      );
      ctx.send(resources);
    },
    async find(ctx) {
      const { page = 1, pageSize = 10, section, search } = ctx.query;

      const filters = {};
      if (section) {
        filters.section = section;
      }
      if (search) {
        filters.name = { $contains: search };
      }

      const start = (page - 1) * pageSize;
      const limit = pageSize;

      const [resources, total] = await Promise.all([
        strapi.entityService.findMany("api::resource.resource", {
          filters,
          populate: [
            "parcours",
            "module",
            "lesson",
            "image",
            "audio",
            "pdf",
            "video",
          ],
          start,
          limit,
        }),
        strapi.entityService.count("api::resource.resource", {
          filters,
        }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      ctx.send({
        data: resources,
        total,
        totalPages,
      });
    },
    async findOne(ctx) {
      try {
        const { id } = ctx.params;
        const resource = await strapi.entityService.findOne(
          "api::resource.resource",
          id,
          {
            populate: [
              "parcours",
              "modules",
              "lessons",
              "image",
              "audio",
              "pdf",
              "video",
            ],
          }
        );
        console.log("====================================");
        console.log(resource);
        console.log("====================================");
        ctx.send(resource);
      } catch (error) {
        ctx.throw(500, "Error fetching resource");
      }
    },
    // async find(ctx) {
    //   const resources = await strapi.entityService.findMany(
    //     "api::resource.resource",
    //     {
    //       populate: [
    //         "parcours",
    //         "module",
    //         "lesson",
    //         "image",
    //         "audio",
    //         "pdf",
    //         "video",
    //       ],
    //     }
    //   );
    //   console.log(resources);
    //   ctx.send(resources);
    // },
    /****************************************************/
  })
);

// 'use strict';

// /**
//  * resource controller
//  */

// const { createCoreController } = require('@strapi/strapi').factories;

// module.exports = createCoreController('api::resource.resource');
