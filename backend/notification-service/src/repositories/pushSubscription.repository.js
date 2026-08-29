import PushSubscription from "../models/pushSubscription.model.js";

export class PushSubscriptionRepository {
  async upsert(userId, subscription, userAgent) {
    return PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent: userAgent || "",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  async findByUser(userId) {
    return PushSubscription.find({ userId }).lean();
  }

  async deleteByEndpoint(endpoint) {
    return PushSubscription.deleteOne({ endpoint });
  }
}
