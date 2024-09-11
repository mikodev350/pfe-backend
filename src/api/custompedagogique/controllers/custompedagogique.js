"use strict";

module.exports = ({ strapi }) => ({
  async getAllStudents(ctx) {
    try {
      const user = ctx.state.user; // Utilisateur actuel (professeur)

      // Construire la condition de filtrage
      const conditions = {
        destinataire: user.id,
        status: "acceptée",
        type: "COACHING",
      };

      const students = await strapi.db
        .query("api::relation.relation")
        .findMany({
          where: conditions,
          populate: {
            expediteur: {
              select: ["id", "username", "type", "email"],
              populate: {
                profil: { populate: { photoProfil: true } },
              },
            },
            conversation: true, // Make sure conversation is populated here
          },
        });

      console.log("-----------------------------------------------");
      console.log(students);
      console.log("-----------------------------------------------");

      const studentList = students.map((student) => ({
        id: student.expediteur.id,
        username: student.expediteur.username,
        email: student.expediteur.email,
        conversationId: student?.conversation?.id || null, // Safely access the conversation ID
        photoProfil:
          student.expediteur.profil?.photoProfil?.url || "default-avatar-url",
      }));

      return ctx.send({ students: studentList });
    } catch (error) {
      console.error("Error fetching students:", error);
      ctx.throw(
        500,
        "Une erreur est survenue lors de la récupération des étudiants."
      );
    }
  },
});
