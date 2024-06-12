"use strict";

/**
 * relation router
 */

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/relation",
      handler: "relation.createFriendsRelation",
    },
    {
      method: "PUT",
      path: "/relation",
      handler: "relation.acceptRelation",
    },
    {
      method: "DELETE",
      path: "/relation/:id",
      handler: "relation.declineRelation",
    },
  ],
};
