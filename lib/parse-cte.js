function parseCteNum(s) {
  s = String(s || "").trim().replace(",", ".");
  var n = Number(s);
  return isFinite(n) ? n : null;
}

function parseCteText(text) {
  text = String(text || "").replace(/^\uFEFF/, "");
  var out = { id: "", name: "", values: [], rows: 1, cols: 0 };
  var m = /\[([0-9A-Fa-f]+)\]/.exec(text);
  if (m) out.id = m[1];
  m = /^Name=(.*)$/m.exec(text);
  if (m) out.name = m[1].replace(/\s+$/, "").trim();
  var grid = [];
  var maxX = 0;
  var maxZ = 0;
  var re = /^X(\d+)(?:Z(\d+))?=([^\r\n]+)/gm;
  var hit;
  while ((hit = re.exec(text))) {
    var x = parseInt(hit[1], 10);
    var z = hit[2] ? parseInt(hit[2], 10) : 1;
    var v = parseCteNum(hit[3]);
    if (x < 1 || z < 1 || v == null) continue;
    if (!grid[z]) grid[z] = [];
    grid[z][x] = v;
    if (x > maxX) maxX = x;
    if (z > maxZ) maxZ = z;
  }
  var r, c, i;
  out.rows = maxZ || 1;
  out.cols = maxX;
  out.values = [];
  for (r = 1; r <= out.rows; r++) {
    for (c = 1; c <= out.cols; c++) {
      out.values.push(grid[r] && grid[r][c] != null ? grid[r][c] : null);
    }
  }
  out.count = 0;
  for (i = 0; i < out.values.length; i++) {
    if (out.values[i] != null) out.count++;
  }
  return out;
}

function parseCte(buf) {
  if (!buf) return null;
  var u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  var text = "";
  if (typeof TextDecoder !== "undefined") {
    try { text = new TextDecoder("windows-1251").decode(u8); }
    catch (e) {
      try { text = new TextDecoder("utf-8").decode(u8); } catch (e2) { text = ""; }
    }
  }
  if (!text && typeof cp1251 === "function") text = cp1251(u8, 0, u8.length);
  return parseCteText(text);
}
