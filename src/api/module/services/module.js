// services/module.js

module.exports = {
  async findModules(page, limit, query, parcour, userId) {
    const start = (page - 1) * limit;

    const where = {
      users_permissions_user: {
        id: userId,
      },
    };

    if (parcour) {
      where.parcour = parcour;
    }

    if (query) {
      where.nom = { $contains: query };
    }

    const [modules, total] = await Promise.all([
      strapi.db.query("api::module.module").findMany({
        where,
        offset: start,
        limit,
        // orderBy: { createdAt: "desc" },
        populate: { lessons: true, parcour: true },
      }),
      strapi.db.query("api::module.module").count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: modules,
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
