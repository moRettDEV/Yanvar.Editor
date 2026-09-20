function aiFieldValue(raw) {
  var v = String(raw == null ? "" : raw).trim();
  if (!v || v === "unknown") return null;
  if (v.charAt(0) === "[") {
    try { return JSON.parse(v); } catch (e) { return v; }
  }
  if (/^(true|false)$/i.test(v)) return v.toLowerCase() === "true";
  if (isFinite(Number(v))) return Number(v);
  return v;
}

function aiFieldsFromLines(lines) {
  var o = {};
  var i, m;
  for (i = 0; i < lines.length; i++) {
    m = String(lines[i]).match(/^\s*(?:-\s*)?\**([a-z_]+)\**:\s*(.*)$/i);
    if (!m) continue;
    o[m[1].toLowerCase()] = aiFieldValue(m[2]);
  }
  if (o.values && !o.values_phys && Array.isArray(o.values)) o.values_phys = o.values;
  return o;
}

function parseAiBriefLine(line) {
  var m = String(line).match(/^(0x[0-9a-f]+)\s*\|\s*\d+\s*\|\s*\S+\s*\|\s*(.+)$/i);
  if (m) return { address: m[1], raw_value: aiFieldValue(m[2]) };
  m = String(line).match(/^(0x[0-9a-f]+)\s+map\s+\S+\s+(\[.*\])$/i);
  if (m) return { address: m[1], kind: "table", raw_values: aiFieldValue(m[2]) };
  return null;
}

function parseAiTxt(text) {
  var brief = [];
  String(text).split(/\r?\n/).forEach(function (line) {
    var row = parseAiBriefLine(line);
    if (row) brief.push(row);
  });
  if (brief.length) return brief;
  return String(text).split(/\n(?=Parameter:|Map:|### )/).map(function (block) {
    return aiFieldsFromLines(block.split(/\r?\n/));
  }).filter(function (o) { return o.address || o.name || o.address_int != null; });
}
