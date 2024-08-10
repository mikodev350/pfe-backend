// File: src/api/relation/controllers/custompedagogique.js

module.exports = ({ strapi }) => ({
  async getAllStudents(ctx) {
    const { _q } = ctx.query;

    // Configuration de la recherche
    const searchCondition = _q
      ? {
          $or: [
            { username: { $containsi: _q } }, // Recherche par nom d'utilisateur
          ],
        }
      : {};

    const students = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        where: {
          type: "STUDENT",
          ...searchCondition,
        },
        select: ["id", "username", "email"],
        populate: {
          profil: {
            populate: {
              photoProfil: true,
            },
          },
        },
      });

    const studentList = students.map((student) => ({
      id: student.id,
      username: student.username,
      email: student.email,
      photoProfil: student.profil.photoProfil?.url || "default-avatar-url",
    }));

    return ctx.send({ students: studentList });
  },
});
