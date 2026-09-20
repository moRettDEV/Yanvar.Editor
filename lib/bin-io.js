function u16(buf, o) {
  return buf[o] | (buf[o + 1] << 8);
}
function u32(buf, o) {
  return (buf[o] | (buf[o + 1] << 8) | (buf[o + 2] << 16) | (buf[o + 3] << 24)) >>> 0;
}
function f64(buf, o) {
  var dv = new DataView(buf.buffer, buf.byteOffset + o, 8);
  return dv.getFloat64(0, true);
}

function match4(buf, o, a, b, c, d) {
  return buf[o] === a && buf[o + 1] === b && buf[o + 2] === c && buf[o + 3] === d;
}

function skipZeros(buf, o) {
  while (o < buf.length && buf[o] === 0) o++;
  return o;
}

function readUnit(buf, o) {
  var i = skipZeros(buf, o);
  var len = buf[i];
  if (len < 1 || len > 28) return { unit: "", end: i };
  for (var j = 0; j < len; j++) {
    if (buf[i + 1 + j] < 0x20) return { unit: "", end: i };
  }
  return { unit: cp1251(buf, i + 1, len), end: i + 1 + len };
}

function readDoubles(buf, o, n) {
  var out = [];
  var end = Math.min(buf.length - 8, o + n);
  for (var i = o; i < end; i++) {
    var exp = buf[i + 7];
    if (exp < 0x3c || exp > 0x43) continue;
    var d = f64(buf, i);
    if (!isFinite(d) || d === 0) continue;
    if (Math.abs(d) < 1e-9 || Math.abs(d) > 1e6) continue;
    out.push(d);
    i += 7;
  }
  return out;
}

function is1dTableRec(buf, o) {
  return o + 0x1a4 <= buf.length && buf[o + 1] === 1 && buf[o + 2] === 0xa8 && buf[o + 3] === 1;
}

function is2dTableRec(buf, o) {
  return o + 8 <= buf.length && buf[o + 1] === 2 && (buf[o + 2] === 0xdc || buf[o + 2] === 0xe2) && buf[o + 3] === 2;
}

function axisPointGuess(link) {
  if (!link) return 0;
  if (link.kind === 1) return 32;
  if (link.kind === 2 || link.kind === 4 || link.kind === 6) return 16;
  if (link.kind === 8) return 8;
  if (link.kind === 10) return 12;
  if (link.kind === 11) return 4;
  return 0;
}

function axisLinkLabel(link) {
  if (!link) return "";
  if (link.kind === 1 || link.kind === 2) return "\u041e\u0431\u043e\u0440\u043e\u0442\u044b, \u043e\u0431/\u043c\u0438\u043d";
  if (link.kind === 6) return "\u0414\u0440\u043e\u0441\u0441\u0435\u043b\u044c, %";
  if ((link.kind === 3 || link.kind === 4) && link.addr === 0x5ef2) return "\u0414\u0430\u0432\u043b\u0435\u043d\u0438\u0435, \u043a\u041f\u0430*10";
  if ((link.kind === 3 || link.kind === 4) && link.addr === 0x6064) return "GBC, \u043c\u0433/\u0446\u0438\u043a\u043b";
  if (link.kind === 5) return "\u041c\u0430\u0441\u0441\u043e\u0432\u044b\u0439 \u0440\u0430\u0441\u0445\u043e\u0434 \u0432\u043e\u0437\u0434\u0443\u0445\u0430, \u043a\u0433/\u0447\u0430\u0441";
  if (link.kind === 8) return "\u041f\u0435\u0440\u0435\u0434\u0430\u0447\u0430";
  if (link.kind === 10) return "\u041d\u043e\u043c\u0435\u0440 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u043e\u043d\u043d\u043e\u0439 \u0437\u043e\u043d\u044b";
  if (link.kind === 11) return "\u041d\u043e\u043c\u0435\u0440 \u0446\u0438\u043b\u0438\u043d\u0434\u0440\u0430";
  return "";
}

