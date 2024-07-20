"use strict";

module.exports = {
  async findPathways(page, limit, search, userId) {
    const start = (page - 1) * limit;
    const where = {
      users_permissions_user: {
        id: userId,
      },
    };

    if (search) {
      where.nom = { $contains: search };
    }

    const [parcours, totalParcours] = await Promise.all([
      strapi.db.query("api::parcour.parcour").findMany({
        where,
        start,
        limit,
        populate: {
          modules: {
            populate: {
              lessons: true,
            },
          },
        },
      }),
      strapi.db.query("api::parcour.parcour").count({ where }),
    ]);

    const totalPages = Math.ceil(totalParcours / limit);

    return {
      data: parcours,
      meta: {
        pagination: {
          page,
          pageSize: limit,
          pageCount: totalPages,
          total: totalParcours,
        },
      },
    };
  },
};
