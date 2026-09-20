var CP1251_HI = (
  "\u0402\u0403\u201A\u0453\u201E\u2026\u2020\u2021" +
  "\u20AC\u2030\u0409\u2039\u040A\u040C\u040B\u040F" +
  "\u0452\u2018\u2019\u201C\u201D\u2022\u2013\u2014" +
  "\u00A0\u2122\u0459\u203A\u045A\u045C\u045B\u045F" +
  "\u00A0\u040E\u045E\u0408\u00A4\u0490\u00A6\u00A7" +
  "\u0401\u00A9\u0404\u00AB\u00AC\u00AD\u00AE\u0407" +
  "\u00B0\u00B1\u0406\u0456\u0491\u00B5\u00B6\u00B7" +
  "\u0451\u2116\u0454\u00BB\u0458\u0405\u0455\u0457"
);

function cp1251(buf, start, len) {
  var slice = buf.subarray(start, start + len);
  if (typeof TextDecoder !== "undefined") {
    try {
      return new TextDecoder("windows-1251").decode(slice).replace(/\s+/g, " ").replace(/\0/g, "").trim();
    } catch (e) {}
  }
  var t = "";
  for (var i = 0; i < slice.length; i++) {
    var b = slice[i];
    if (b === 0) break;
    if (b < 0x80) t += String.fromCharCode(b);
    else if (b >= 0xc0) t += String.fromCharCode(0x410 + (b - 0xc0));
    else t += CP1251_HI.charAt(b - 0x80);
  }
  return t.replace(/\s+/g, " ").trim();
}

function isNameChar(b) {
  return b >= 0x20 && b !== 0x7f;
}

function encodeCp1251(str) {
  var t = String(str || "");
  var out = new Uint8Array(t.length);
  var i, c, b;
  for (i = 0; i < t.length; i++) {
    c = t.charCodeAt(i);
    if (c < 0x80) b = c;
    else if (c >= 0x410 && c <= 0x44f) b = 0xc0 + (c - 0x410);
    else if (c === 0x401) b = 0xa8;
    else if (c === 0x451) b = 0xb8;
    else {
      b = 0x3f;
      for (var j = 0; j < CP1251_HI.length; j++) {
        if (CP1251_HI.charCodeAt(j) === c) { b = 0x80 + j; break; }
      }
    }
    out[i] = b;
  }
  return out;
}
