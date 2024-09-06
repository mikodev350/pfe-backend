"use strict";

/**
 * relation router
 */

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/pending-relations",
      handler: "relation.findPendingRelation",
    },
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
    {
      method: "GET",
      path: "/relations/accepted",
      handler: "relation.findAcceptedRelations",
    },
    {
      method: "GET",
      path: "/relations/find-relation-friends",
      handler: "relation.findRelationFriends",
    },
  ],
};
