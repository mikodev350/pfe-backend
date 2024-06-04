"use strict";

module.exports = {
  // Méthode pour récupérer le profil de l'utilisateur connecté
  async findOne(ctx) {
    try {
      const user = ctx.state.user;

      const profil = await strapi.entityService.findMany("api::profil.profil", {
        filters: { users_permissions_user: user.id },
        populate: "*",
      });
      console.log(profil);

      if (profil.length === 0) {
        return ctx.notFound("Profile not found");
      }

      ctx.send(profil[0]);
    } catch (error) {
      strapi.log.error(error);
      ctx.throw(500, "Error fetching profile");
    }
  },
};

// "use strict";

// /**
//  * profil controller
//  */

// const { createCoreController } = require("@strapi/strapi").factories;

// module.exports = createCoreController("api::profil.profil", ({ strapi }) => ({
//   // Méthode pour créer un profil
//   async create(ctx) {
//     const user = ctx.state.user;

//     if (!user) {
//       return ctx.unauthorized("You must be logged in to create a profile");
//     }

//     const { body } = ctx.request;

//     // Associez l'utilisateur connecté au profil
//     body.user = user.id;

//     const entity = await strapi
//       .service("api::profil.profil")
//       .create({ data: body });
//     return this.transformResponse(entity);
//   },

//   // Méthode pour récupérer un profil par l'ID de l'utilisateur
//   async findOne(ctx) {
//     const user = ctx.state.user;

//     if (!user) {
//       return ctx.unauthorized("You must be logged in to view a profile");
//     }

//     const entity = await strapi
//       .service("api::profil.profil")
//       .find({ user: user.id });
//     return this.transformResponse(entity);
//   },

//   // Méthode pour mettre à jour un profil
//   async update(ctx) {
//     const user = ctx.state.user;

//     if (!user) {
//       return ctx.unauthorized("You must be logged in to update a profile");
//     }

//     const { body } = ctx.request;

//     const entity = await strapi
//       .service("api::profil.profil")
//       .update({ user: user.id }, { data: body });
//     return this.transformResponse(entity);
//   },
// }));
