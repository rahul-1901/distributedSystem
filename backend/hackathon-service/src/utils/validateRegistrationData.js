import { BadRequestError } from "../errors/BadRequestError.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (registrationData, registrationForm) => {
  const allowedFields = new Set(registrationForm.map((field) => field.fieldName));

  for (const key of Object.keys(registrationData)) {
    if (!allowedFields.has(key)) {
      throw new BadRequestError(`Unexpected field: ${key}`);
    }
  }

  for (const field of registrationForm) {
    const value = registrationData[field.fieldName];

    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      throw new BadRequestError(`${field.label} is required`);
    }

    if (value === undefined || value === null || value === "") {
      continue;
    }

    switch (field.type) {
      case "email": {
        if (typeof value !== "string" || !EMAIL_RE.test(value)) {
          throw new BadRequestError(`${field.label} must be a valid email`);
        }

        break;
      }

      case "number": {
        if (typeof value !== "number" && Number.isNaN(Number(value))) {
          throw new BadRequestError(`${field.label} must be a number`);
        }

        break;
      }

      case "url": {
        if (typeof value !== "string") {
          throw new BadRequestError(`${field.label} must be a URL`);
        }

        try {
          new URL(value);
        } catch {
          throw new BadRequestError(`${field.label} must be a valid URL`);
        }

        break;
      }

      case "select": {
        if (!field.options?.includes(value)) {
          throw new BadRequestError(`${field.label} must be one of the allowed options`);
        }

        break;
      }

      case "checkbox": {
        if (typeof value !== "boolean") {
          throw new BadRequestError(`${field.label} must be true or false`);
        }

        break;
      }

      case "text":
      case "textarea":
      default: {
        if (typeof value !== "string") {
          throw new BadRequestError(`${field.label} must be text`);
        }

        break;
      }
    }
  }
};
