function el(tag, cls, text) {
  var n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}

function parseCtp(s) {
  s = String(s).trim().replace(",", ".");
  if (!s) return null;
  var n = Number(s);
  return isFinite(n) ? n : null;
}

function fmtCtp(n) {
  if (n == null || !isFinite(n)) return "";
  var a = Math.abs(n);
  var d = a >= 100 ? 0 : a >= 1 ? 1 : 3;
  return n.toFixed(d).replace(".", ",");
}

function cloneU8(u8) {
  return u8 ? new Uint8Array(u8) : null;
}
