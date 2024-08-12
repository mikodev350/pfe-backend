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
        users_permissions_user: userId,
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
          populate: ["attachments", "users_permissions_user"],
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
        users_permissions_user: {
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
        users_permissions_user: {
          id: ctx.state.user.id,
        },
      };

      const devoirs = await strapi.entityService.findMany(
        "api::devoir.devoir",
        {
          filters,
          populate: ["users_permissions_user"],
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

      const devoir = await strapi.entityService.findOne(
        "api::devoir.devoir",
        id,
        {
          populate: ["attachments", "users_permissions_user"],
        }
      );

      console.log(devoir);

      if (!devoir) {
        return ctx.throw(404, "Devoir non trouvé");
      }

      ctx.send(devoir);
    } catch (error) {
      console.error("Erreur lors de la récupération du devoir:", error);
      ctx.throw(500, "Erreur lors de la récupération du devoir");
    }
  },

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
        users_permissions_user: userId,
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
