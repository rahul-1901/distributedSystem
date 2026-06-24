import axios from "axios";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { fileURLToPath } from "url";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templateCache = new Map();

function getTemplate(templateName) {
  if (!templateCache.has(templateName)) {
    const filePath = path.join(
      __dirname,
      "../templates",
      `${templateName}.html`
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(`Template '${templateName}' not found`);
    }

    const source = fs.readFileSync(filePath, "utf8");

    templateCache.set(templateName, handlebars.compile(source));
  }

  return templateCache.get(templateName);
}

function renderTemplate(templateName, data = {}) {
  const template = getTemplate(templateName);

  return template(data);
}

class EmailService {
  async sendMail({ to, subject, templateName, data = {}, replyTo }) {
    try {
      const html = renderTemplate(templateName, data);

      const payload = {
        sender: {
          name: "HackSprint",
          email: env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email: to,
          },
        ],

        subject,

        htmlContent: html,

        replyTo: {
          email: replyTo || env.BREVO_SENDER_EMAIL,
        },
      };

      const response = await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        payload,
        {
          timeout: 10000,
          headers: {
            "api-key": env.BREVO_API_KEY,
            "Content-Type": "application/json",
          },
        }
      );

      logger.info(
        {
          to,
          templateName,
          messageId: response.data?.messageId,
        },
        "Email sent"
      );

      return response.data;
    } catch (error) {
      logger.error(
        {
          to,
          templateName,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        },
        "Brevo email failed"
      );

      throw error;
    }
  }

  async sendVerificationEmail(user, token) {
    return this.sendMail({
      to: user.email,
      subject: "Verify your HackSprint account",
      templateName: "verification",
      data: {
        name: user.name,
        verificationUrl: `${env.FRONTEND_URL}/verify-email/${token}`,
      },
    });
  }

  async sendWelcomeEmail(user) {
    return this.sendMail({
      to: user.email,
      subject: "Welcome to HackSprint 🚀",
      templateName: "welcome",
      data: {
        name: user.name,
      },
    });
  }

  async sendResetPasswordEmail(user, token) {
    return this.sendMail({
      to: user.email,
      subject: "Reset Password",
      templateName: "reset-password",
      data: {
        name: user.name,
        resetUrl: `${env.FRONTEND_URL}/reset-password/${token}`,
      },
    });
  }

  async sendPasswordResetSuccessEmail(user) {
    return this.sendMail({
      to: user.email,
      subject: "Password Changed Successfully",
      templateName: "password-reset-success",
      data: {
        name: user.name,
      },
    });
  }
}

export default new EmailService();
