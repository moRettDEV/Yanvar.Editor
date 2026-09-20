function formatAiExport(payload, fileFmt) {
  if (fileFmt === "md") return formatAiMarkdown(payload);
  if (fileFmt === "txt") return formatAiTxt(payload);
  return formatAiJson(payload);
}

function suggestAiExportName(fileFmt) {
  var base = String(state.filesName || "firmware").replace(/\.bin$/i, "");
  var ext = fileFmt === "md" ? "md" : fileFmt === "txt" ? "txt" : "json";
  return base + "-ai." + ext;
}

function downloadAiText(name, text) {
  var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
