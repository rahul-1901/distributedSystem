import axios from "axios";

export class NotificationClient {
  constructor(logger) {
    this.logger = logger;
    this.baseUrl = process.env.NOTIFICATION_SERVICE_URL;
  }

  async createNotification({
    userId,
    title,
    message,
    type = "SYSTEM",
    actionUrl = "",
    metadata = {},
  }) {
    try {
      await axios.post(
        `${this.baseUrl}/notifications/internal`,
        {
          userId,
          title,
          message,
          type,
          actionUrl,
          metadata,
        },
        {
          headers: {
            "x-service-secret": process.env.INTERNAL_SERVICE_SECRET,
          },

          timeout: 5000,
        }
      );
    } catch (error) {
      this.logger.error(
        {
          err: error,
          userId,
          title,
        },
        "Failed to create notification"
      );
    }
  }
}
