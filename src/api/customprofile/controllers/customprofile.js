"use strict";

module.exports = {
  findRelationStatus() {},
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
      const relation = await strapi.db.query("api::relation.relation").findOne({
        where: {
          $or: [
            {
              destinataire: {
                id: profile.id,
              },
            },
            {
              expediteur: {
                id: profile.id,
              },
            },
          ],
        },
        select: ["id", "status"],
        populate: {
          destinataire: {
            select: ["id"],
          },
          expediteur: {
            select: ["id"],
          },
        },
      });
      console.log(relation);
      if (!profile) {
        throw new Error("Profile not found");
      }

      const filteredProfile = {
        username: profile.username,
        email: profile.email,
        relationIsExist: !!relation,
        isFriends: relation?.status === "acceptée",
        isRequestSender: relation?.destinataire?.id !== Number(userId),
        profil: profile.profil
          ? {
              nomFormation: profile.profil.nomFormation || null,
              niveauEtudes: profile.profil.niveauEtudes || null,
              niveauSpecifique: profile.profil.niveauSpecifique || null,
              specialite: profile.profil.specialite || null,
              programmeEtudes: profile.profil.programmeEtudes || null,
              institution: profile.profil?.institution || null,
              experienceStage: profile.profil?.experienceStage || null,
              projets: profile.profil?.projets || null,
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

  async FindMyProfileForUpdate(ctx) {
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
