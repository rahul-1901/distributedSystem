import axios from "axios";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.BREVO_API_KEY) {
  throw new Error(
    "BREVO_API_KEY is missing."
  );
}

if (!process.env.BREVO_SENDER_EMAIL) {
  throw new Error(
    "BREVO_SENDER_EMAIL is missing."
  );
}

const templateCache = new Map();

function getTemplate(templateName) {
  if (!templateCache.has(templateName)) {
    const filePath = path.join(
      __dirname,
      "emails",
      `${templateName}.html`
    );

    if (!fs.existsSync(filePath)) {
      throw new Error(
        `Email template '${templateName}' not found.`
      );
    }

    const source = fs.readFileSync(
      filePath,
      "utf8"
    );

    const compiledTemplate =
      handlebars.compile(source);

    templateCache.set(
      templateName,
      compiledTemplate
    );
  }

  return templateCache.get(templateName);
}

function renderTemplate(templateName, data = {}) {
  const template =
    getTemplate(templateName);

  return template(data);
}

export async function sendMail({
  to,
  subject,
  templateName,
  data = {},
  replyTo,
}) {
  try {
    const html = renderTemplate(
      templateName,
      data
    );

    const payload = {
      sender: {
        name: "HackSprint",
        email:
          process.env.BREVO_SENDER_EMAIL,
      },

      to: [
        {
          email: to,
        },
      ],

      subject,

      htmlContent: html,

      replyTo: {
        email:
          replyTo ||
          process.env.BREVO_SENDER_EMAIL,
      },
    };

    const { data: response } =
      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        payload,
        {
          timeout: 10000,
          headers: {
            "api-key":
              process.env.BREVO_API_KEY,
            "Content-Type":
              "application/json",
          },
        }
      );

    console.log(
      `[EMAIL SENT] ${templateName} -> ${to}`
    );

    return response;
  } catch (error) {
    console.error(
      "[BREVO EMAIL ERROR]",
      {
        template: templateName,
        recipient: to,
        status:
          error.response?.status,
        data:
          error.response?.data,
        message:
          error.message,
      }
    );

    throw error;
  }
}