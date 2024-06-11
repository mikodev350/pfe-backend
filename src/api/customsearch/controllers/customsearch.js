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
      searchQuery.filters["parcours.name"] = { $contains: name };
    }

    if (parcours) {
      searchQuery.filters.parcours = { id: { $in: parcours.split(",") } };
    }
    if (modules) {
      searchQuery.filters.modules = { id: { $in: modules.split(",") } };
    }
    if (lessons) {
      searchQuery.filters.lessons = { id: { $in: lessons.split(",") } };
    }

    try {
      const results = await strapi.entityService.findMany(
        "api::resource.resource",
        searchQuery
      );

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
        searchValue,
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

      console.log("Received query parameters:", ctx.query);

      let filters = {};

      if (searchValue) {
        filters.$or = [
          { username: { $contains: searchValue } },
          { email: { $contains: searchValue } },
          { "profil.nom": { $contains: searchValue } },
        ];
      }

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

      console.log("Constructed filters:", filters);

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
        users = users.filter((user) =>
          user.profil.matieresEnseignees.some((matiere) =>
            matieresArray.includes(matiere)
          )
        );
      }

      // Format the users data
      const formattedUsers = users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role.name,
        profil: {
          nom: user.profil.nom,
          typeEtudes: user.profil.typeEtudes,
          nomFormation: user.profil.nomFormation,
          niveauEtudes: user.profil.niveauEtudes,
          niveauSpecifique: user.profil.niveauSpecifique,
          matieresEnseignees: user.profil.matieresEnseignees,
          niveauEnseigne: user.profil.niveauEnseigne,
          specialiteEnseigne: user.profil.specialiteEnseigne,
        },
        profilePicture: user.profil.photoProfil
          ? user.profil.photoProfil.url
          : null,
      }));

      console.log("Retrieved users:", formattedUsers);
      ctx.send(formattedUsers);
    } catch (error) {
      strapi.log.error(error);
      ctx.throw(500, "Error fetching users");
    }
  },
};
