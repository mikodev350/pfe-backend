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
    console.log(subscription);

    if (!subscription) {
      return ctx.badRequest("Subscription details are required");
    }

    try {
      // Vous pouvez stocker l'abonnement dans la base de données si nécessaire
      // await strapi.query("subscription").create({ subscription });

      // Optionnel : envoyer une notification de test
      // Stocker l'abonnement dans la base de données
      await strapi.query("api::subscription.subscription").create({
        data: {
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      });
      console.log("====================================");
      console.log("Vous êtes abonné aux notifications");
      console.log("====================================");
      const payload = {
        title: "EasyLearn",
        body: "Vous êtes abonné aux notifications.",
      };
      await push.send([subscription], payload);

      ctx.send({ message: "Subscribed successfully" });
    } catch (error) {
      ctx.send({ error: "Failed to subscribe" });
    }
  },

  async notify(ctx) {
    try {
      const { endpoint, message } = ctx.request.body; // Récupérer l'endpoint depuis le frontend

      console.log(ctx.request.body);

      // Trouver l'abonnement correspondant à l'endpoint
      const subscriptionData = await strapi
        .query("api::subscription.subscription")
        .findOne({
          where: { endpoint },
        });

      if (!subscriptionData) {
        return ctx.badRequest("Subscription not found for the given endpoint");
      }

      const payload = {
        title: "EasyLearn",
        body: `${message}`,
      };

      const subscription = {
        endpoint: subscriptionData.endpoint,
        keys: {
          p256dh: subscriptionData.p256dh,
          auth: subscriptionData.auth,
        },
      };
      console.log("====================================");
      console.log("payload");

      console.log(payload);
      console.log("====================================");
      // Envoyer la notification au seul abonnement trouvé
      await push.send([subscription], payload);

      ctx.send({ message: "Subscribed successfully" });
    } catch (error) {
      console.error("Error sending notification:", error);
      ctx.send({ error: "Failed to send notification" });
    }
  },
};

// Public Key:
// BHzzIlXlO1atGV5DucjYMeWz5bNrnsiYyEWdsL17zLzSenrZelA0OQmm4xSYF9WARk9wJ9S0_SW2RV_4dJERwBM

// Private Key:
// z7DHpCBgap1NBSGzednQ2WLWExMWkIqHIJ7lPYZtXss
