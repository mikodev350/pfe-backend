"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::resource.resource",
  ({ strapi }) => ({
    /****************************************************************/
    async create(ctx) {
      try {
        const {
          nom,
          format,
          parcours,
          modules,
          lessons,
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

        // Prepare images array
        const imageIds = images
          ? images.map((image) => {
              id: image.id;
            })
          : [];
        console.log("====================================");
        console.log(imageIds);
        console.log("====================================");
        // Verify and associate the uploaded files
        const createData = {
          nom: nom,
          format: format,
          note: note,
          link: link,
          bookReference: bookReference,
          images: imageIds,
          audio: audio && audio.id ? audio.id : null,
          pdf: pdf && pdf.id ? pdf.id : null,
          video: video && video.id ? video.id : null,
          parcours: parcours, // Ensure parcours is a valid ID
          modules: modules, // Ensure module is a valid ID
          lessons: lessons, // Ensure lesson is a valid ID
          users_permissions_user: userId,
          publishedAt: new Date(), // Set the current publication date
        };

        // console.log("Data to be created:", createData);

        // Create the resource
        const newResource = await strapi.entityService.create(
          "api::resource.resource",
          {
            data: createData,
          }
        );

        // Fetch the newly created resource with populated relations
        const resourceWithRelations = await strapi.entityService.findOne(
          "api::resource.resource",
          newResource.id,
          {
            populate: [
              "images",
              "audio",
              "pdf",
              "video",
              "parcours",
              "modules",
              "lessons",
            ],
          }
        );

        ctx.send({
          message: "Resource created successfully",
          data: resourceWithRelations,
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
            "modules",
            "lessons",
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
        const { page = 1, pageSize = 5, _q } = ctx.query;

        console.log("====================================");
        console.log(ctx.query);
        console.log("====================================");
        // Initialisation des filtres
        const filters = {
          users_permissions_user: {
            id: ctx.state.user.id,
          },
        };

        // Ajout du filtre pour la recherche si présent
        if (_q) {
          filters.nom = { $contains: _q };
        }

        const start = (Number(page) - 1) * pageSize;
        const limit = pageSize;

        const [resources, total] = await Promise.all([
          strapi.entityService.findMany("api::resource.resource", {
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
        const {
          nom,
          format,
          parcours,
          modules,
          lessons,
          note,
          images,
          audio,
          pdf,
          video,
          link,
          bookReference,
          userId,
        } = ctx.request.body;

        const { id } = ctx.params;

        console.log(
          "-----------------------------------------------------------------------"
        );

        console.log("ctx.request.body");

        console.log(ctx.request.body);
        console.log(
          "-----------------------------------------------------------------------"
        );
        // Vérifiez si la ressource existe
        const existingResource = await strapi.entityService.findOne(
          "api::resource.resource",
          id
        );

        if (!existingResource) {
          return ctx.throw(404, "Resource not found");
        }

        // Vérifiez si l'utilisateur existe
        const user = await strapi
          .query("plugin::users-permissions.user")
          .findOne({ where: { id: userId } });

        if (!user) {
          return ctx.throw(404, "User not found");
        }

        // Préparez les IDs des images
        const imageIds = images
          ? images.map((image) => image?.id).filter(Boolean)
          : [];

        // Vérifiez les relations
        const validParcours =
          parcours && parcours.length
            ? parcours.map((p) => p).filter(Boolean)
            : [];
        const validModules =
          modules && modules.length
            ? modules.map((m) => m).filter(Boolean)
            : [];
        const validLessons =
          lessons && lessons.length
            ? lessons.map((l) => l).filter(Boolean)
            : [];

        // Préparez les données à mettre à jour
        const updateData = {
          nom: nom,
          format: format,
          note: note,
          link: link,
          bookReference: bookReference,
          images: imageIds,
          audio: audio && audio.id ? audio.id : null,
          pdf: pdf && pdf.id ? pdf.id : null,
          video: video && video.id ? video.id : null,
          parcours: validParcours.length ? validParcours : null,
          modules: validModules.length ? validModules : null,
          lessons: validLessons.length ? validLessons : null,
          users_permissions_user: userId,
          publishedAt: new Date(), // Définissez la date de publication actuelle
        };

        console.log(
          "-----------------------------------------------------------------------"
        );

        console.log("updateData");

        console.log(updateData);
        console.log(
          "-----------------------------------------------------------------------"
        );

        // Mettez à jour la ressource
        const updatedResource = await strapi.entityService.update(
          "api::resource.resource",
          id,
          { data: updateData }
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

    // async update(ctx) {
    //   try {
    //     const {
    //       resourceName,
    //       format,
    //       parcours,
    //       module,
    //       lesson,
    //       note,
    //       images,
    //       audio,
    //       pdf,
    //       video,
    //       link,
    //       bookReference,
    //       userId,
    //     } = ctx.request.body;

    //     const { id } = ctx.params;

    //     // Check if the resource exists
    //     const existingResource = await strapi.entityService.findOne(
    //       "api::resource.resource",
    //       id
    //     );

    //     if (!existingResource) {
    //       return ctx.throw(404, "Resource not found");
    //     }

    //     // Check if the user exists
    //     const user = await strapi
    //       .query("plugin::users-permissions.user")
    //       .findOne({ where: { id: userId } });

    //     if (!user) {
    //       return ctx.throw(404, "User not found");
    //     }

    //     console.log("====================================");
    //     console.log(ctx.request.body);
    //     console.log("====================================");

    //     // Prepare images array, filtering out undefined values
    //     const imageIds = images
    //       ? images
    //           .filter((image) => image !== undefined)
    //           .map((image) => image.id)
    //       : [];

    //     // Verify and associate the uploaded files
    //     const updateData = {
    //       nom: resourceName,
    //       format: format,
    //       note: note,
    //       link: link,
    //       bookReference: bookReference,
    //       images: imageIds,
    //       audio: audio && audio.id ? audio.id : null,
    //       pdf: pdf && pdf.id ? pdf.id : null,
    //       video: video && video.id ? video.id : null,
    //       parcours: parcours, // Ensure parcours is a valid ID
    //       modules: module, // Ensure module is a valid ID
    //       lessons: lesson, // Ensure lesson is a valid ID
    //       users_permissions_user: userId,
    //     };

    //     console.log("Data to be updated:", updateData);

    //     // Update the resource
    //     const updatedResource = await strapi.entityService.update(
    //       "api::resource.resource",
    //       existingResource.id,
    //       { data: updateData }
    //     );

    //     ctx.send({
    //       message: "Resource updated successfully",
    //       data: updatedResource,
    //     });
    //   } catch (error) {
    //     console.error("Error updating resource:", error); // Log the error for debugging
    //     ctx.throw(500, "Error updating resource");
    //   }
    // },

    /************************************************************************/
  })
);
