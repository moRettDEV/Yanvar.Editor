function bytesToAiText(bytes) {
  if (typeof bytes === "string") return bytes;
  var u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  return new TextDecoder("utf-8").decode(u8).replace(/^\uFEFF/, "");
}

function parseAiImport(bytes, name) {
  var text = bytesToAiText(bytes).trim();
  if (!text) throw new Error("пустой файл");
  var ext = String(name || "").toLowerCase();
  if (text.charAt(0) === "{" || text.charAt(0) === "[" || /\.json$/.test(ext)) {
    return parseAiJson(text);
  }
  return parseAiTxt(text);
}
