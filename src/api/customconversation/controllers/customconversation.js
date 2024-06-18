"use strict";

module.exports = {
  async addParticipant(ctx) {
    const { conversationId, userIds } = ctx.request.body;
    const user = ctx.state.user;

    // Debugging logs
    console.log("addParticipant called with:", {
      conversationId,
      userIds,
      user,
    });

    // Check for missing id or userId
    if (!conversationId || !userIds) {
      return ctx.badRequest("Conversation ID and User IDs are required");
    }

    const conversation = await strapi.db
      .query("api::conversation.conversation")
      .findOne({
        where: { id: conversationId },
        populate: { admin: true, participants: true },
      });

    // Debugging log for conversation
    console.log("Found conversation:", conversation);

    if (!conversation) return ctx.badRequest("Conversation not found");
    if (conversation.type !== "GROUP")
      return ctx.badRequest("Can only add participants to group conversations");

    if (conversation.admin.id !== user.id)
      return ctx.unauthorized("Only admin can add participants");

    const updatedParticipants = [
      ...conversation.participants.map((p) => p.id),
      ...userIds,
    ];

    await strapi.db.query("api::conversation.conversation").update({
      where: { id: conversationId },
      data: { participants: updatedParticipants },
    });

    const users = await Promise.all(
      userIds.map(async (id) => {
        const user = await strapi.entityService.findOne(
          "plugin::users-permissions.user",
          id
        );
        return user;
      })
    );

    const usernames = users.map((user) => user.username).join(", ");
    const messageContent = `${user.username} a ajouté ${usernames}`;

    await strapi.db.query("api::message.message").create({
      data: {
        contenu: messageContent,
        expediteur: ctx.state.user,
        conversation: conversation.id,
      },
    });

    return ctx.send({ msg: "Participants added successfully" });
  },

  async removeParticipant(ctx) {
    const { conversationId, userId } = ctx.request.body;
    const user = ctx.state.user;

    const conversation = await strapi.db
      .query("api::conversation.conversation")
      .findOne({
        where: { id: conversationId },
        populate: { admin: true, participants: true },
      });

    if (!conversation) return ctx.badRequest("Conversation not found");
    if (conversation.type !== "GROUP")
      return ctx.badRequest(
        "Can only remove participants from group conversations"
      );

    if (conversation.admin.id !== user.id)
      return ctx.unauthorized("Only admin can remove participants");

    const updatedParticipants = conversation.participants
      .map((p) => p.id)
      .filter((id) => id !== userId);

    await strapi.db.query("api::conversation.conversation").update({
      where: { id: conversationId },
      data: { participants: updatedParticipants },
    });

    const removedUser = await strapi.entityService.findOne(
      "plugin::users-permissions.user",
      userId
    );

    const messageContent = `${user.username} a retiré ${removedUser.username}`;

    await strapi.db.query("api::message.message").create({
      data: {
        contenu: messageContent,
        expediteur: ctx.state.user,
        conversation: conversation.id,
      },
    });

    return ctx.send({ msg: "Participant removed successfully" });
  },
};
