"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::resource.resource",
  ({ strapi }) => ({
    /****************************************************************/
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
          users_permissions_user: ctx.query.user.id,

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
    /**********************************************/
    async getAllResources(ctx) {
      const resources = await strapi.entityService.findMany(
        "api::resource.resource",
        {
          populate: [
            "parcours",
            "module",
            "lesson",
            "images",
            "audio",
            "pdf",
            "video",
          ],
        }
      );
      ctx.send(resources);
    },
    /*********************************************************************************/
    async find(ctx) {
      try {
        // const { page = 1, pageSize = 10, section, search } = ctx.query;
        const { page, pageSize = 5, section, search } = ctx.query;
        console.log(ctx.query);
        const filters = {
          users_permissions_user: {
            id: ctx.state.user.id,
          },
        };

        if (section) {
          filters.section = section;
        }
        if (search) {
          filters.name = { $contains: search };
        }

        const start = (Number(page) - 1) * pageSize;
        const limit = pageSize;

        const [resources, total] = await Promise.all([
          strapi.entityService.findMany("api::resource.resource", {
            filters,
            populate: [
              "parcours",
              "module",
              "lesson",
              "images",
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
      } catch (error) {
        console.error("Error fetching resources:", error);
        ctx.throw(500, "Error fetching resources");
      }
    },
    /*********************************************************/

    async findOne(ctx) {
      try {
        const { id } = ctx.params;

        const filters = {
          id: id,
          users_permissions_user: {
            id: ctx.state.user.id,
          },
        };

        const resource = await strapi.entityService.findMany(
          "api::resource.resource",
          {
            filters,
            populate: [
              "parcours",
              "modules",
              "lessons",
              "images",
              "audio",
              "pdf",
              "video",
            ],
          }
        );

        if (resource.length === 0) {
          return ctx.throw(404, "Resource not found");
        }

        ctx.send(resource[0]);
      } catch (error) {
        ctx.throw(500, "Error fetching resource");
      }
    },
    /************************************************************************/

    async update(ctx) {
      try {
        const { id } = ctx.params;
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

        // Log the entire request body for debugging
        console.log("Request Body:", ctx.request.body);

        // Vérifier et associer les fichiers uploadés
        const updateData = {
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
          users_permissions_user: ctx.query.user.id,
          updatedAt: new Date(), // Définir la date de mise à jour actuelle
        };

        // Logging the updateData object for debugging
        console.log("====================================");
        console.log("Update Data:", updateData);
        console.log("====================================");

        // Mettre à jour la ressource
        const updatedResource = await strapi.entityService.update(
          "api::resource.resource",
          id,
          {
            data: updateData,
          }
        );

        ctx.send({
          message: "Resource updated successfully",
          data: updatedResource,
        });
      } catch (error) {
        console.error("Error updating resource:", error);
        ctx.throw(500, "Error updating resource");
      }
    },

    /************************************************************************/
  })
);
