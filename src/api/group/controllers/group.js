"use strict";

/**
 * group controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::group.group", ({ strapi }) => ({
  // Créer un groupe
  async create(ctx) {
    try {
      const { nom, members } = ctx.request.body;
      const professeur = ctx.state.user.id;
      const group = await strapi.db.query("api::group.group").create({
        data: {
          nom: nom,
          membres: members, // Liaison des IDs des membres,
          professeur: professeur,
        },
      });

      return ctx.send({ group });
    } catch (error) {
      ctx.throw(500, "Internal Server Error");
    }
  },

  // Mettre à jour un groupe
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { nom, members } = ctx.request.body;
      const professeur = ctx.state.user.id;

      const updatedGroup = await strapi.db.query("api::group.group").update({
        where: { id },
        data: {
          nom: nom,
          membres: members, // Liaison des IDs des membres,
          professeur: professeur,
        },
      });

      return ctx.send({ updatedGroup });
    } catch (error) {
      ctx.throw(500, "Internal Server Error");
    }
  },

  async find(ctx) {
    try {
      const userId = ctx.state.user.id;
      const searchValue = ctx.query._q || ""; // Récupérer la valeur de recherche depuis la requête

      const filters = {
        professeur: userId,
      };

      // Ajouter le filtre de recherche si une valeur est fournie
      if (searchValue) {
        filters.nom = {
          $containsi: searchValue, // Recherche insensible à la casse
        };
      }

      const groups = await strapi.db.query("api::group.group").findMany({
        where: filters,
        populate: {
          membres: {
            select: ["id", "username"],
            populate: {
              profil: {
                populate: ["photoProfil"],
              },
            },
          },
          professeur: {
            select: ["id", "username", "email"],
          },
        },
      });

      // Affichage détaillé des groupes et membres
      console.log("Groups retrieved:");
      groups.forEach((group) => {
        console.log(`Group: ${group.nom}`);
        group.membres.forEach((membre) => {
          console.log(
            `- Member ID: ${membre.id}, Username: ${membre.username}`
          );
        });
      });

      return ctx.send({ groups });
    } catch (error) {
      console.error("Error finding groups:", error);
      ctx.throw(500, "Internal Server Error");
    }
  },
  // Trouver un groupe par ID
  async findOne(ctx) {
    try {
      const { id } = ctx.params;

      const group = await strapi.db.query("api::group.group").findOne({
        where: { id },
        populate: {
          members: {
            select: ["id", "username", "email"],
            populate: {
              profil: {
                populate: {
                  photoProfil: true,
                },
              },
            },
          },
          professeur: {
            select: ["id", "username", "email"],
          },
        },
      });

      if (!group) {
        return ctx.notFound("Group not found");
      }

      return ctx.send({ group });
    } catch (error) {
      ctx.throw(500, "Internal Server Error");
    }
  },

  // Supprimer un groupe
  async delete(ctx) {
    try {
      const { id } = ctx.params;

      const group = await strapi.db.query("api::group.group").delete({
        where: { id },
      });

      if (!group) {
        return ctx.notFound("Group not found");
      }

      return ctx.send({ message: "Group deleted successfully" });
    } catch (error) {
      ctx.throw(500, "Internal Server Error");
    }
  },
}));
