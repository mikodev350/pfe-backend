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
          note,
          images,
          audio,
          pdf,
          video,
          link,
          bookReference,
          userId,
        } = ctx.request.body;

        // Check if the user exists
        const user = await strapi
          .query("plugin::users-permissions.user")
          .findOne({ where: { id: userId } });

        if (!user) {
          return ctx.throw(404, "User not found");
        }

        console.log("====================================");
        console.log(ctx.request.body);
        console.log("====================================");

        // Prepare images array
        const imageIds = images ? images.map((image) => image.id) : [];

        // Verify and associate the uploaded files
        const createData = {
          nom: resourceName,
          format: format,
          note: note,
          link: link,
          bookReference: bookReference,
          images: imageIds,
          audio: audio && audio.id ? audio.id : null,
          pdf: pdf && pdf.id ? pdf.id : null,
          video: video && video.id ? video.id : null,
          parcours: parcours, // Ensure parcours is a valid ID
          modules: module, // Ensure module is a valid ID
          lessons: lesson, // Ensure lesson is a valid ID
          users_permissions_user: userId,
          publishedAt: new Date(), // Set the current publication date
        };

        console.log("Data to be created:", createData);

        // Create the resource
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
        console.error("Error creating resource:", error); // Log the error for debugging
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
        const { id } = ctx.params; // Get the resource ID from the URL parameters
        const {
          resourceName,
          format,
          parcours,
          module,
          lesson,
          note,
          images,
          audio,
          pdf,
          video,
          link,
          bookReference,
          userId,
        } = ctx.request.body;

        // Check if the resource exists
        const existingResource = await strapi.entityService.findOne(
          "api::resource.resource",
          id
        );
        if (!existingResource) {
          return ctx.throw(404, "Resource not found");
        }

        // Check if the user exists
        const user = await strapi
          .query("plugin::users-permissions.user")
          .findOne({ where: { id: userId } });

        if (!user) {
          return ctx.throw(404, "User not found");
        }

        console.log("====================================");
        console.log(ctx.request.body);
        console.log("====================================");

        // Prepare images array
        const imageIds = images ? images.map((image) => image.id) : [];

        // Verify and associate the uploaded files
        const updateData = {
          nom: resourceName,
          format: format,
          note: note,
          link: link,
          bookReference: bookReference,
          images: imageIds,
          audio: audio && audio.id ? audio.id : null,
          pdf: pdf && pdf.id ? pdf.id : null,
          video: video && video.id ? video.id : null,
          parcours: parcours,
          modules: module,
          lessons: lesson,
          users_permissions_user: userId,
        };

        // Update the resource
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
        console.error("Error updating resource:", error); // Log the error for debugging
        ctx.throw(500, "Error updating resource");
      }
    },

    /************************************************************************/
  })
);
