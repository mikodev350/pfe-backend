"use strict";

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::devoir.devoir", ({ strapi }) => ({
  // Création d'un devoir
  async create(ctx) {
    try {
      const { titre, description } = ctx.request.body;
      const userId = ctx.state.user.id;
      console.log(ctx.request.body); // Vérification de l'existence de l'utilisateur
      const user = await strapi
        .query("plugin::users-permissions.user")
        .findOne({ where: { id: userId } });

      if (!user) {
        return ctx.throw(404, "Utilisateur non trouvé");
      }

      // Préparation des données à créer
      const createData = {
        titre,
        description,
        professeur: userId,
        publishedAt: new Date(),
      };

      // Création du devoir
      const newDevoir = await strapi.entityService.create(
        "api::devoir.devoir",
        { data: createData }
      );

      // Récupération du devoir avec les relations peuplées
      const devoirWithRelations = await strapi.entityService.findOne(
        "api::devoir.devoir",
        newDevoir.id,
        {
          populate: ["professeur"],
        }
      );

      ctx.send({
        message: "Devoir créé avec succès",
        data: devoirWithRelations,
      });
    } catch (error) {
      console.error("Erreur lors de la création du devoir:", error);
      ctx.throw(500, "Erreur lors de la création du devoir");
    }
  },

  // Récupération de tous les devoirs avec pagination
  async find(ctx) {
    try {
      const { page = 1, pageSize = 5, _q } = ctx.query;

      const filters = {
        professeur: {
          id: ctx.state.user.id,
        },
      };

      if (_q) {
        filters.titre = { $contains: _q };
      }

      const start = (Number(page) - 1) * pageSize;
      const limit = pageSize;

      const [devoirs, total] = await Promise.all([
        strapi.entityService.findMany("api::devoir.devoir", {
          filters,
          populate: ["attachments", "users_permissions_user"],
          start,
          limit,
        }),
        strapi.entityService.count("api::devoir.devoir", { filters }),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      ctx.send({
        data: devoirs,
        total,
        totalPages,
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des devoirs:", error);
      ctx.throw(500, "Erreur lors de la récupération des devoirs");
    }
  },

  // Récupération de tous les devoirs sans pagination
  async getAll(ctx) {
    try {
      console.log(ctx.state.user.id);

      const filters = {
        professeur: {
          id: ctx.state.user.id,
        },
      };

      const devoirs = await strapi.entityService.findMany(
        "api::devoir.devoir",
        {
          filters,
          populate: ["professeur"],
        }
      );

      const data = devoirs.map((devoir) => {
        return {
          id: devoir.id,
          titre: devoir.titre,
        };
      });
      console.log(devoirs);
      ctx.send({
        data: data,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de tous les devoirs:",
        error
      );
      ctx.throw(500, "Erreur lors de la récupération de tous les devoirs");
    }
  },

  // Récupération d'un devoir spécifique
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const { type } = ctx.query;

      let devoir;

      console.log("====================================");
      console.log(type);
      console.log("====================================");
      if (type === "devoir") {
        // Si le type est 'devoir', on récupère directement le devoir
        devoir = await strapi.entityService.findOne("api::devoir.devoir", id);
      } else if (type === "assignation") {
        // Si le type est 'assignation', on passe d'abord par l'assignation
        const assignation = await strapi.entityService.findOne(
          "api::assignation.assignation",
          id,
          {
            populate: ["devoir"], // On inclut le devoir lié dans la requête
          }
        );
        console.log("====================================");

        console.log("assignation");

        console.log(assignation);
        console.log("====================================");

        if (!assignation || !assignation.devoir) {
          return ctx.throw(404, "Assignation ou devoir non trouvé");
        }

        devoir = assignation.devoir;
      } else {
        return ctx.throw(
          400,
          "Type invalide, veuillez spécifier 'devoir' ou 'assignation'"
        );
      }

      if (!devoir) {
        return ctx.throw(404, "Devoir non trouvé");
      }

      ctx.send(devoir);
    } catch (error) {
      console.error("Erreur lors de la récupération du devoir:", error);
      ctx.throw(500, "Erreur lors de la récupération du devoir");
    }
  },

  // // Récupération d'un devoir spécifique
  // async findOneForUpdate(ctx) {
  //   console.log("---------------------------------------");
  //   console.log("findOneForUpdate");
  //   console.log("---------------------------------------");
  //   try {
  //     const { id } = ctx.params;

  //     const devoir = await strapi.entityService.findOne(
  //       "api::devoir.devoir",
  //       id
  //     );

  //     console.log(devoir);

  //     if (!devoir) {
  //       return ctx.throw(404, "Devoir non trouvé");
  //     }

  //     ctx.send(devoir);
  //   } catch (error) {
  //     console.error("Erreur lors de la récupération du devoir:", error);
  //     ctx.throw(500, "Erreur lors de la récupération du devoir");
  //   }
  // },

  // Mise à jour d'un devoir
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { titre, description } = ctx.request.body;
      const userId = ctx.state.user.id;

      // Vérification de l'existence du devoir
      const existingDevoir = await strapi.entityService.findOne(
        "api::devoir.devoir",
        id
      );

      if (!existingDevoir) {
        return ctx.throw(404, "Devoir non trouvé");
      }

      // Préparation des données à mettre à jour
      const updateData = {
        titre,
        description,
        professeur: userId,
      };

      // Mise à jour du devoir
      const updatedDevoir = await strapi.entityService.update(
        "api::devoir.devoir",
        id,
        { data: updateData }
      );

      ctx.send({
        message: "Devoir mis à jour avec succès",
        data: updatedDevoir,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du devoir:", error);
      ctx.throw(500, "Erreur lors de la mise à jour du devoir");
    }
  },

  // Suppression d'un devoir
  async delete(ctx) {
    try {
      const { id } = ctx.params;

      // Vérification de l'existence du devoir
      const existingDevoir = await strapi.entityService.findOne(
        "api::devoir.devoir",
        id
      );

      if (!existingDevoir) {
        return ctx.throw(404, "Devoir non trouvé");
      }

      // Suppression du devoir
      await strapi.entityService.delete("api::devoir.devoir", id);

      ctx.send({ message: "Devoir supprimé avec succès" });
    } catch (error) {
      console.error("Erreur lors de la suppression du devoir:", error);
      ctx.throw(500, "Erreur lors de la suppression du devoir");
    }
  },
}));
