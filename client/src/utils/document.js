const createPdfBlobUrl = (documentUrl) => {
  const base64 = documentUrl.split(",")[1] || "";
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
};

export const openPdfDocument = (documentUrl, fileName = "document.pdf") => {
  if (!documentUrl) return;

  if (!documentUrl.startsWith("data:application/pdf;base64,")) {
    window.open(documentUrl, "_blank", "noopener,noreferrer");
    return;
  }

  const popup = window.open("", "_blank", "noopener,noreferrer");
  const blobUrl = createPdfBlobUrl(documentUrl);

  if (popup) {
    popup.location.href = blobUrl;
    popup.document.title = fileName;
  } else {
    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.download = fileName;
    anchor.click();
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 60000);
};