function applyGearMap(rec) {
  if (!rec || rec.kind !== "table") return;
  if (!/\u043e\u0442 \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438/i.test(rec.name || "")) return;
  var links = rec.axisLinks || [];
  if (links.length >= 2) return;
  if (rec.mapXMin != null && rec.mapXMax != null && !links.length) {
    rec.rows = 1;
    if (!(rec.cols >= 2 && rec.cols <= 8)) rec.cols = 8;
    return;
  }
  var xL = links[0] || { kind: 2, addr: 0x613c, extra: 40 };
  rec.cols = axisPointGuess(xL) || 16;
  rec.rows = 8;
  rec.axisLinks = [xL, { kind: 8, addr: 0, extra: null }];
}

function applyDetonationLearnMap(rec) {
  if (!rec || rec.kind !== "table") return;
  if (rec.addr !== 0xf900 && !/\u043f\u0430\u043c\u044f\u0442\u044c \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u044f \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(rec.name || "")) return;
  rec.cols = 12;
  rec.rows = 1;
  rec.axisRef = { kind: 10, addr: 0, extra: null };
  rec.axisLinks = [rec.axisRef];
}

function isMafCalib(rec) {
  if (!rec) return false;
  if (rec.addr === 0xff96) return true;
  return /\u0442\u0430\u0440\u0438\u0440\u043e\u0432\u043a\u0430 \u0414\u041c\u0420\u0412/i.test(rec.name || "");
}

function applyMafCalib(rec) {
  if (!rec || rec.kind !== "table" || !isMafCalib(rec)) return;
  rec.width = 2;
  rec.cols = 256;
  rec.rows = 1;
  rec.wrap = false;
}

function readTableGeom(buf, o) {
  if (!is1dTableRec(buf, o)) return null;
  var cols = u16(buf, o + 0x152);
  if (cols < 2 || cols > 256) return null;
  var zDiv = f64(buf, o + 0x17c);
  var zMul = f64(buf, o + 0x194);
  var zOff = f64(buf, o + 0x19c);
  if (!isFinite(zDiv) || !isFinite(zMul) || zDiv === 0) return null;
  if (Math.abs(zDiv) > 1e7 || Math.abs(zMul) > 1e7) return null;
  if (!isFinite(zOff) || Math.abs(zOff) > 1e6) zOff = 0;
  var g = { cols: cols, zDiv: zDiv, zMul: zMul, zOff: zOff };
  var xMin = f64(buf, o + 0x156);
  var xMax = f64(buf, o + 0x15e);
  if (isFinite(xMin) && isFinite(xMax) && Math.abs(xMin) < 1e5 && Math.abs(xMax) < 1e5 && xMin !== xMax) {
    g.xMin = xMin;
    g.xMax = xMax;
  }
  return g;
}

function readAxisLinks(buf, o, span) {
  var out = [];
  var end = Math.min(buf.length, o + (span || 0x80));
  for (var i = o; i < end - 8; i++) {
    if (buf[i] !== 0x21) continue;
    var s = "";
    var j;
    for (j = 1; j < 24 && i + j < end; j++) {
      var b = buf[i + j];
      if (b === 0) break;
      if (b < 0x20 || b > 0x7e) {
        s = "";
        break;
      }
      s += String.fromCharCode(b);
    }
    var m = /^(\d{3})-([0-9A-Fa-f]{4})(?:-([0-9A-Fa-f]{2,4}))?/.exec(s);
    if (!m) continue;
    out.push({
      kind: parseInt(m[1], 10),
      addr: parseInt(m[2], 16),
      extra: !m[3] ? null : m[3].length === 4 ? parseInt(m[3], 16) : parseInt(m[3], 10)
    });
  }
  return out;
}

function findXorKey(buf) {
  for (var i = 0x40; i < 0x80 && i + 4 < buf.length; i++) {
    if (buf[i] === 0xb8 && buf[i + 1] === 0xfb && buf[i + 2] === 0xa6 && buf[i + 3] === 0x28) {
      return 0x28a6fbb8;
    }
  }
  return 0x28a6fbb8;
}

function decodeAddr(raw, xorKey) {
  var a = (raw ^ xorKey) >>> 0;
  if (a > 0xffff) a = raw >>> 0;
  if (a > 0xffff) a &= 0xffff;
  return a;
}
