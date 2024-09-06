"use strict";

const jwt = require("jsonwebtoken");
const {
  generateTemporaryToken,
  verifyToken,
} = require("../../generateLink/services/token");
module.exports = {
  async getAllParcours(ctx) {
    // ctx.state.user.id;
    const data = await strapi.db.query("api::parcour.parcour").findMany({
      populate: ["users_permissions_user"],
      where: {
        users_permissions_user: {
          id: ctx.state.user.id,
        },
      },
    });
    const parcours = data.map((parcour) => ({
      id: parcour.id,
      name: parcour.nom,
    }));
    ctx.send(parcours);
  },
  async getAllModules(ctx) {
    const data = await strapi.db.query("api::module.module").findMany({
      populate: ["users_permissions_user", "parcour"],
      where: {
        users_permissions_user: {
          id: ctx.state.user.id,
        },
      },
    });
    const modules = data.map((module) => ({
      id: module.id,
      name: module.nom,
      idparcour: module.parcour.id,
    }));
    ctx.send(modules);
  },

  async getAllLessons(ctx) {
    const data = await strapi.db.query("api::lesson.lesson").findMany({
      populate: ["users_permissions_user", "module"],
      where: {
        users_permissions_user: {
          id: ctx.state.user.id,
        },
      },
    });
    const lessons = data.map((lesson) => ({
      id: lesson.id,
      name: lesson.nom,
      idmodule: lesson.module.id,
    }));
    ctx.send(lessons);
  },

  /*******************************************************************/
  // Generate link for sharing the resource
  async generateLink(ctx) {
    // http://localhost:1337/api/resources-link/31/generate-link
    const { id } = ctx.params;
    const resource = await strapi.db
      .query("api::resource.resource")
      .findOne({ where: { id } });
    if (!resource) {
      return ctx.notFound("Resource not found");
    }
    const token = generateTemporaryToken(resource.id);

    const link = `http://localhost:3000/dashboard/resources/access/${token}`;
    ctx.send({ link });
  },

  // Access the resource using the token
  // http://localhost:1337/api/resources-link/31/generate-link
  // /*http://localhost:1337/api/resources-link/access/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZXNvdXJjZUlkIjoxMywiaWF0IjoxNzE4ODA2NjQyLCJleHAiOjE3MTg4MTM4NDJ9.Wcwt_nHNtf7XaQTXGnUv-55rZhxaawFPtCmsFLqbdso */
  // Access the resource using the token

  async accessResource(ctx) {
    const { token } = ctx.params;
    try {
      // Verify the token
      console.log("====================================");
      console.log(token);
      console.log("====================================");
      const decoded = verifyToken(token);
      if (!decoded) {
        throw new Error("Invalid token");
      }
      const resource = await strapi.db.query("api::resource.resource").findOne({
        where: { id: decoded.resourceId },
        populate: ["audio", "images", "pdf", "video"], // Ensure to populate media fields
      });
      if (!resource) {
        return ctx.notFound("Resource not found");
      }
      ctx.send(resource);
    } catch (error) {
      ctx.unauthorized("Invalid or expired token");
    }
  },
  /**********************************************************************/
  /**clone the resource */
  async cloneResource(ctx) {
    console.log("i am here");
    const { id } = ctx.params;
    try {
      // Fetch the resource to clone
      const resource = await strapi.db.query("api::resource.resource").findOne({
        where: { id: id },
        populate: ["audio", "images", "pdf", "video"], // Ensure to populate media fields
      });

      if (!resource) {
        return ctx.throw(404, "Resource not found");
      }

      // Extract necessary fields and IDs of media files
      const {
        nom,
        format,
        note,
        link,
        referenceLivre,
        audio,
        images,
        pdf,
        video,
      } = resource;

      // Create new resource data
      const createData = {
        nom,
        format,
        note,
        link,
        referenceLivre,
        images: images ? images.map((img) => img.id) : [], // Store image IDs
        audio: audio ? audio.id : null,
        pdf: pdf ? pdf.id : null,
        video: video ? video.id : null,
        publishedAt: new Date(), // Set the current publication date
        users_permissions_user: ctx.state.user.id,
      };

      // Create a new resource with the specified data
      const newResource = await strapi.entityService.create(
        "api::resource.resource",
        {
          data: createData,
        }
      );

      // Send the new resource back
      ctx.send(newResource);
    } catch (error) {
      console.error("Error cloning resource:", error);
      ctx.throw(500, "Error cloning resource");
    }
  },
};

// "use strict";

// module.exports = {
//   async getAllParcours(ctx) {
//     const data = await strapi.db.query("api::parcour.parcour").findMany({
//       populate: ["users_permissions_user"],
//     });

//     const parcours = data.map((parcour) => ({
//       id: parcour.id,
//       name: parcour.nom,
//       userId: parcour.users_permissions_user.id,
//     }));
//     ctx.send(parcours);
//   },

//   async getAllModules(ctx) {
//     const data = await strapi.db.query("api::module.module").findMany({
//       populate: ["parcour", "users_permissions_user"],
//     });

//     const modules = data.map((module) => ({
//       id: module.id,
//       name: module.nom,
//       parcourId: module.parcour.id,
//       userId: module.users_permissions_user.id,
//     }));
//     ctx.send(modules);
//   },

//   async getAllLessons(ctx) {
//     const data = await strapi.db.query("api::lesson.lesson").findMany({
//       populate: ["module", "users_permissions_user"],
//     });

//     const lessons = data.map((lesson) => ({
//       id: lesson.id,
//       name: lesson.nom,
//       moduleId: lesson.module.id,
//       userId: lesson.users_permissions_user.id,
//     }));
//     ctx.send(lessons);
//   },
// };
