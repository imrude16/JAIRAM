const OFFICE_MIME_TYPES = new Set([
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

const DIRECT_PREVIEW_MIME_TYPES = new Set([
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/json",
  "application/xml",
  "text/xml",
]);

const extensionToMime = {
  pdf: "application/pdf",
  txt: "text/plain",
  csv: "text/csv",
  json: "application/json",
  xml: "application/xml",
  rtf: "application/rtf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  bmp: "image/bmp",
  svg: "image/svg+xml",
};

const getExtension = (fileName = "") => {
  const cleanName = String(fileName).split("?")[0];
  const lastDot = cleanName.lastIndexOf(".");
  if (lastDot === -1) return "";
  return cleanName.slice(lastDot + 1).toLowerCase();
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const getCloudinaryDownloadUrl = (fileUrl) => {
  if (!fileUrl || !fileUrl.includes("/upload/")) return fileUrl;
  if (fileUrl.includes("/upload/fl_attachment")) return fileUrl;
  return fileUrl.replace("/upload/", "/upload/fl_attachment/");
};

export const normalizeFileMeta = (file) => {
  if (typeof file === "string") {
    return {
      fileUrl: file,
      fileName: "File",
      mimeType: "",
      fileSize: 0,
    };
  }

  return {
    fileUrl: file?.fileUrl || "",
    fileName: file?.fileName || "File",
    mimeType: file?.mimeType || "",
    fileSize: file?.fileSize || 0,
  };
};

export const getResolvedMimeType = (file) => {
  const meta = normalizeFileMeta(file);
  const normalizedMimeType = meta.mimeType ? meta.mimeType.toLowerCase() : "";
  if (
    normalizedMimeType &&
    normalizedMimeType !== "application/octet-stream" &&
    normalizedMimeType !== "binary/octet-stream"
  ) {
    return normalizedMimeType;
  }
  const ext = getExtension(meta.fileName || meta.fileUrl);
  return extensionToMime[ext] || normalizedMimeType;
};

const isDirectPreviewMimeType = (mimeType) =>
  mimeType.startsWith("image/") ||
  mimeType.startsWith("video/") ||
  mimeType.startsWith("audio/") ||
  DIRECT_PREVIEW_MIME_TYPES.has(mimeType);

const isOfficeMimeType = (mimeType) => OFFICE_MIME_TYPES.has(mimeType);

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) {
    newWindow.opener = null;
  }
  return true;
};

const buildFallbackHtml = ({ fileUrl, fileName, mimeType, fileSize }) => {
  const downloadUrl = getCloudinaryDownloadUrl(fileUrl);
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(fileName)} - File Preview</title>
    </head>
    <body style="margin:0;padding:32px;font-family:Arial,sans-serif;background:linear-gradient(160deg,#eef4fb 0%,#f7f9fc 45%,#e8f6fb 100%);color:#0f172a;">
      <div style="max-width:760px;margin:0 auto;background:#fff;border:1px solid #d9e3ef;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(14,30,62,0.12);">
        <div style="padding:30px 32px;background:linear-gradient(135deg,#173f77 0%,#1f5aa6 55%,#5e8ed0 100%);color:#fff;">
          <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.78);font-weight:700;">JAIRAM File Preview</div>
          <h1 style="margin:14px 0 10px 0;font-size:28px;line-height:1.2;">${escapeHtml(fileName)}</h1>
          <p style="margin:0;color:rgba(255,255,255,0.88);font-size:14px;line-height:1.6;">This file type may not support direct in-browser preview. Use one of the options below.</p>
        </div>
        <div style="padding:32px;">
          <div style="margin:0 0 24px 0;padding:20px 22px;border-radius:14px;border:1px solid #dbe4ee;background:#f8fafc;">
            <table role="presentation" style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:10px 0;width:38%;color:#5b6475;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid #eef2f7;">File Name</td><td style="padding:10px 0;color:#162033;font-size:14px;border-bottom:1px solid #eef2f7;">${escapeHtml(fileName)}</td></tr>
              <tr><td style="padding:10px 0;width:38%;color:#5b6475;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;border-bottom:1px solid #eef2f7;">File Type</td><td style="padding:10px 0;color:#162033;font-size:14px;border-bottom:1px solid #eef2f7;">${escapeHtml(mimeType || "Unknown")}</td></tr>
              <tr><td style="padding:10px 0;width:38%;color:#5b6475;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;">File Size</td><td style="padding:10px 0;color:#162033;font-size:14px;">${fileSize ? `${Math.max(1, Math.round(fileSize / 1024))} KB` : "Unknown"}</td></tr>
            </table>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">
            <a href="${escapeHtml(fileUrl)}" target="_blank" rel="noreferrer" style="display:inline-block;padding:14px 22px;border-radius:10px;background:linear-gradient(135deg,#1f4f96 0%,#14396e 100%);color:#fff;text-decoration:none;font-size:14px;font-weight:700;">Open Original File</a>
            <a href="${escapeHtml(downloadUrl)}" download="${escapeHtml(fileName)}" style="display:inline-block;padding:14px 22px;border-radius:10px;background:#fff;border:1px solid #c8d5e4;color:#0f3460;text-decoration:none;font-size:14px;font-weight:700;">Download File</a>
          </div>
          <p style="margin:22px 0 0 0;color:#667085;font-size:13px;line-height:1.7;text-align:center;">If your browser cannot preview this file type directly, opening or downloading it will let you inspect it in the appropriate application.</p>
        </div>
      </div>
    </body>
  </html>
`;
};

const openFallbackPreviewPage = (file) => {
  const meta = normalizeFileMeta(file);
  const blob = new Blob([buildFallbackHtml(meta)], { type: "text/html" });
  const blobUrl = URL.createObjectURL(blob);
  openInNewTab(blobUrl);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
};

export const openFilePreview = (file) => {
  const meta = normalizeFileMeta(file);
  if (!meta.fileUrl) return false;

  const mimeType = getResolvedMimeType(meta);

  if (isDirectPreviewMimeType(mimeType)) {
    openInNewTab(meta.fileUrl);
    return true;
  }

  if (isOfficeMimeType(mimeType)) {
    const officeViewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(meta.fileUrl)}`;
    openInNewTab(officeViewerUrl);
    return true;
  }

  openFallbackPreviewPage(meta);
  return true;
};
