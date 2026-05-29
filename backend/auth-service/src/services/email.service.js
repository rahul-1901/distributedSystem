import { sendMail } from "../utils/brevoEmail.js";
import { env } from "../config/env.js";

export class EmailService {
  async sendVerificationEmail(user, token) {
    const verifyUrl = `${env.FRONTEND_URL}/verify?token=${token}`;

    await sendMail({
      to: user.email,
      subject: "Verify your HackSprint account",
      templateName: "verify",
      data: {
        name: user.name,
        email: user.email,
        verifyUrl,
      },
    });
  }

  async sendWelcomeEmail(user) {
    await sendMail({
      to: user.email,
      subject: "Welcome to HackSprint 🎉",
      templateName: "userWelcome",
      data: {
        name: user.name,
        email: user.email,
      },
    });
  }

  async sendResetPasswordEmail(user, token) {
    const resetUrl = `${env.FRONTEND_URL}/account/reset-password?token=${token}`;

    await sendMail({
      to: user.email,
      subject: "Reset your password - HackSprint",
      templateName: "resetPassword",
      data: {
        name: user.name,
        email: user.email,
        resetUrl,
      },
    });
  }

  async sendPasswordResetSuccessEmail(user) {
    await sendMail({
      to: user.email,
      subject: "Your password has been reset - HackSprint",
      templateName: "resetPasswordSuccess",
      data: {
        name: user.name,
        email: user.email,
      },
    });
  }
}

export default new EmailService();