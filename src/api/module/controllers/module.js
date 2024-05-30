"use strict";

/**
 * module controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::module.module", ({ strapi }) => ({
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      console.log("Updating module id:", id, "with data:", data);

      const updatedModule = await strapi.entityService.update(
        "api::module.module",
        id,
        {
          data,
        }
      );

      ctx.send({
        message: "Module updated successfully",
        data: updatedModule,
      });
    } catch (error) {
      console.error("Error updating module:", error);
      ctx.throw(500, "An error occurred while updating the module");
    }
  },

  async find(ctx) {
    try {
      const { _page = 1, _limit = 5, _q = "", parcour } = ctx.query;
      const page = parseInt(_page, 10);
      const limit = parseInt(_limit, 10);
      const start = (page - 1) * limit;

      const where = parcour ? { parcour } : {};
      if (_q) {
        where.nom = { $contains: _q };
      }

      const [modules, total] = await Promise.all([
        strapi.query("api::module.module").findMany({
          where,
          offset: start,
          limit,
        }),
        strapi.query("api::module.module").count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      ctx.send({
        data: modules,
        meta: {
          pagination: {
            page,
            pageSize: limit,
            pageCount: totalPages,
            total,
          },
        },
      });
    } catch (error) {
      console.error("Error retrieving modules:", error);
      ctx.throw(500, "An error occurred while retrieving the modules");
    }
  },
}));
