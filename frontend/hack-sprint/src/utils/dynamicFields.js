// Registration fields: { fieldName, label, type, required, editable, options }
// Submission fields:    { fieldName, label, fieldType, required, editable, maxFiles, maxSizeMB }
// Normalizes both into one shape the renderer understands.

const FILE_KINDS = new Set(["DOCUMENT", "IMAGE", "VIDEO"]);
const MULTI_FILE_KINDS = new Set(["MULTI_DOCUMENT", "MULTI_IMAGE", "MULTI_VIDEO"]);

// Kept in sync with backend/media-service's ALLOWED_EXTENSIONS whitelist —
// this is just the client-side file-picker hint, the server is the real gate.
const DOCUMENT_ACCEPT = [
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".txt", ".md", ".rtf",
  ".xls", ".xlsx", ".csv", ".json",
  ".py", ".ipynb", ".js", ".jsx", ".ts", ".tsx", ".java", ".c", ".cpp", ".h",
  ".go", ".rb", ".php", ".html", ".css", ".sql",
  ".zip", ".rar", ".7z",
].join(",");

const ACCEPT_MAP = {
  DOCUMENT: DOCUMENT_ACCEPT,
  MULTI_DOCUMENT: DOCUMENT_ACCEPT,
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

  const allowedExtensions = field.allowedExtensions || [];

  return {
    fieldName: field.fieldName,
    label: field.label,
    required: !!field.required,
    editable: field.editable !== false,
    inputKind,
    options: [],
    maxFiles: field.maxFiles || 1,
    maxSizeMB: field.maxSizeMB || 50,
    accept: allowedExtensions.length
      ? allowedExtensions.map((ext) => `.${ext}`).join(",")
      : ACCEPT_MAP[fieldType] || null,
    allowedExtensions,
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