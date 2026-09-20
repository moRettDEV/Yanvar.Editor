function cteFmtNum(v) {
  if (v == null || !isFinite(Number(v))) return "";
  var n = Number(v);
  var s = String(Math.round(n * 1e7) / 1e7);
  return s.replace(".", ",");
}

function cteIdOf(item, saved) {
  if (saved && saved.cteId) return saved.cteId;
  if (typeof isMafCalib === "function" && isMafCalib(item)) return "29E22B9D";
  var a = (item && item.addr ? item.addr : 0).toString(16).toUpperCase();
  return ("00000000" + a).slice(-8);
}

function collectCteValues(item, bin, ctpText, layout) {
  var rows = (layout && layout.rows) || item.rows || 1;
  var cols = (layout && layout.cols) || item.cols || 0;
  if (!cols && ctpText) cols = ctpText.length;
  var n = rows * cols;
  var bytes = null;
  if (bin && typeof tableBytes === "function") {
    bytes = tableBytes(bin, item, typeof state !== "undefined" && state.map ? state.map.entries : [item]).bytes;
  }
  var scale = typeof tableScale === "function" ? tableScale(item) : null;
  var out = [];
  var i, v;
  for (i = 0; i < n; i++) {
    v = typeof cellNum === "function" ? cellNum(ctpText && ctpText[i]) : null;
    if (v == null && typeof isMafCalib === "function" && isMafCalib(item) && typeof MAF_CTE_KG !== "undefined") {
      v = MAF_CTE_KG[i];
    }
    if (v == null && bytes && scale) {
      var raw = typeof cellRaw === "function" ? cellRaw(bytes, i, item) : bytes[i];
      v = scale.toPhys(raw);
    }
    out.push(v);
  }
  return { rows: rows, cols: cols, values: out };
}

function serializeCte(item, pack, saved) {
  var id = cteIdOf(item, saved);
  var name = item.name || "table";
  var lines = ["[" + id + "]", "Name=" + name];
  var r, c, i, s;
  for (r = 0; r < pack.rows; r++) {
    for (c = 0; c < pack.cols; c++) {
      i = r * pack.cols + c;
      s = cteFmtNum(pack.values[i]);
      if (!s) continue;
      if (pack.rows > 1) lines.push("X" + (c + 1) + "Z" + (r + 1) + "=" + s);
      else lines.push("X" + (c + 1) + "=" + s);
    }
  }
  return lines.join("\r\n") + "\r\n";
}

function exportCte(item, bin, ctpText, layout) {
  if (!item) return;
  var hx = typeof hexYX === "function" ? hexYX(item.addr) : { addr: "" };
  var saved = typeof Corrections !== "undefined" ? Corrections.find(item.name, "0x" + hx.addr) : null;
  var pack = collectCteValues(item, bin, ctpText, layout);
  var text = serializeCte(item, pack, saved);
  var bytes = typeof encodeCp1251 === "function" ? encodeCp1251(text) : new TextEncoder().encode(text);
  var blob = new Blob([bytes], { type: "application/octet-stream" });
  var a = document.createElement("a");
  var safe = String(item.name || "table").replace(/[\\/:*?"<>|]+/g, " ").trim();
  a.href = URL.createObjectURL(blob);
  a.download = safe + ".cte";
  a.click();
  URL.revokeObjectURL(a.href);
  if (typeof setStatus === "function") setStatus("CTE \u2192 " + a.download + "  " + pack.values.length + " \u0442.");
}
