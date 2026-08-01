// Registration fields: { fieldName, label, type, required, editable, options }
// Submission fields:    { fieldName, label, fieldType, required, editable, maxFiles, maxSizeMB }
// Normalizes both into one shape the renderer understands.

const FILE_KINDS = new Set(["DOCUMENT", "IMAGE", "VIDEO"]);
const MULTI_FILE_KINDS = new Set(["MULTI_DOCUMENT", "MULTI_IMAGE", "MULTI_VIDEO"]);

const ACCEPT_MAP = {
  DOCUMENT: ".pdf,.doc,.docx,.ppt,.pptx",
  MULTI_DOCUMENT: ".pdf,.doc,.docx,.ppt,.pptx",
  IMAGE: "image/*",
  MULTI_IMAGE: "image/*",
  VIDEO: "video/*",
  MULTI_VIDEO: "video/*",
};

export function normalizeField(field, kind) {
  if (kind === "registration") {
    const typeMap = {
      text: "text",
      email: "email",
      number: "number",
      textarea: "textarea",
      select: "select",
      checkbox: "checkbox",
      url: "url",
    };
    return {
      fieldName: field.fieldName,
      label: field.label,
      required: !!field.required,
      editable: field.editable !== false,
      inputKind: typeMap[field.type] || "text",
      options: field.options || [],
      maxFiles: 1,
      maxSizeMB: null,
      accept: null,
    };
  }

  // submission field
  const fieldType = field.fieldType;
  let inputKind = "text";
  if (fieldType === "TEXTAREA") inputKind = "textarea";
  else if (fieldType === "URL") inputKind = "url";
  else if (FILE_KINDS.has(fieldType)) inputKind = "file";
  else if (MULTI_FILE_KINDS.has(fieldType)) inputKind = "multifile";

  return {
    fieldName: field.fieldName,
    label: field.label,
    required: !!field.required,
    editable: field.editable !== false,
    inputKind,
    options: [],
    maxFiles: field.maxFiles || 1,
    maxSizeMB: field.maxSizeMB || 50,
    accept: ACCEPT_MAP[fieldType] || null,
  };
}

export function normalizeFields(fields = [], kind) {
  return fields.map((f) => normalizeField(f, kind));
}

export function buildInitialValues(normalizedFields, existing = {}) {
  const values = {};
  normalizedFields.forEach((f) => {
    if (existing[f.fieldName] !== undefined) {
      values[f.fieldName] = existing[f.fieldName];
    } else if (f.inputKind === "checkbox") {
      values[f.fieldName] = false;
    } else if (f.inputKind === "multifile") {
      values[f.fieldName] = [];
    } else {
      values[f.fieldName] = "";
    }
  });
  return values;
}

export function validateFields(normalizedFields, values) {
  const errors = {};
  normalizedFields.forEach((f) => {
    if (!f.required) return;
    const v = values[f.fieldName];
    const empty =
      v === undefined ||
      v === null ||
      v === "" ||
      (Array.isArray(v) && v.length === 0);
    if (empty) errors[f.fieldName] = `${f.label} is required`;
  });
  return errors;
}