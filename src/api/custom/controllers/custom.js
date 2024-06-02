"use strict";

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
