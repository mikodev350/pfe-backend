"use strict";

module.exports = {
  async getParcours(ctx) {
    const user = ctx.state.user;
    const data = await strapi.db.query("api::parcour.parcour").findMany({
      populate: ["users_permissions_user"],
      where: {
        // user: user.id,
        users_permissions_user: {
          id: user.id,
        },
      },
    });

    const parcours = data.map((parcour) => ({
      id: parcour.id,
      name: parcour.nom,
    }));
    ctx.send(parcours);
  },

  // modules: [
  //   { id: 1, name: "Module 1", parcoursId: 1 },
  //   { id: 2, name: "Module 2", parcoursId: 1 },
  //   { id: 3, name: "Module 3", parcoursId: 2 },
  //   { id: 4, name: "Module 4", parcoursId: 2 },
  //   { id: 5, name: "Module 5", parcoursId: 2 },
  // ],
  async getModulesByParcours(ctx) {
    // const user = ctx.state.user; // Obtenir l'utilisateur connecté
    const { parcoursId } = ctx.params;

    const data = await strapi.db.query("api::module.module").findMany({
      populate: ["parcour"],
      where: {
        parcour: {
          id: parcoursId,
        },
      }, // Filtrer par parcours et utilisateur
    });
    console.log(data);

    const modules = data.map((module) => ({
      id: module.id,
      name: module.nom,
    }));
    ctx.send(modules);
  },

  async getLessonsByModule(ctx) {
    const user = ctx.state.user; // Obtenir l'utilisateur connecté
    const { moduleId } = ctx.params;
    const lessons = await strapi.db.query("api::lesson.lesson").findMany({
      where: { module: moduleId, user: user.id }, // Filtrer par module et utilisateur
    });
    ctx.send(lessons);
  },
};
