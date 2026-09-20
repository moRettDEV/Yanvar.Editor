function walkExportRows(nodes, folder, out) {
  out = out || [];
  var list = nodes || [];
  var i, n;
  for (i = 0; i < list.length; i++) {
    n = list[i];
    if (n.kind === "folder") walkExportRows(n.children, n.name || folder || "", out);
    else if (n.kind !== "label") out.push({ item: n, folder: folder || "" });
  }
  return out;
}

function parseAiHex(s) {
  var t = String(s || "").trim().replace(/^0x/i, "");
  if (!t) return null;
  var n = parseInt(t, 16);
  return isFinite(n) ? n : null;
}
