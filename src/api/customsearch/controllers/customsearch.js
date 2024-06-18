"use strict";

module.exports = {
  async advancedSearch(ctx) {
    const user = ctx.state.user;
    const { name, parcours, modules, lessons } = ctx.query;

    let searchQuery = {
      filters: {
        users_permissions_user: { id: user.id },
      },
      populate: ["parcours", "modules", "lessons", "resources"],
    };

    if (name) {
      searchQuery.filters.nom = { $contains: name };
    }

    if (parcours) {
      searchQuery.filters["parcours.id"] = {
        $in: parcours.split(",").map((id) => parseInt(id)),
      };
    }
    if (modules) {
      searchQuery.filters["modules.id"] = {
        $in: modules.split(",").map((id) => parseInt(id)),
      };
    }
    if (lessons) {
      searchQuery.filters["lessons.id"] = {
        $in: lessons.split(",").map((id) => parseInt(id)),
      };
    }

    try {
      const results = await strapi.entityService.findMany(
        "api::resource.resource",
        searchQuery
      );

      // Si aucun résultat trouvé, retourner un tableau vide
      if (results.length === 0) {
        ctx.send([]);
        return;
      }

      const data = results.map((result) => ({
        id: result.id,
        name: result.nom,
        parcours: result.parcours
          ? result.parcours.map((p) => p.nom).join(", ")
          : "",
        modules: result.modules
          ? result.modules.map((m) => m.nom).join(", ")
          : "",
        lessons: result.lessons
          ? result.lessons.map((l) => l.nom).join(", ")
          : "",
        resources: result.resources
          ? result.resources.map((r) => r.nom).join(", ")
          : "",
      }));

      ctx.send(data);
    } catch (error) {
      strapi.log.error(error);
      ctx.throw(500, "Error fetching resources");
    }
  },
  async searchUsers(ctx) {
    try {
      const {
        username,
        typeEtudes,
        nomFormation,
        niveauEtudes,
        niveauSpecifique,
        matieresEnseignees,
        niveauEnseigne,
        specialiteEnseigne,
        role,
      } = ctx.query;

      let filters = {};

      console.log("====================================");
      console.log(ctx.query);
      console.log("====================================");

      if (username) filters.username = { $contains: username };
      if (typeEtudes) filters["profil.typeEtudes"] = { $contains: typeEtudes };
      if (nomFormation)
        filters["profil.nomFormation"] = { $contains: nomFormation };
      if (niveauEtudes)
        filters["profil.niveauEtudes"] = { $contains: niveauEtudes };
      if (niveauSpecifique)
        filters["profil.niveauSpecifique"] = { $contains: niveauSpecifique };
      if (niveauEnseigne)
        filters["profil.niveauEnseigne"] = { $contains: niveauEnseigne };
      if (specialiteEnseigne)
        filters["profil.specialiteEnseigne"] = {
          $contains: specialiteEnseigne,
        };
      if (role) filters.role = { name: role };

      let users = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters,
          populate: ["role", "profil", "profil.photoProfil"],
        }
      );

      // Additional filtering for matieresEnseignees
      if (matieresEnseignees) {
        const matieresArray = matieresEnseignees.split(",");
        users = users.filter(
          (user) =>
            user.profil &&
            user.profil.matieresEnseignees &&
            user.profil.matieresEnseignees.some((matiere) =>
              matieresArray.includes(matiere)
            )
        );
      }

      // Format the users data
      const formattedUsers = users.map((user) => {
        const profil = user.profil || {};
        return {
          id: user.id,
          username: user.username,
          role: user.role ? user.role.name : "",
          profil: {
            nom: profil.nom || "",
            typeEtudes: profil.typeEtudes || "",
            nomFormation: profil.nomFormation || "",
            niveauEtudes: profil.niveauEtudes || "",
            niveauSpecifique: profil.niveauSpecifique || "",
            matieresEnseignees: profil.matieresEnseignees || [],
            niveauEnseigne: profil.niveauEnseigne || "",
            specialiteEnseigne: profil.specialiteEnseigne || "",
          },
          profilePicture: profil.photoProfil ? profil.photoProfil.url : null,
        };
      });

      console.log("Retrieved users:", formattedUsers);
      ctx.send(formattedUsers);
    } catch (error) {
      strapi.log.error(error);
      ctx.throw(500, "Error fetching users");
    }
  },

  async searchFriends(ctx) {
    try {
      const user = ctx.state.user;

      // Define the filters
      let filters = {
        $and: [
          { status: "acceptée" },
          {
            $or: [{ type: "FRIEND" }, { type: "PROFESIONAL" }],
          },
          {
            $or: [{ expediteur: user.id }, { destinataire: user.id }],
          },
        ],
      };

      // Fetch the relations that match the filters
      const relations = await strapi.entityService.findMany(
        "api::relation.relation",
        {
          filters,
          populate: ["destinataire", "expediteur"],
        }
      );

      console.log("Relations found:", relations);

      if (relations.length === 0) {
        console.log("No relations found matching the criteria.");
        ctx.send([]);
        return;
      }

      // Extract the friend IDs
      const friendIds = relations.map((relation) => {
        return relation.expediteur.id === user.id
          ? relation.destinataire.id
          : relation.expediteur.id;
      });

      console.log("Friend IDs:", friendIds);

      if (friendIds.length === 0) {
        console.log("No friend IDs extracted.");
        ctx.send([]);
        return;
      }

      // Fetch user details for the friends
      const friends = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          filters: { id: { $in: friendIds } },
          populate: ["profile"],
        }
      );

      console.log("Friends found:", friends);

      if (friends.length === 0) {
        console.log("No friends found for the given IDs.");
        ctx.send([]);
        return;
      }

      // Format the friends data
      const formattedFriends = friends.map((friend) => ({
        id: friend.id,
        username: friend.username,
        profile: {
          name: friend.profile ? friend.profile.name : "",
          // Add other profile fields if necessary
        },
      }));

      ctx.send(formattedFriends);
    } catch (error) {
      strapi.log.error(error);
      ctx.throw(500, "Error fetching friends");
    }
  },
};
