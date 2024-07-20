"use strict";

module.exports = {
  async findLessons(page, limit, query, moduleId, userId) {
    const start = (page - 1) * limit;

    const where = {
      users_permissions_user: {
        id: userId,
      },
    };

    if (moduleId) {
      where.module = moduleId;
    }

    if (query) {
      where.nom = { $contains: query };
    }

    const [lessons, total] = await Promise.all([
      strapi.db.query("api::lesson.lesson").findMany({
        where,
        offset: start,
        limit,
        // orderBy: { createdAt: "desc" },
        populate: { module: true },
      }),
      strapi.db.query("api::lesson.lesson").count({ where }),
    ]);

    const formattedLessons = lessons.map((lesson) => ({
      id: lesson.id,
      module: lesson.module ? lesson.module.id : null,
      nom: lesson.nom,
      publishedAt: lesson.publishedAt,
      updatedAt: lesson.updatedAt,
    }));

    const totalPages = Math.ceil(total / limit);

    console.log("this is total ppagess ");
    console.log(totalPages);
    return {
      data: formattedLessons,
      meta: {
        pagination: {
          page,
          pageSize: limit,
          pageCount: totalPages,
          total,
        },
      },
    };
  },
};
