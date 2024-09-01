const PushNotifications = require("node-pushnotifications");

const settings = {
  web: {
    vapidDetails: {
      subject: "mailto:your-email@example.com",
      publicKey:
        "BHzzIlXlO1atGV5DucjYMeWz5bNrnsiYyEWdsL17zLzSenrZelA0OQmm4xSYF9WARk9wJ9S0_SW2RV_4dJERwBM",
      privateKey: "z7DHpCBgap1NBSGzednQ2WLWExMWkIqHIJ7lPYZtXss",
    },
  },
};

const push = new PushNotifications(settings);

module.exports = {
  async subscribePost(ctx) {
    const subscription = {
      endpoint: ctx.request.body.endpoint,
      keys: {
        p256dh: ctx.request.body.keys.p256dh,
        auth: ctx.request.body.keys.auth,
      },
    };

    if (!subscription) {
      return ctx.badRequest("Subscription details are required");
    }

    try {
      // Vous pouvez stocker l'abonnement dans la base de données si nécessaire
      // await strapi.query("subscription").create({ subscription });

      // Optionnel : envoyer une notification de test
      console.log("====================================");
      console.log("Vous êtes abonné aux notifications");
      console.log("====================================");
      const payload = {
        title: "Bienvenue!",
        body: "Vous êtes abonné aux notifications.",
      };
      await push.send([subscription], payload);

      ctx.send({ message: "Subscribed successfully" });
    } catch (error) {
      ctx.send({ error: "Failed to subscribe" });
    }
  },
};

// Public Key:
// BHzzIlXlO1atGV5DucjYMeWz5bNrnsiYyEWdsL17zLzSenrZelA0OQmm4xSYF9WARk9wJ9S0_SW2RV_4dJERwBM

// Private Key:
// z7DHpCBgap1NBSGzednQ2WLWExMWkIqHIJ7lPYZtXss
