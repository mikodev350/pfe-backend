"use strict";

module.exports = {
  // Utility function to fetch a user profile with populated fields
  async fetchUserProfile(userId) {
    try {
      const profile = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        userId,
        {
          populate: {
            profil: {
              populate: ["photoProfil"], // Populate photoProfil field
            },
            educations: true,
            experiences: true,
          },
        }
      );

      if (!profile) {
        throw new Error("Profile not found");
      }

      const filteredProfile = {
        username: profile.username,
        email: profile.email,
        profil: profile.profil
          ? {
              nomFormation: profile.profil.nomFormation || null,
              niveauEtudes: profile.profil.niveauEtudes || null,
              niveauSpecifique: profile.profil.niveauSpecifique || null,
              specialite: profile.profil.specialite || null,
              programmeEtudes: profile.profil.programmeEtudes || null,
              institution: profile.profil.institution || null,
              experienceStage: profile.profil.experienceStage || null,
              projets: profile.profil.projets || null,
              bio: profile.profil.bio || null,
              anneeEtudes: profile.profil.anneeEtudes || null,
              competences: profile.profil.competences || null,
              matieresEnseignees: profile.profil.matieresEnseignees || null,
              niveauEnseigne: profile.profil.niveauEnseigne || null,
              specialiteEnseigne: profile.profil.specialiteEnseigne || null,
              photoProfil: profile.profil.photoProfil
                ? profile.profil.photoProfil.url
                : null, // Add photoProfil field
            }
          : null,
        educations: profile.educations
          ? profile.educations.map((edu) => ({
              ecole: edu.ecole,
              diplome: edu.diplome,
              dateDebut: edu.dateDebut,
              dateFin: edu.dateFin,
              ecoleActuelle: edu.ecoleActuelle,
              descriptionProgramme: edu.descriptionProgramme,
              domaineEtude: edu.domaineEtude,
            }))
          : [],
        experiences: profile.experiences
          ? profile.experiences.map((exp) => ({
              titrePoste: exp.titrePoste,
              entreprise: exp.entreprise,
              localisation: exp.localisation,
              dateDebut: exp.dateDebut,
              dateFin: exp.dateFin,
              posteActuel: exp.posteActuel,
              descriptionPoste: exp.descriptionPoste,
            }))
          : [],
      };

      console.log(filteredProfile);
      return filteredProfile;
    } catch (error) {
      strapi.log.error(error);
      throw error;
    }
  },

  // Method to retrieve the profile of the connected user
  async findOne(ctx) {
    try {
      const user = ctx.state.user;
      const profile = await this.fetchUserProfile(user.id);

      ctx.send(profile);
    } catch (error) {
      if (error.message === "Profile not found") {
        ctx.notFound(error.message);
      } else {
        ctx.throw(500, "Error fetching profile");
      }
    }
  },

  // Method to retrieve the profile of a user by ID
  async findUserProfileById(ctx) {
    try {
      const { id } = ctx.params;
      console.log(id);
      const profile = await this.fetchUserProfile(id);

      ctx.send(profile);
    } catch (error) {
      if (error.message === "Profile not found") {
        ctx.notFound(error.message);
      } else {
        ctx.throw(500, "Error fetching profile");
      }
    }
  },
};

// "use strict";

// module.exports = {
//   // Méthode pour récupérer le profil de l'utilisateur connecté
//   async findOne(ctx) {
//     try {
//       const user = ctx.state.user;
//       const profil = await strapi.entityService.findMany("api::profil.profil", {
//         filters: { users_permissions_user: user.id },
//         populate: "*",
//       });
//       if (profil.length === 0) {
//         return ctx.notFound("Profile not found");
//       }

//       ctx.send(profil[0]);
//     } catch (error) {
//       strapi.log.error(error);
//       ctx.throw(500, "Error fetching profile");
//     }
//   },

//   async getProfileOfUser(ctx) {
//     try {
//       const user = ctx.state.user;

//       // Rechercher le profil associé à l'utilisateur connecté
//       const profile = await strapi.entityService.findOne(
//         "plugin::users-permissions.user",
//         user.id,
//         {
//           populate: {
//             profil: {
//               populate: ["photoProfil"], // Populate photoProfil field
//             },
//             educations: true,
//             experiences: true,
//           },
//         }
//       );

//       if (!profile) {
//         return ctx.notFound("Profile not found");
//       }

//       // Filtrer les données pour n'envoyer que les éléments nécessaires
//       const filteredProfile = {
//         username: profile.username,
//         email: profile.email,
//         profil: {
//           nomFormation: profile.profil.nomFormation,
//           niveauEtudes: profile.profil.niveauEtudes,
//           niveauSpecifique: profile.profil.niveauSpecifique,
//           specialite: profile.profil.specialite,

//           programmeEtudes: profile.profil.programmeEtudes,
//           institution: profile.profil.institution,
//           experienceStage: profile.profil.experienceStage,
//           projets: profile.profil.projets,
//           bio: profile.profil.bio,
//           anneeEtudes: profile.profil.anneeEtudes,
//           competences: profile.profil.competences,
//           matieresEnseignees: profile.profil.matieresEnseignees,
//           niveauEnseigne: profile.profil.niveauEnseigne,
//           specialiteEnseigne: profile.profil.specialiteEnseigne,
//           photoProfil: profile.profil.photoProfil
//             ? profile.profil.photoProfil.url
//             : null, // Add photoProfil field
//         },
//         educations: profile.educations.map((edu) => ({
//           ecole: edu.ecole,
//           diplome: edu.diplome,
//           dateDebut: edu.dateDebut,
//           dateFin: edu.dateFin,
//           ecoleActuelle: edu.ecoleActuelle,
//           descriptionProgramme: edu.descriptionProgramme,
//           domaineEtude: edu.domaineEtude,
//         })),
//         experiences: profile.experiences.map((exp) => ({
//           titrePoste: exp.titrePoste,
//           entreprise: exp.entreprise,
//           localisation: exp.localisation,
//           dateDebut: exp.dateDebut,
//           dateFin: exp.dateFin,
//           posteActuel: exp.posteActuel,
//           descriptionPoste: exp.descriptionPoste,
//         })),
//       };

//       ctx.send(filteredProfile);
//     } catch (error) {
//       strapi.log.error(error);
//       ctx.throw(500, "Error fetching profile");
//     }
//   },
// };
