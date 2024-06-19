"use strict";

/**
 * notification controller
 */

module.exports = ({ strapi }) => ({
  async find(ctx) {
    const userId = ctx.state.user.id;
    const notifications = await strapi.db
      .query("api::notification.notification")
      .findMany({
        orderBy: {
          createdAt: "desc",
        },
        where: {
          destinataire: ctx.state.user,
        },
        populate: {
          expediteur: {
            select: ["username", "id"],
          },
        },
      });

    const total_count_Not_seen = await strapi.db
      .query("api::notification.notification")
      .count({
        where: {
          destinataire: ctx.state.user,
          seen_status: false,
        },
      });
    // const total_new_messages = await strapi.db
    //   .query("api::user-message-read-status.user-message-read-status")
    //   .count({
    //     distinct: ["course_hub"],
    //     where: {
    //       seen_status: false,

    //       user: {
    //         id: userId,
    //       },
    //     },
    //   });
    return {
      notifications,
      //   total_new_messages,
      total_count_Not_seen,
    };
  },
});
