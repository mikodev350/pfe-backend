module.exports = {
  findSectionById: async (sectionId, name) => {
    const section = await strapi.db.query("api::section.section").findOne({
      // populate: ["users_permissions_user", "exams"],
      where: {
        id: sectionId,
        name: name,
      },
    });

    return section;
  },
};
