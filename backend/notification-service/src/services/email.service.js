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
      templateName: "verify",
      data: {
        name: user.name,
        email: user.email,
        verifyUrl: `${env.BACKEND_URL}/api/auth/verify-email?token=${token}`,
      },
    });
  }

  async sendWelcomeEmail(user) {
    return this.sendMail({
      to: user.email,
      subject: "Welcome to HackSprint 🚀",
      templateName: "userWelcome",
      data: {
        name: user.name,
        email: user.email
      },
    });
  }

  async sendResetPasswordEmail(user, token) {
    return this.sendMail({
      to: user.email,
      subject: "Reset Password",
      templateName: "resetPassword",
      data: {
        name: user.name,
        email: user.email,
        resetUrl: `${env.FRONTEND_URL}/account/reset-password?token=${token}`,
      },
    });
  }

  async sendPasswordResetSuccessEmail(user) {
    return this.sendMail({
      to: user.email,
      subject: "Password Changed Successfully",
      templateName: "resetPasswordSuccess",
      data: {
        name: user.name,
        email: user.email
      },
    });
  }

  async sendAdminWelcomeEmail(user) {
    return this.sendMail({
      to: user.email,
      subject: "Welcome to HackSprint — Organizer Account Created",
      templateName: "adminWelcome",
      data: {
        name: user.name,
        email: user.email,
      },
    });
  }

  async sendHackathonApprovedEmail(user, hackathon) {
    return this.sendMail({
      to: user.email,
      subject: `${hackathon.hackathonName} has been approved`,
      templateName: "hackathonApproved",
      data: {
        name: user.name,
        hackathonName: hackathon.hackathonName,
        hackathonLink: hackathon.hackathonLink,
      },
    });
  }

  async sendHackathonRejectedEmail(user, hackathon) {
    return this.sendMail({
      to: user.email,
      subject: `${hackathon.hackathonName} was not approved`,
      templateName: "hackathonRejected",
      data: {
        name: user.name,
        hackathonName: hackathon.hackathonName,
        reason: hackathon.reason,
      },
    });
  }

  async sendRegistrationConfirmationEmail(user, hackathon) {
    return this.sendMail({
      to: user.email,
      subject: `You're registered for ${hackathon.hackathonName}`,
      templateName: "registrationConfirmation",
      data: {
        name: user.name,
        hackathonName: hackathon.hackathonName,
        hackathonLink: hackathon.hackathonLink,
      },
    });
  }

  async sendSubmissionConfirmationEmail(user, hackathon) {
    return this.sendMail({
      to: user.email,
      subject: `Submission received for ${hackathon.hackathonName}`,
      templateName: "submissionConfirmation",
      data: {
        name: user.name,
        hackathonName: hackathon.hackathonName,
        hackathonLink: hackathon.hackathonLink,
      },
    });
  }

  // Only for entities that reached the final round — not every participant.
  // Callers decide "final round" (last SUBMISSION phase for weighted-scoring
  // events, or the final bracket match for on-spot events).
  async sendResultsAnnouncementEmail(user, hackathon) {
    return this.sendMail({
      to: user.email,
      subject: `Final results are in for ${hackathon.hackathonName}`,
      templateName: "resultsAnnouncement",
      data: {
        name: user.name,
        hackathonName: hackathon.hackathonName,
        hackathonLink: hackathon.hackathonLink,
      },
    });
  }
}

export default new EmailService();
