import {
  FileText,
  Presentation,
  Archive,
  File as FileGeneric,
  Image as ImageIcon,
  Video,
} from "lucide-react";

const FILE_TYPES = {
  pdf: { icon: FileText, color: "#ff6b6b", label: "PDF" },
  doc: { icon: FileText, color: "#5b9bff", label: "DOC" },
  docx: { icon: FileText, color: "#5b9bff", label: "DOCX" },
  ppt: { icon: Presentation, color: "#ff9f43", label: "PPT" },
  pptx: { icon: Presentation, color: "#ff9f43", label: "PPTX" },
  zip: { icon: Archive, color: "#a78bfa", label: "ZIP" },
  jpg: { icon: ImageIcon, color: "#5fff60", label: "JPG" },
  jpeg: { icon: ImageIcon, color: "#5fff60", label: "JPEG" },
  png: { icon: ImageIcon, color: "#5fff60", label: "PNG" },
  mp4: { icon: Video, color: "#ff6bcb", label: "MP4" },
  mov: { icon: Video, color: "#ff6bcb", label: "MOV" },
  mpeg: { icon: Video, color: "#ff6bcb", label: "MPEG" },
};

export const getFileMeta = (format) => {
  const key = (format || "").toLowerCase();
  return (
    FILE_TYPES[key] || {
      icon: FileGeneric,
      color: "rgba(180,220,180,0.5)",
      label: key ? key.toUpperCase() : "FILE",
    }
  );
};

export const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
