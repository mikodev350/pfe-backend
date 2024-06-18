module.exports = {
  routes: [
    {
      method: "POST",
      path: "/add-participant",
      handler: "customconversation.addParticipant",
    },
    {
      method: "POST",
      path: "/remove-participant",
      handler: "customconversation.removeParticipant",
    },
  ],
};
