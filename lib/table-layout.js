var Z_PRESETS = {
  raw: { id: "raw", label: "\u043a\u0430\u043a \u0432 bin (raw)", toPhys: function (r) { return r; }, digits: 0, auto: true, yLabel: "raw" },
  k256: { id: "k256", label: "raw / 256  \u043a\u043e\u044d\u0444\u0444.", toPhys: function (r) { return r / 256; }, digits: 2, yMin: 0, yMax: 1, yStep: 0.1, yLabel: "\u043a\u043e\u044d\u0444\u0444." },
  k256s: { id: "k256s", label: "raw / 256  \u0448\u0430\u0433 \u041a\u0420", toPhys: function (r) { return r / 256; }, digits: 3, yMin: 0, yMax: 0.2, yStep: 0.02, yLabel: "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442" },
  k128: { id: "k128", label: "raw / 128  \u043a\u043e\u044d\u0444\u0444.", toPhys: function (r) { return r / 128; }, digits: 2, yMin: 0, yMax: 1.9, yStep: 0.1, yLabel: "\u043a\u043e\u044d\u0444\u0444." },
  k16: { id: "k16", label: "raw / 16  \u043a\u043e\u044d\u0444\u0444.", toPhys: function (r) { return r / 16; }, digits: 2, yMin: 0, yMax: 4, yStep: 0.25, yLabel: "\u043a\u043e\u044d\u0444\u0444." },
  alf: { id: "alf", label: "raw * 14.7 / 128  ALF", toPhys: function (r) { return (r * 14.7) / 128; }, digits: 2, yMin: 10, yMax: 20, yLabel: "ALF" },
  alf256: { id: "alf256", label: "14.7 * (raw + 128) / 256  ALF", toPhys: function (r) { return (14.7 * (r + 128)) / 256; }, digits: 1, yMin: 7.5, yMax: 21.5, yStep: 0.5, yLabel: "ALF" },
  alfI8: { id: "alfI8", label: "signed * 14.7 / 256  \u0394ALF", toPhys: function (r) { return ((r > 127 ? r - 256 : r) * 14.7) / 256; }, digits: 1, yMin: -10, yMax: 10, yStep: 1, yLabel: "ALF" },
  uoz: { id: "uoz", label: "signed / 2  \u0423\u041e\u0417", toPhys: function (r) { return (r > 127 ? r - 256 : r) / 2; }, digits: 1, auto: true, yLabel: "\u0433\u0440.\u043f.\u043a.\u0432." },
  uoz20: { id: "uoz20", label: "signed / 2  clip \u00b120", toPhys: function (r) {
    var v = (r > 127 ? r - 256 : r) / 2;
    if (v > 20) return 20;
    if (v < -20) return -20;
    return v;
  }, digits: 1, yMin: -20, yMax: 20, yStep: 5, yLabel: "\u0433\u0440.\u043f.\u043a.\u0432." },
  temp: { id: "temp", label: "raw * 5 - 40  \u00b0C", toPhys: function (r) { return r * 5 - 40; }, digits: 0, yLabel: "\u0433\u0440\u0430\u0434.C" },
  half: { id: "half", label: "raw * 0.5", toPhys: function (r) { return r * 0.5; }, digits: 1, auto: true, yLabel: "" },
  gtc: { id: "gtc", label: "raw / 3.6  \u043c\u0433/\u0446\u0438\u043a\u043b/\u0441\u0435\u043a", toPhys: function (r) { return r / 3.6; }, digits: 1, yMin: 0, yMax: 70, yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b/\u0441\u0435\u043a" },
  gbc: { id: "gbc", label: "raw / 48  \u043c\u0433/\u0446\u0438\u043a\u043b", toPhys: function (r) { return r / 48; }, digits: 1, auto: true, yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b" },
  gbc1: { id: "gbc1", label: "raw  \u043c\u0433/\u0446\u0438\u043a\u043b", toPhys: function (r) { return r; }, digits: 0, auto: true, yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b" },
  gbc48: { id: "gbc48", label: "raw * 256 / 48  \u043c\u0433/\u0446\u0438\u043a\u043b", toPhys: function (r) { return (r * 256) / 48; }, digits: 0, yMin: 0, yMax: 1200, yStep: 100, yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b" },
  gbc96: { id: "gbc96", label: "raw * 256 / 96  \u043c\u0433/\u0446\u0438\u043a\u043b", toPhys: function (r) { return (r * 256) / 96; }, digits: 0, yMin: 0, yMax: 600, yStep: 100, yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b" },
  gbc180: { id: "gbc180", label: "raw * 256 / 180  \u043c\u0433/\u0446\u0438\u043a\u043b", toPhys: function (r) { return (r * 256) / 180; }, digits: 0, yMin: 0, yMax: 360, yStep: 20, yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b" },
  gbc90: { id: "gbc90", label: "raw * 256 / 90  \u043c\u0433/\u0446\u0438\u043a\u043b", toPhys: function (r) { return (r * 256) / 90; }, digits: 0, yMin: 0, yMax: 700, yStep: 50, yLabel: "\u043c\u0433/\u0446\u0438\u043a\u043b" },
  sec: { id: "sec", label: "raw  \u0441\u0435\u043a", toPhys: function (r) { return r; }, digits: 0, auto: true, yLabel: "\u0441\u0435\u043a" },
  sec02: { id: "sec02", label: "raw * 0.02  \u0441\u0435\u043a", toPhys: function (r) { return r * 0.02; }, digits: 2, auto: true, yLabel: "\u0441\u0435\u043a" },
  sec2: { id: "sec2", label: "raw * 0.02  \u0441\u0435\u043a 0\u20262", toPhys: function (r) { return r * 0.02; }, digits: 2, yMin: 0, yMax: 2, yStep: 0.2, yLabel: "\u0412\u0440\u0435\u043c\u044f, \u0441\u0435\u043a." },
  cycle: { id: "cycle", label: "raw  \u0446\u0438\u043a\u043b", toPhys: function (r) { return r; }, digits: 0, auto: true, yLabel: "\u0446\u0438\u043a\u043b" },
  cycle4: { id: "cycle4", label: "raw / 4  \u0446\u0438\u043a\u043b", toPhys: function (r) { return r / 4; }, digits: 0, auto: true, yLabel: "\u0446\u0438\u043a\u043b" },
  rpm10: { id: "rpm10", label: "raw * 10  \u043e\u0431/\u043c\u0438\u043d", toPhys: function (r) { return r * 10; }, digits: 0, yMin: 0, yMax: 2500, yStep: 100, yLabel: "\u041e\u0431\u043e\u0440\u043e\u0442\u044b, \u043e\u0431/\u043c\u0438\u043d" },
  rpm30: { id: "rpm30", label: "raw * 30  \u043e\u0431/\u043c\u0438\u043d", toPhys: function (r) { return r * 30; }, digits: 0, yLabel: "\u043e\u0431/\u043c\u0438\u043d" },
  rpm40: { id: "rpm40", label: "raw * 40  \u043e\u0431/\u043c\u0438\u043d", toPhys: function (r) { return r * 40; }, digits: 0, yMin: 2000, yMax: 10000, yStep: 1000, yLabel: "\u041e\u0431\u043e\u0440\u043e\u0442\u044b, \u043e\u0431/\u043c\u0438\u043d" },
  pct: { id: "pct", label: "raw * 100 / 255  %", toPhys: function (r) { return (r * 100) / 255; }, digits: 1, yLabel: "%" },
  pct255: { id: "pct255", label: "raw / 2.55  %", toPhys: function (r) { return r / 2.55; }, digits: 1, yLabel: "%" },
  pct256: { id: "pct256", label: "raw * 100 / 256  %", toPhys: function (r) { return (r * 100) / 256; }, digits: 2, yMin: 0, yMax: 100, yStep: 10, yLabel: "%" },
  k64: { id: "k64", label: "raw / 64  \u043a\u043e\u044d\u0444\u0444.", toPhys: function (r) { return r / 64; }, digits: 2, yMin: 0, yMax: 4, yStep: 0.5, yLabel: "\u043a\u043e\u044d\u0444\u0444." },
  deg120: { id: "deg120", label: "raw  \u0433\u0440\u0434", toPhys: function (r) { return r; }, digits: 0, yMin: 0, yMax: 120, yStep: 10, yLabel: "\u0433\u0440\u0434" },
  steps: { id: "steps", label: "raw  \u0448\u0430\u0433\u043e\u0432", toPhys: function (r) { return r; }, digits: 0, yMin: 0, yMax: 160, yStep: 10, yLabel: "\u0448\u0430\u0433\u043e\u0432" },
  phase6: { id: "phase6", label: "raw * 6  \u0433\u0440.\u043f.\u043a.\u0432.", toPhys: function (r) { return r * 6; }, digits: 0, yMin: 0, yMax: 700, yStep: 100, yLabel: "\u0433\u0440.\u043f.\u043a.\u0432." },
  zone3: { id: "zone3", label: "raw & 3  \u0437\u043e\u043d\u0430", toPhys: function (r) { return r & 3; }, digits: 0, yMin: 0, yMax: 3, yStep: 1, yLabel: "\u0417\u043e\u043d\u0430" },
  zone1: { id: "zone1", label: "raw & 1  \u0437\u043e\u043d\u0430", toPhys: function (r) { return r & 1; }, digits: 0, yMin: 0, yMax: 1, yStep: 1, yLabel: "\u0417\u043e\u043d\u0430" },
  volt5: { id: "volt5", label: "raw * 5 / 256  \u0412", toPhys: function (r) { return (r * 5) / 256; }, digits: 2, yMin: 0, yMax: 4.5, yStep: 0.5, yLabel: "\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435, \u0412" },
  kOff128: { id: "kOff128", label: "(raw + 128) / 256  \u043a\u043e\u044d\u0444\u0444.", toPhys: function (r) { return (r + 128) / 256; }, digits: 2, yMin: 0.5, yMax: 1.4, yStep: 0.1, yLabel: "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442 \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u0438" },
  kgh10: { id: "kgh10", label: "(raw - 1000) / 10  \u043a\u0433/\u0447\u0430\u0441", toPhys: function (r) { return (r - 1000) / 10; }, digits: 1, yMin: -100, yMax: 1000, yStep: 100, yLabel: "\u0420\u0430\u0441\u0445\u043e\u0434 \u0432\u043e\u0437\u0434\u0443\u0445\u0430, \u043a\u0433/\u0447\u0430\u0441" }
};

var AXIS_PRESETS = {
  idx: { id: "idx", label: "\u043d\u043e\u043c\u0435\u0440 \u0442\u043e\u0447\u043a\u0438", min: 0, max: null, digits: 0, unit: "" },
  temp: { id: "temp", label: "\u0422\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440\u0430, \u0433\u0440\u0430\u0434.C", min: -40, max: 150, digits: 0, unit: "\u0433\u0440\u0430\u0434.C", step: 5 },
  rpm: { id: "rpm", label: "\u041e\u0431\u043e\u0440\u043e\u0442\u044b, \u043e\u0431/\u043c\u0438\u043d", min: 0, max: 6400, digits: 0, unit: "\u043e\u0431/\u043c\u0438\u043d" },
  thr: { id: "thr", label: "\u0414\u0440\u043e\u0441\u0441\u0435\u043b\u044c, %", min: 0, max: 100, digits: 0, unit: "%" },
  volt: { id: "volt", label: "\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435, \u0412", min: 0, max: 5, digits: 2, unit: "\u0412" },
  kpa: { id: "kpa", label: "\u0414\u0430\u0432\u043b\u0435\u043d\u0438\u0435, \u043a\u041f\u0430", min: 20, max: 100, digits: 0, unit: "\u043a\u041f\u0430" },
  sec: { id: "sec", label: "\u0412\u0440\u0435\u043c\u044f, \u0441\u0435\u043a", min: 0, max: 10, digits: 2, unit: "\u0441\u0435\u043a" },
  cycle: { id: "cycle", label: "\u0426\u0438\u043a\u043b", min: 0, max: 255, digits: 0, unit: "\u0446\u0438\u043a\u043b" },
  gbc: { id: "gbc", label: "GBC, \u043c\u0433/\u0446\u0438\u043a\u043b", min: 0, max: 600, digits: 0, unit: "\u043c\u0433/\u0446\u0438\u043a\u043b" }
};

function defaultGrid(size) {
  return { rows: 1, cols: size };
}

function factorPairs(n) {
  var out = [];
  for (var r = 1; r <= n && r <= 64; r++) {
    if (n % r === 0 && n / r <= 64) out.push({ rows: r, cols: n / r });
  }
  return out;
}

function emptyLayout(size) {
  var g = defaultGrid(size);
  return {
    rows: g.rows, cols: g.cols, z: "auto", x: "auto", y: "auto",
    xMin: "", xMax: "", yMin: "", yMax: "",
    xName: "", xFrom: "", xTo: "", xStep: "", xCount: g.cols,
    yName: "", yFrom: "", yTo: "", yStep: "",
    zName: "", zFrom: "", zTo: "", zStep: "", zCount: ""
  };
}

function mapZLabel(item) {
  if (!item) return "";
  if (item.zUnit && item.zUnit !== item.unit) return item.zUnit;
  if (/\u0423\u041e\u0417/i.test(item.name || "")) return "\u0433\u0440.\u043f.\u043a.\u0432.";
  return "";
}

function mapZSigned(item) {
  if (!item) return false;
  if (/\u0423\u041e\u0417/i.test(item.name || "")) return true;
  var d = Number(item.zDiv);
  var m = Number(item.zMul);
  if (!isFinite(d) || d === 0) return false;
  return Math.abs(m / d - 0.5) < 1e-6 && !(item.zOff);
}

function scaleFromMap(item) {
  if (!item || item.zDiv == null || item.zMul == null) return null;
  var d = Number(item.zDiv);
  var m = Number(item.zMul);
  var o = Number(item.zOff) || 0;
  if (!isFinite(d) || !isFinite(m) || d === 0) return null;
  var k = Math.abs(m / d);
  var digits = k < 0.2 ? 2 : k < 2 ? 1 : 0;
  var signed = mapZSigned(item);
  return {
    toPhys: function (r) {
      if (signed && r > 127) r -= 256;
      return ((r - o) * m) / d;
    },
    yLabel: mapZLabel(item),
    digits: digits,
    auto: true
  };
}

function quantBreaks(bin, link, n) {
  if (!bin || !link || n < 2 || n > 256) return null;
  var step = link.extra > 0 && link.extra < 400 ? link.extra : 40;
  var qn = Math.min(256, bin.length - link.addr);
  if (link.addr < 0 || qn < n) return null;
  var zLast = (bin[link.addr + qn - 1] * n) >> 8;
  var out = [];
  var c, i, found, z;
  for (c = 0; c < n; c++) {
    found = -1;
    for (i = 0; i < qn; i++) {
      z = (bin[link.addr + i] * n) >> 8;
      if (z === c) {
        found = i;
        break;
      }
    }
    if (found < 0) out.push(0);
    else if (c === zLast) out.push((qn - 1) * step);
    else out.push(found * step);
  }
  if (out[0] === 0) {
    var last0 = 0;
    for (i = 0; i < qn && bin[link.addr + i] === 0; i++) last0 = i;
    if (last0 > 0) out[0] = last0 * step;
  }
  return out;
}

function kind4Breaks(bin, link, n) {
  if (!bin || !link || n < 2 || link.extra == null || link.extra > 0xffff) return null;
  if (link.addr >= bin.length || link.extra >= bin.length) return null;
  var out = [];
  var i;
  if (link.addr === 0x6064) {
    var lo = Math.round(bin[link.addr] / 6);
    var step = Math.round((bin[link.extra] * 7) / 48);
    if (n !== 16) step = Math.round((step * 16) / n);
    for (i = 0; i < n; i++) out.push(lo + i * step);
    return out;
  }
  if (link.addr === 0x5ef2) {
    var minRaw = bin[link.addr] | (bin[link.addr + 1] << 8);
    var range = bin[link.extra] || 1;
    var p0 = Math.round(minRaw / 6);
    var dp = Math.round(32768 / (range * 6));
    for (i = 0; i < n; i++) out.push(p0 + i * dp);
    return out;
  }
  if (link.addr + 1 >= bin.length || link.extra + 1 >= bin.length) return null;
  var w0 = bin[link.addr] | (bin[link.addr + 1] << 8);
  var w1 = bin[link.extra] | (bin[link.extra + 1] << 8);
  var a = w0;
  var b = w1;
  for (i = 0; i < n; i++) out.push(a + ((b - a) * i) / (n - 1));
  return out;
}

function thr16Breaks(bin, link) {
  var addr = link && link.addr ? link.addr : 0x7208;
  var fallback = [0, 2, 4, 6, 8, 10, 14, 18, 23, 29, 37, 46, 56, 66, 80, 100];
  if (!bin || addr < 0 || addr + 255 >= bin.length) return fallback;
  var n = 16;
  var out = [];
  var c, i, found;
  for (c = 0; c < n; c++) {
    found = -1;
    for (i = 0; i < 256; i++) {
      if (((bin[addr + i] * n) >> 8) === c) {
        found = i;
        break;
      }
    }
    out.push(found < 0 ? 0 : found);
  }
  out[n - 1] = 100;
  return out;
}

function breaksForLink(link, n, bin) {
  if (!link || n < 2) return null;
  if (link.kind === 6 && n === 16) return thr16Breaks(bin, link);
  if (link.kind === 8 && n >= 2) {
    var g = [];
    var gi;
    for (gi = 0; gi < n; gi++) g.push(gi + 1);
    return g;
  }
  if ((link.kind === 10 || link.kind === 11) && n >= 2) {
    var z = [];
    var zi;
    var z0 = link.kind === 11 ? 1 : 0;
    for (zi = 0; zi < n; zi++) z.push(z0 + zi);
    return z;
  }
  if (bin && (link.kind === 1 || link.kind === 2)) return quantBreaks(bin, link, n);
  if (bin && (link.kind === 3 || link.kind === 4)) return kind4Breaks(bin, link, n);
  return null;
}

function isWeightFuel(item) {
  if (!item) return false;
  if (item.addr === 0x8193) return true;
  return /\u0432\u0435\u0441\u043e\u0432\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u0442\u043e\u043f\u043b\u0438\u0432\u043e\u043f\u043e\u0434\u0430\u0447\u0438/i.test(item.name || "");
}

function applyWeightFuelAxis(L, item) {
  if (!L || !isWeightFuel(item)) return;
  L.z = "k256";
  L.zFrom = 0;
  L.zTo = 1;
  L.zStep = 0.1;
  L.zName = "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442 \u0432\u0435\u0441\u043e\u0432\u043e\u0439 \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u0438";
}

function isUozGear(item) {
  if (!item) return false;
  if (item.addr === 0x8fb9) return true;
  return /\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u0423\u041e\u0417 \u043e\u0442 \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438/i.test(item.name || "");
}

function applyUozGearAxis(L, item) {
  if (!L || !isUozGear(item)) return;
  L.z = "uoz20";
  L.zFrom = -20;
  L.zTo = 20;
  L.zStep = 5;
  L.zName = "\u041f\u043e\u043f\u0440\u0430\u0432\u043a\u0430 \u0423\u041e\u0417, \u0433\u0440.\u043f.\u043a.\u0432.";
}

function isDetZone(item) {
  if (!item) return false;
  return /\u0437\u043e\u043d\u0430 \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044f \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(item.name || "");
}

function applyDetZoneAxis(L, item) {
  if (!L || !isDetZone(item)) return;
  L.z = "zone3";
  L.zFrom = 0;
  L.zTo = 3;
  L.zStep = 1;
  L.zName = "\u0417\u043e\u043d\u0430";
}

function isVtecZone(item) {
  if (!item) return false;
  return /\u0437\u043e\u043d\u0430 (?:\u0432\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u044f|\u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u044f) VTEC/i.test(item.name || "");
}

function applyVtecZoneAxis(L, item) {
  if (!L || !isVtecZone(item)) return;
  L.z = "zone1";
  L.zFrom = 0;
  L.zTo = 1;
  L.zStep = 1;
  L.zName = "\u0417\u043e\u043d\u0430";
}

function isDetVolt(item) {
  if (!item) return false;
  return /\u0430\u0431\u0441\u043e\u043b\u044e\u0442\u043d\u044b\u0439 \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(item.name || "");
}

function applyDetVoltAxis(L, item) {
  if (!L || !isDetVolt(item)) return;
  L.z = "volt5";
  L.zFrom = 0;
  L.zTo = 4.5;
  L.zStep = 0.5;
  L.zName = "\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435, \u0412";
}

function isDetThrCorr(item) {
  if (!item) return false;
  return /\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u043f\u043e\u0440\u043e\u0433\u0430 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(item.name || "");
}

function applyDetThrCorrAxis(L, item) {
  if (!L || !isDetThrCorr(item)) return;
  L.z = "kOff128";
  L.zFrom = 0.5;
  L.zTo = 1.4;
  L.zStep = 0.1;
  L.zName = "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442 \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u0438";
}

function isKrStep(item) {
  if (!item) return false;
  return /\u0448\u0430\u0433 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u041a\u0420/i.test(item.name || "");
}

function applyKrStepAxis(L, item) {
  if (!L || !isKrStep(item)) return;
  L.z = "k256s";
  L.zFrom = 0;
  L.zTo = 0.2;
  L.zStep = 0.02;
  L.zName = "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442";
}

function isLeanDelay(item) {
  if (!item) return false;
  return /\u0437\u0430\u0434\u0435\u0440\u0436\u043a\u0430 \u0440\u0435\u0433\u0443\u043b\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f (Lean-Rich|Rich-Lean)/i.test(item.name || "");
}

function applyLeanDelayAxis(L, item) {
  if (!L || !isLeanDelay(item)) return;
  L.z = "sec2";
  L.zFrom = 0;
  L.zTo = 2;
  L.zStep = 0.2;
  L.zName = "\u0412\u0440\u0435\u043c\u044f, \u0441\u0435\u043a.";
}

function applyConfirmed1d(L, item) {
  if (!L || !item) return;
  var a = item.addr;
  var n = item.name || "";
  if (a === 0x6126 || /\u0442\u0430\u0440\u0438\u0440\u043e\u0432\u043a\u0430 \u0414\u0422\u0412/i.test(n)) {
    L.zFrom = -40;
    L.zTo = 200;
    L.zName = "\u0422\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440\u0430, \u0433\u0440\u0430\u0434.C";
    L.xName = "\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435 \u0410\u0426\u041f \u0414\u0422\u0412";
  }
  if (a === 0x6104 || /\u0442\u0430\u0440\u0438\u0440\u043e\u0432\u043a\u0430 \u0414\u0422\u041e\u0416/i.test(n)) {
    L.zFrom = -40;
    L.zTo = 150;
    L.zName = "\u0422\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440\u0430, \u0433\u0440\u0430\u0434.C";
    L.xName = "\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435 \u0410\u0426\u041f \u0414\u0422\u041e\u0416";
  }
  if (/\u0442\u0430\u0440\u0438\u0440\u043e\u0432\u043a\u0430 \u0414\u043e\u043f\.?\u0414\u0422/i.test(n)) {
    L.zFrom = -40;
    L.zTo = 200;
    L.zName = "\u0422\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440\u0430, \u0433\u0440\u0430\u0434.C";
  }
  if (/\u0442\u0430\u0440\u0438\u0440\u043e\u0432\u043a\u0430 \u0414\u0422\u041e\u0413/i.test(n)) {
    L.zFrom = 0;
    L.zTo = 1600;
    L.zStep = 100;
    L.zName = "\u0422\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440\u0430 \u041e\u0413";
  }
  if (a === 0x71d8 || a === 0x9912 || /\u0434\u0438\u043d\u0430\u043c\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043f\u0440\u043e\u0438\u0437\u0432\u043e\u0434\u0438\u0442\u0435\u043b\u044c\u043d\u043e\u0441\u0442\u044c \u0444\u043e\u0440\u0441\u0443\u043d\u043a\u0438/i.test(n)) {
    L.zFrom = 0;
    L.zTo = 2;
  }
  if (/\u0437\u043e\u043d\u0430 \u0440\u0435\u0433\u0443\u043b\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u043f\u043e RPM-GBC/i.test(n)) {
    L.z = "zone1";
    L.zFrom = 0;
    L.zTo = 1;
    L.zStep = 1;
    L.zName = "\u0417\u043e\u043d\u0430";
  }
  applyVtecZoneAxis(L, item);
}

function applyMafAxis(L, item) {
  if (!L || typeof isMafCalib !== "function" || !isMafCalib(item)) return;
  L.rows = 1;
  L.cols = 256;
  L.xCount = 256;
  L.z = "kgh10";
  L.zFrom = -100;
  L.zTo = 1000;
  L.zStep = 100;
  L.zName = "\u0420\u0430\u0441\u0445\u043e\u0434 \u0432\u043e\u0437\u0434\u0443\u0445\u0430, \u043a\u0433/\u0447\u0430\u0441";
  L.xName = "\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435 \u0410\u0426\u041f \u0414\u041c\u0420\u0412";
  L.xFrom = 0;
  L.xTo = 5;
  L.xStep = 5 / 255;
  L.xBreaks = [];
  var i;
  for (i = 0; i < 256; i++) L.xBreaks.push((i * 5) / 256);
}

function fillMafCteText(item, ctpText) {
  if (!ctpText || typeof isMafCalib !== "function" || !isMafCalib(item)) return ctpText;
  if (typeof MAF_CTE_KG === "undefined" || !MAF_CTE_KG || !MAF_CTE_KG.length) return ctpText;
  while (ctpText.length < 256) ctpText.push("");
  if (ctpText.length > 256) ctpText.length = 256;
  var i, n;
  for (i = 0; i < 256; i++) {
    n = cellNum(ctpText[i]);
    if ((n == null || n === -100) && MAF_CTE_KG[i] != null) ctpText[i] = String(MAF_CTE_KG[i]);
  }
  return ctpText;
}

function apply2dGeom(L, item, bin) {
  var links = item.axisLinks || [];
  if (links.length < 2) return false;
  var xL = links[0];
  var yL = links[1];
  L.cols = item.cols || (typeof axisPointGuess === "function" ? axisPointGuess(xL) : 16);
  L.rows = item.rows || (typeof axisPointGuess === "function" ? axisPointGuess(yL) : 16);
  L.xCount = L.cols;
  var xb = breaksForLink(xL, L.cols, bin);
  var yb = breaksForLink(yL, L.rows, bin);
  if (xb) L.xBreaks = xb;
  if (yb) L.yBreaks = yb;
  if (typeof axisLinkLabel === "function") {
    L.xName = axisLinkLabel(xL);
    L.yName = axisLinkLabel(yL);
  }
  return true;
}

function applyMapGeom(L, item, bin) {
  if (!item) return L;
  if (apply2dGeom(L, item, bin)) {
    var zLab2 = mapZLabel(item);
    if (zLab2) L.zName = zLab2;
    if (/\u0423\u041e\u0417/i.test(item.name || "")) {
      L.zFrom = -60;
      L.zTo = 60;
      L.zStep = 5;
      if (!L.zName) L.zName = "\u0423\u041e\u0417, \u0433\u0440.\u043f.\u043a.\u0432.";
    }
    applyWeightFuelAxis(L, item);
    applyUozGearAxis(L, item);
    applyDetZoneAxis(L, item);
    applyVtecZoneAxis(L, item);
    applyDetVoltAxis(L, item);
    applyDetThrCorrAxis(L, item);
    applyKrStepAxis(L, item);
    applyLeanDelayAxis(L, item);
    applyConfirmed1d(L, item);
    applyMafAxis(L, item);
    return L;
  }
  if (!(item.cols >= 2 && item.cols <= 256)) return L;
  L.cols = item.cols;
  L.xCount = item.cols;
  L.rows = 1;
  var zLab = mapZLabel(item);
  if (zLab) L.zName = zLab;
  if (item.unit) L.xName = item.unit;
  if (/\u0423\u041e\u0417/i.test(item.name || "")) {
    L.zFrom = -60;
    L.zTo = 60;
    L.zStep = 5;
    if (!L.zName) L.zName = "\u0423\u041e\u0417, \u0433\u0440.\u043f.\u043a.\u0432.";
  }
  var xLink = item.axisRef || (item.axisLinks && item.axisLinks[0]);
  var br = breaksForLink(xLink, item.cols, bin);
  if (br) {
    L.xBreaks = br;
    if (typeof axisLinkLabel === "function") L.xName = axisLinkLabel(xLink) || L.xName;
    return L;
  }
  if (item.axisRef) return L;
  if (item.mapXMin != null && item.mapXMax != null && item.cols > 1) {
    L.xFrom = item.mapXMin;
    L.xTo = item.mapXMax;
    L.xStep = (item.mapXMax - item.mapXMin) / (item.cols - 1);
  }
  applyConfirmed1d(L, item);
  applyMafAxis(L, item);
  return L;
}

function knownTableZ(item) {
  if (!item) return null;
  var a = item.addr;
  var n = item.name || "";
  if (a === 0x92b1 || a === 0x64d3 || /\u0444\u0430\u0437\u0430 \u0432\u043f\u0440\u044b\u0441\u043a\u0430 \u043e\u0442 /i.test(n)) return "phase6";
  if (/\u0444\u0430\u0437\u0430 (?:\u043d\u0430\u0447\u0430\u043b\u0430|\u043e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u044f) \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(n)) return "phase6";
  if (/^\u041f\u043e\u0440\u043e\u0433 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438$/i.test(n) || /\u043e\u0442\u043d\u043e\u0441\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u043f\u043e\u0440\u043e\u0433 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(n)) return "k16";
  if (a === 0xf900 || /\u043f\u0430\u043c\u044f\u0442\u044c \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u044f \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(n)) return "deg120";
  if (a === 0x8fb9 || /\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u0423\u041e\u0417 \u043e\u0442 \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438/i.test(n)) return "uoz20";
  if (a === 0x809e || /\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u0441\u043e\u0441\u0442\u0430\u0432\u0430 \u0441\u043c\u0435\u0441\u0438 \u043e\u0442 \u043f\u0435\u0440\u0435\u0434\u0430\u0447\u0438/i.test(n)) return "alfI8";
  if (a === 0xfd00 || (/\u043f\u0430\u043c\u044f\u0442\u044c \u043e\u0431\u0443\u0447\u0435\u043d\u0438\u044f/i.test(n) && !/\u0434\u0435\u0442\u043e\u043d\u0430\u0446/i.test(n))) return "k128";
  if (a === 0x8da5 || /\u0432\u0435\u0441 \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u0438 \u0426\u041d/i.test(n)) return "k256";
  if (a === 0x7132 || a === 0x7a77 || a === 0x7a87 || /^\u041a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u043f\u043e (RPM|\u0434\u0440\u043e\u0441\u0441\u0435\u043b\u044e|\u043e\u0431\u043e\u0440\u043e\u0442\u0430\u043c \u043f\u0440\u043e\u043a\u0440\u0443\u0442\u043a\u0438)$/i.test(n)) return "k256";
  if (a === 0x736d || a === 0x5a00 || a === 0x8293 || a === 0x5ea4 || a === 0x8f4a || a === 0x5e5d || /\u043f\u043e\u043f\u0440\u0430\u0432\u043a\u0430 \u0426\u041d|\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u0426\u041d/i.test(n)) return "k128";
  if (/\u0437\u0430\u0434\u0435\u0440\u0436\u043a\u0430 \u0440\u0435\u0433\u0443\u043b\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f (Lean-Rich|Rich-Lean)/i.test(n)) return "sec2";
  if (/\u0448\u0430\u0433 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f \u041a\u0420/i.test(n)) return "k256s";
  if (/\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u043f\u043e\u0440\u043e\u0433\u0430 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(n)) return "kOff128";
  if (/\u0430\u0431\u0441\u043e\u043b\u044e\u0442\u043d\u044b\u0439 \u0443\u0440\u043e\u0432\u0435\u043d\u044c \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(n)) return "volt5";
  if (/\u0437\u043e\u043d\u0430 \u043a\u043e\u043d\u0442\u0440\u043e\u043b\u044f \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(n)) return "zone3";
  if (/\u0437\u043e\u043d\u0430 (?:\u0432\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u044f|\u0432\u044b\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u044f) VTEC/i.test(n)) return "zone1";
  if (/\u0437\u043e\u043d\u0430 \u0440\u0435\u0433\u0443\u043b\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044f \u043f\u043e RPM-GBC/i.test(n)) return "zone1";
  if (a === 0x758d || /\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u0442\u043e\u043f\u043b\u0438\u0432\u0430 \u0432 \u0440\u0435\u0436\u0438\u043c\u0435 Launch/i.test(n)) return "k128";
  if (a === 0x9922 || /\u043e\u0431\u043e\u0440\u043e\u0442\u044b \u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u043a\u0438 \u0432\u043f\u0440\u044b\u0441\u043a\u0430 \u043d\u0430 \u043b\u0430\u0443\u043d\u0447\u0435/i.test(n)) return "rpm40";
  if (a === 0x9962 || /\u043e\u0431\u043e\u0440\u043e\u0442\u044b \u043f\u0435\u0440\u0435\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u044f \u0432\u0432\u0435\u0440\u0445/i.test(n)) return "rpm40";
  if (/\u0442\u0430\u0440\u0438\u0440\u043e\u0432\u043a\u0430 \u0434\u0430\u0442\u0447\u0438\u043a\u0430 \u043b\u0430\u0443\u043d\u0447\u0430 \(\u043e\u0431\u043e\u0440\u043e\u0442/i.test(n) || /\u0434\u043e\u0431\u0430\u0432\u043a\u0430 \u043a \u0442\u0435\u043a\u0443\u0449\u0438\u043c \u043e\u0431\u043e\u0440\u043e\u0442\u0430\u043c/i.test(n) || /ShiftLight/i.test(n)) return "rpm40";
  if (/\u0442\u0430\u0440\u0438\u0440\u043e\u0432\u043a\u0430 \u0434\u0430\u0442\u0447\u0438\u043a\u0430 \u043b\u0430\u0443\u043d\u0447\u0430 \(\u043a\u043e\u044d\u0444\u0444/i.test(n)) return "k256";
  if (a === 0x62ac || /\u0442\u0430\u0440\u0438\u0440\u043e\u0432\u043a\u0430 \u0428\u041f\u0414\u041a/i.test(n)) return "alf256";
  if (/\u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u0438 \u043d\u0430\u0434\u0434\u0443\u0432\u0430|\u0442\u0430\u0431\u043b\u0438\u0446\u0430 \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u0438 \u0428\u0418\u041c/i.test(n)) return "k128";
  if (/\u0432\u0440\u0435\u043c\u044f \u0440\u0430\u0431\u043e\u0442\u044b \u0441\u0442\u0430\u0440\u0442\u0435\u0440\u0430 \u043f\u043e\u0441\u043b\u0435/i.test(n)) return "sec02";
  if (/^\u0428\u0418\u041c \u043f\u043e \u043a\u0430\u0440\u0442\u0435 \u043e\u0431\u043e\u0440\u043e\u0442\u044b-\u0434\u0430\u0432\u043b/i.test(n)) return "pct256";
  if (/^\u0420\u0435\u043b\u0435\u0439\u043d\u044b\u0439 \u0432\u044b\u0445\u043e\u0434 \u043f\u043e \u043a\u0430\u0440\u0442\u0435 \u043e\u0431\u043e\u0440\u043e\u0442\u044b-\u0434\u0430\u0432\u043b/i.test(n)) return "zone1";
  if (/^\u0421\u043a\u0432\u0430\u0436\u043d\u043e\u0441\u0442\u044c \u0428\u0418\u041c/i.test(n)) return "pct";
  if (a === 0x7f27 || a === 0x7f47 || /\u043c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u043e\u0435 \u0432\u0440\u0435\u043c\u044f \u043c\u0435\u0436\u0434\u0443 \u0446\u0438\u043a\u043b\u0430\u043c\u0438 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438|\u043f\u0435\u0440\u0438\u043e\u0434 \u0432\u043e\u0441\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u0438\u044f \u0423\u041e\u0417/i.test(n)) return "sec02";
  if (a === 0x63ac || /\u043f\u043e\u043f\u0440\u0430\u0432\u043a\u0430 \u0430\u0432\u0430\u0440\u0438\u0439\u043d\u043e\u0433\u043e \u0426/i.test(n)) return "k128";
  if (a === 0x8f2a || /\u043e\u0442\u043d\u043e\u0441\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u043f\u043e\u0440\u043e\u0433 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(n)) return "k16";
  if (/\u0444\u0430\u0437\u0430 (?:\u043d\u0430\u0447\u0430\u043b\u0430|\u043e\u043a\u043e\u043d\u0447\u0430\u043d\u0438\u044f) \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(n)) return "phase6";
  if (a === 0x6f56 || /\u0436\u0435\u043b\u0430\u0435\u043c\u044b\u0435 \u043e\u0431\u043e\u0440\u043e\u0442\u044b \u0425\u0425/i.test(n)) return "rpm10";
  if (a === 0x6fe4 || a === 0x8a0b || a === 0x8c00 || a === 0x8c27 || a === 0x928a || /\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 \u0420\u0425\u0425|\u0441\u043c\u0435\u0449\u0435\u043d\u0438\u0435 \u0420\u0425\u0425/i.test(n)) return "steps";
  if (/\u0423\u041e\u0417/i.test(n) && a !== 0x8fb9) return "uoz";
  if (a === 0x6f0f || a === 0x7cd7 || /\u0434\u0438\u043d\u0430\u043c\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f GTC \u043f\u043e GBC/i.test(n)) return "k128";
  if (a === 0x6f2f || /\u0434\u0438\u043d\u0430\u043c\u0438\u0447\u0435\u0441\u043a\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f GTC \u043f\u043e \u0442\u0435\u043c\u043f/i.test(n)) return "k64";
  if (a === 0x8393 || /\u044d\u043a\u0441\u0442\u0440\u0430\u043f\u043e\u043b\u0438\u0440\u0443\u044e\u0449\u0438\u0439 \u043a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442 \u043f\u0435\u0440\u0435\u0441\u0447\u0435\u0442\u0430 GBC/i.test(n)) return "k64";
  if (a === 0x8796 || /GTCDR/i.test(n)) return "k16";
  if (a === 0x7f67 || a === 0x8501 || a === 0x84e1 || a === 0x84ba || a === 0x6a7a) return "k256";
  if (/\u043a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442 \u0432\u0435\u0441\u043e\u0432\u043e\u0439 \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u0438/i.test(n)) return "k256";
  if (/\u043a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442 \u0442\u043e\u043f\u043b\u0438\u0432\u0430 \u043f\u043e /i.test(n)) return "k256";
  if (/\u044d\u043a\u0441\u0442\u0440\u0430\u043f\u043e\u043b\u0438\u0440\u0443\u044e\u0449\u0438\u0439 \u043a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442 \u043f\u0435\u0440\u0435\u0441\u0447\u0435\u0442\u0430 \u0434\u0430\u0432\u043b/i.test(n)) return "k256";
  if (/\u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u0431\u0430\u0437\u043e\u0432\u043e\u0433\u043e \u0441\u043e\u0441\u0442\u0430\u0432\u0430/i.test(n)) return "k256";
  if (a === 0x87e4 || a === 0x6a53 || a === 0x782f || a === 0x76ef || a === 0x6953 || a === 0x83ba) return "alf256";
  if (/^\u0421\u043e\u0441\u0442\u0430\u0432 \u0441\u043c\u0435\u0441\u0438/i.test(n) || /\u0431\u0430\u0437\u043e\u0432\u044b\u0439 \u0441\u043e\u0441\u0442\u0430\u0432 \u0441\u043c\u0435\u0441\u0438/i.test(n) || /\u043e\u0433\u0440\u0430\u043d\u0438\u0447\u0435\u043d\u0438\u0435 \u0441\u043e\u0441\u0442\u0430\u0432\u0430 \u0441\u043c\u0435\u0441\u0438/i.test(n)) return "alf256";
  if (a === 0x8a32) return "gtc";
  if (a === 0x8a99) return "rpm10";
  if (a === 0x7152) return "gbc180";
  if (a === 0x710b || a === 0x7179) return "gbc90";
  if (a === 0x726d || /^\u0411\u0426\u041d \u043f\u043e \u0434\u0430\u0432\u043b/i.test(n)) return "gbc48";
  if (a === 0x75ef || /^\u0411\u0426\u041d \u043f\u043e \u0434\u0440\u043e\u0441\u0441/i.test(n)) return "gbc96";
  if (a === 0x700b || /\u0436\u0435\u0441\u0442\u043a\u043e\u0441\u0442\u044c \u0440\u0435\u0433\u0443\u043b\u044f\u0442\u043e\u0440\u0430/i.test(n)) return "k64";
  if (a === 0xff96 || /\u0442\u0430\u0440\u0438\u0440\u043e\u0432\u043a\u0430 \u0414\u041c\u0420\u0412/i.test(n)) return "kgh10";
  if (a === 0x6126 || a === 0x6104 || a === 0x93e0 || /\u0442\u0430\u0440\u0438\u0440\u043e\u0432\u043a\u0430 (\u0414\u0422\u0412|\u0414\u0422\u041e\u0416|\u0414\u043e\u043f\.?\u0414\u0422)/i.test(n)) return "temp";
  if (a === 0x8193 || /\u0432\u0435\u0441\u043e\u0432\u0430\u044f \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u044f \u0442\u043e\u043f\u043b\u0438\u0432\u043e\u043f\u043e\u0434\u0430\u0447\u0438/i.test(n)) return "k256";
  if (/\u0430\u0441\u0438\u043d\u0445\u0440\u043e\u043d\u043d\u0430\u044f \u0446\u0438\u043a\u043b\u043e\u0432\u0430\u044f/i.test(n)) return "gbc180";
  if (/^\u041c\u0430\u043b\u0430\u044f \u0446\u0438\u043a\u043b\u043e\u0432\u0430\u044f \u043f\u043e\u0434\u0430\u0447\u0430$/i.test(n)) return "gbc90";
  if (/^\u0411\u043e\u043b\u044c\u0448\u0430\u044f \u0446\u0438\u043a\u043b\u043e\u0432\u0430\u044f \u043f\u043e\u0434\u0430\u0447\u0430$/i.test(n)) return "gbc90";
  return null;
}

function lockKnownTableZ(item, L) {
  if (!item || !L) return L;
  var kn = knownTableZ(item);
  if (!kn || !Z_PRESETS[kn]) return L;
  L.z = kn;
  var p = Z_PRESETS[kn];
  if (p.yMin == null || p.yMax == null) return L;
  var from = cellNum(L.zFrom);
  var to = cellNum(L.zTo);
  var need = Math.abs(p.yMax - p.yMin);
  var have = from != null && to != null ? Math.abs(to - from) : 0;
  if (have < need * 0.2) {
    L.zFrom = String(p.yMin);
    L.zTo = String(p.yMax);
    if (p.yStep != null) L.zStep = String(p.yStep);
    var zN = axisPointCount(L.zFrom, L.zTo, L.zStep);
    if (zN) L.zCount = zN;
  }
  return L;
}

function guessTableLayout(item, size, bin) {
  var L = emptyLayout(size);
  applyMapGeom(L, item, bin);
  var unit = (item && item.unit) || "";
  var zUnit = (item && item.zUnit) || "";
  var name = (item && item.name) || "";
  if (/\u0442\u0435\u043c\u043f/i.test(unit)) L.x = "temp";
  if (/\u043c\u0433\/\u0446\u0438\u043a\u043b\/\u0441\u0435\u043a/i.test(zUnit) || /GTC/i.test(name)) L.z = "gtc";
  if ((/\u043e\u0431\/\u043c\u0438\u043d/i.test(zUnit) && !/\u0441\u0435\u043a/i.test(zUnit)) || /\u043f\u043e\u043b\u043d\u043e\u0433\u043e \u0432\u044b\u0445\u043e\u0434\u0430 \u0438\u0437 \u0440\u0435\u0436\u0438\u043c\u0430 \u043f\u0443\u0441\u043a\u0430/i.test(name)) L.z = "rpm10";
  var kn = knownTableZ(item);
  if (kn) L.z = kn;
  if (L.x === "temp") {
    L.xName = "\u0422\u0435\u043c\u043f\u0435\u0440\u0430\u0442\u0443\u0440\u0430, \u0433\u0440\u0430\u0434.C";
    L.xFrom = -40;
    L.xTo = 150;
    L.xStep = 5;
  }
  if (L.z === "rpm10") {
    L.zName = "\u041e\u0431\u043e\u0440\u043e\u0442\u044b, \u043e\u0431/\u043c\u0438\u043d";
    L.zFrom = 0;
    L.zTo = 2500;
    L.zStep = 100;
  }
  if (L.z === "rpm40") {
    L.zName = "\u041e\u0431\u043e\u0440\u043e\u0442\u044b, \u043e\u0431/\u043c\u0438\u043d";
    L.zFrom = 2000;
    L.zTo = 10000;
    L.zStep = 1000;
  }
  if (L.z === "zone3") {
    L.zName = "\u0417\u043e\u043d\u0430";
    L.zFrom = 0;
    L.zTo = 3;
    L.zStep = 1;
  }
  if (L.z === "zone1") {
    L.zName = /\u0440\u0435\u043b\u0435\u0439\u043d\u044b\u0439 \u0432\u044b\u0445\u043e\u0434 \u043f\u043e \u043a\u0430\u0440\u0442\u0435/i.test(name)
      ? "\u0412\u043a\u043b"
      : "\u0417\u043e\u043d\u0430";
    L.zFrom = 0;
    L.zTo = 1;
    L.zStep = 1;
  }
  if (L.z === "pct256") {
    L.zName = "\u0421\u043a\u0432\u0430\u0436\u043d\u043e\u0441\u0442\u044c \u0428\u0418\u041c, %";
    L.zFrom = 0;
    L.zTo = 100;
    L.zStep = 10;
  }
  if (L.z === "volt5") {
    L.zName = "\u041d\u0430\u043f\u0440\u044f\u0436\u0435\u043d\u0438\u0435, \u0412";
    L.zFrom = 0;
    L.zTo = 4.5;
    L.zStep = 0.5;
  }
  if (L.z === "kOff128") {
    L.zName = "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442 \u043a\u043e\u0440\u0440\u0435\u043a\u0446\u0438\u0438";
    L.zFrom = 0.5;
    L.zTo = 1.4;
    L.zStep = 0.1;
  }
  if (L.z === "gtc") {
    L.zName = "\u043c\u0433/\u0446\u0438\u043a\u043b/\u0441\u0435\u043a";
    L.zFrom = 0;
    L.zTo = 70;
    L.zStep = 5;
  }
  if (L.z === "gbc180") {
    L.zName = "\u0426\u0438\u043a\u043b\u043e\u0432\u0430\u044f \u043f\u043e\u0434\u0430\u0447\u0430 \u0442\u043e\u043f\u043b\u0438\u0432\u0430, \u043c\u0433/\u0446\u0438\u043a\u043b";
    L.zFrom = 0;
    L.zTo = 360;
    L.zStep = 20;
  }
  if (L.z === "gbc90") {
    L.zName = "\u0426\u0438\u043a\u043b\u043e\u0432\u0430\u044f \u043f\u043e\u0434\u0430\u0447\u0430 \u0442\u043e\u043f\u043b\u0438\u0432\u0430, \u043c\u0433/\u0446\u0438\u043a\u043b";
    L.zFrom = 0;
    L.zTo = 700;
    L.zStep = 50;
  }
  if (L.z === "gbc48") {
    L.zName = "\u0426\u0438\u043a\u043b\u043e\u0432\u043e\u0435 \u043d\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435, \u043c\u0433/\u0446\u0438\u043a\u043b";
    L.zFrom = 0;
    L.zTo = 1200;
    L.zStep = 100;
  }
  if (L.z === "gbc96") {
    L.zName = "\u0426\u0438\u043a\u043b\u043e\u0432\u043e\u0435 \u043d\u0430\u043f\u043e\u043b\u043d\u0435\u043d\u0438\u0435, \u043c\u0433/\u0446\u0438\u043a\u043b";
    L.zFrom = 0;
    L.zTo = 600;
    L.zStep = 100;
  }
  if (L.z === "alf" || L.z === "alf256") {
    L.zName = "\u041e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u0435 \u0432\u043e\u0437\u0434\u0443\u0445\u0430/\u0442\u043e\u043f\u043b\u0438\u0432\u043e";
    L.zFrom = 7.5;
    L.zTo = 21.5;
    L.zStep = 0.5;
  }
  if (L.z === "k256") {
    if (!L.zName) L.zName = "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442";
    L.zFrom = 0;
    L.zTo = 1;
    L.zStep = 0.1;
  }
  if (L.z === "k256s") {
    L.zName = "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442";
    L.zFrom = 0;
    L.zTo = 0.2;
    L.zStep = 0.02;
  }
  if (L.z === "sec2") {
    L.zName = "\u0412\u0440\u0435\u043c\u044f, \u0441\u0435\u043a.";
    L.zFrom = 0;
    L.zTo = 2;
    L.zStep = 0.2;
  }
  if (L.z === "k128") {
    if (!L.zName) L.zName = "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442";
    L.zFrom = 0;
    L.zTo = 1.9;
    L.zStep = 0.1;
  }
  if (L.z === "k64") {
    if (!L.zName) L.zName = "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442";
    L.zFrom = 0;
    L.zTo = 4;
    L.zStep = 0.5;
  }
  if (L.z === "k16") {
    if (!L.zName) L.zName = "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442";
    L.zFrom = 0;
    L.zTo = 4;
    L.zStep = 0.25;
    if (/\u043e\u0442\u043d\u043e\u0441\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u043f\u043e\u0440\u043e\u0433 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(name)) {
      L.zName = "\u041f\u043e\u0440\u043e\u0433";
      L.zTo = 10;
      L.zStep = 1;
    } else if (/^\u041f\u043e\u0440\u043e\u0433 \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438$/i.test(name)) {
      L.zName = "\u041f\u043e\u0440\u043e\u0433";
    }
  }
  if (L.z === "alfI8") {
    L.zName = "ALF";
    L.zFrom = -10;
    L.zTo = 10;
    L.zStep = 1;
  }
  if (L.z === "deg120") {
    L.zName = "\u041e\u0442\u0441\u043a\u043e\u043a \u0443\u0433\u043b\u0430, \u0433\u0440\u0434";
    L.zFrom = 0;
    L.zTo = 120;
    L.zStep = 10;
  }
  if (L.z === "phase6") {
    L.zName = "\u0424\u0430\u0437\u0430, \u0433\u0440.\u043f.\u043a.\u0432.";
    L.zFrom = 0;
    L.zTo = 700;
    L.zStep = 100;
    if (/\u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f \u0434\u0435\u0442\u043e\u043d\u0430\u0446\u0438\u0438/i.test(name)) {
      L.zTo = 90;
      L.zStep = 10;
    }
  }
  if (L.z === "uoz20") {
    L.zName = "\u041f\u043e\u043f\u0440\u0430\u0432\u043a\u0430 \u0423\u041e\u0417, \u0433\u0440.\u043f.\u043a.\u0432.";
    L.zFrom = -20;
    L.zTo = 20;
    L.zStep = 5;
  }
  if (L.z === "uoz") {
    if (!L.zName) L.zName = "\u0433\u0440.\u043f.\u043a.\u0432.";
    L.zFrom = -60;
    L.zTo = 60;
    L.zStep = 5;
  }
  if (L.z === "steps") {
    L.zName = "\u0448\u0430\u0433\u043e\u0432";
    L.zFrom = 0;
    L.zTo = 160;
    L.zStep = 10;
  }
  if (item && item.addr === 0x7132) {
    L.z = "k256";
    L.zFrom = 0.05;
    L.zTo = 1;
    L.zStep = 0.05;
    L.zName = "\u041a\u043e\u044d\u0444\u0444\u0438\u0446\u0438\u0435\u043d\u0442";
  }
  applyWeightFuelAxis(L, item);
  applyUozGearAxis(L, item);
  applyDetZoneAxis(L, item);
  applyVtecZoneAxis(L, item);
  applyDetVoltAxis(L, item);
  applyDetThrCorrAxis(L, item);
  applyKrStepAxis(L, item);
  applyLeanDelayAxis(L, item);
  applyConfirmed1d(L, item);
  applyMafAxis(L, item);
  var cells = size;
  if (item && item.width === 2) cells = Math.floor(size / 2);
  applyAxisCounts(L, cells);
  applyMafAxis(L, item);
  return L;
}

function layoutFromRec(rec, size, item, bin) {
  var base = item ? guessTableLayout(item, size, bin) : emptyLayout(size);
  if (!rec || rec.kind !== "table") return base;
  var map2d = item && item.rows >= 2 && item.cols >= 2;
  if (map2d) {
    base.rows = item.rows;
    base.cols = item.cols;
  } else {
    if (rec.rows > 1) base.rows = rec.rows;
    if (rec.cols && !(item && item.cols)) base.cols = rec.cols;
  }
  var knownZ = knownTableZ(item);
  if (rec.zScale && rec.zScale !== "auto" && rec.zScale !== "raw" && !knownZ) base.z = rec.zScale;
  if (!knownZ && rec.raw && rec.ctpValue != null && Math.abs(rec.raw - rec.ctpValue) > 0.05) {
    var hit = inferZFromCells([{ raw: rec.raw, ctp: rec.ctpValue }]);
    if (hit && hit !== "raw") base.z = hit;
  }
  if (knownZ) base.z = knownZ;
  if (rec.xAxis && rec.xAxis !== "auto") base.x = rec.xAxis;
  if (rec.yAxis && rec.yAxis !== "auto") base.y = rec.yAxis;
  if (rec.xMin != null && rec.xMin !== "") base.xMin = rec.xMin;
  if (rec.xMax != null && rec.xMax !== "") base.xMax = rec.xMax;
  if (rec.yMin != null && rec.yMin !== "") base.yMin = rec.yMin;
  if (rec.yMax != null && rec.yMax !== "") base.yMax = rec.yMax;
  if (rec.ctpCells) base.ctpCells = rec.ctpCells;
  ["xName", "xFrom", "xTo", "xStep", "xCount", "zName", "zFrom", "zTo", "zStep", "zCount"].forEach(function (k) {
    if (rec[k] == null || rec[k] === "") return;
    if (k === "zName" && rec.zName === rec.xName) return;
    if (map2d && (k === "xCount" || k === "xFrom" || k === "xTo" || k === "xStep")) return;
    base[k] = rec[k];
  });
  lockKnownTableZ(item, base);
  if (map2d) return base;
  var cells = size;
  if (item && item.width === 2) cells = Math.floor(size / 2);
  applyAxisCounts(base, cells);
  applyMafAxis(base, item);
  lockKnownTableZ(item, base);
  return base;
}

function cellNum(s) {
  if (s == null || s === "") return null;
  var n = Number(String(s).trim().replace(",", "."));
  return isFinite(n) ? n : null;
}

function resizeCtpText(arr, n) {
  var out = arr || [];
  while (out.length < n) out.push("");
  if (out.length > n) out.length = n;
  return out;
}

function ctpTextFromRec(rec, n) {
  var src = rec && rec.ctpCells ? rec.ctpCells : [];
  var out = [];
  for (var i = 0; i < n; i++) {
    var v = src[i];
    out.push(v == null || v === "" ? "" : String(v));
  }
  return out;
}

function interpBlend(t, a, b) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  var u = 1 - t;
  return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
}

function interpEnds(ctpText, ids, cols) {
  if (!ids || ids.length < 2) return null;
  var r = Math.floor(ids[0] / cols);
  var cs = [];
  var i;
  for (i = 0; i < ids.length; i++) {
    if (Math.floor(ids[i] / cols) === r) cs.push(ids[i] % cols);
  }
  cs.sort(function (x, y) { return x - y; });
  if (cs.length < 2 || cs[0] === cs[cs.length - 1]) return null;
  var c0 = cs[0];
  var c1 = cs[cs.length - 1];
  var v0 = cellNum(ctpText[r * cols + c0]);
  var v1 = cellNum(ctpText[r * cols + c1]);
  if (v0 == null || v1 == null) return null;
  return { r: r, c0: c0, c1: c1, v0: v0, v1: v1, n: c1 - c0 + 1 };
}

function interpCells(ctpText, ids, cols, a, b) {
  a = a == null ? 1 / 3 : a;
  b = b == null ? 2 / 3 : b;
  var byRow = {};
  var i, r, c;
  for (i = 0; i < ids.length; i++) {
    r = Math.floor(ids[i] / cols);
    c = ids[i] % cols;
    if (!byRow[r]) byRow[r] = [];
    byRow[r].push(c);
  }
  var filled = 0;
  var rows = Object.keys(byRow);
  for (i = 0; i < rows.length; i++) {
    r = Number(rows[i]);
    var cs = byRow[r].slice().sort(function (x, y) { return x - y; });
    var c0 = cs[0];
    var c1 = cs[cs.length - 1];
    if (c1 <= c0) continue;
    var v0 = cellNum(ctpText[r * cols + c0]);
    var v1 = cellNum(ctpText[r * cols + c1]);
    if (v0 == null || v1 == null) continue;
    for (c = c0; c <= c1; c++) {
      var t = (c - c0) / (c1 - c0);
      var u = interpBlend(t, a, b);
      ctpText[r * cols + c] = String(Math.round((v0 + (v1 - v0) * u) * 1000) / 1000);
      filled++;
    }
  }
  return filled;
}

function overlayRow(ctpText, row, cols) {
  var out = [];
  for (var c = 0; c < cols; c++) out.push(cellNum((ctpText || [])[row * cols + c]));
  return out;
}

function filledCellPairs(bytes, ctpText) {
  var out = [];
  for (var i = 0; i < bytes.length; i++) {
    var v = cellNum(ctpText[i]);
    if (v != null) out.push({ raw: bytes[i], ctp: v, i: i });
  }
  return out;
}

function inferZFromCells(pairs) {
  if (!pairs || !pairs.length) return null;
  var ids = Object.keys(Z_PRESETS);
  var best = null;
  var bestN = 0;
  for (var i = 0; i < ids.length; i++) {
    var p = Z_PRESETS[ids[i]];
    var n = 0;
    for (var k = 0; k < pairs.length; k++) {
      var v = p.toPhys(pairs[k].raw);
      var ctp = pairs[k].ctp;
      if (Math.abs(v - ctp) < 1e-3
        || (ctp !== 0 && Math.abs(v - ctp) / Math.abs(ctp) < 0.012)
        || Math.abs(Math.round(v * 10) / 10 - ctp) < 0.051) n++;
    }
    if (n > bestN) {
      bestN = n;
      best = p.id;
    }
  }
  return bestN ? best : null;
}

function applyTableLayout(item, layout) {
  item.layout = layout;
}

function inferZScale(raw, ctp) {
  var ids = Object.keys(Z_PRESETS);
  for (var i = 0; i < ids.length; i++) {
    var p = Z_PRESETS[ids[i]];
    var v = p.toPhys(raw);
    if (Math.abs(v - ctp) < 1e-3 || (ctp !== 0 && Math.abs(v - ctp) / Math.abs(ctp) < 0.012)) return p.id;
  }
  return "raw";
}

function axisDigits(step) {
  var s = Math.abs(Number(step));
  if (!isFinite(s) || s === 0) return 0;
  var t = s.toFixed(6).replace(/\.?0+$/, "");
  var d = t.indexOf(".");
  return d < 0 ? 0 : Math.min(4, t.length - d - 1);
}

function axisPointCount(from, to, step) {
  from = cellNum(from);
  to = cellNum(to);
  step = cellNum(step);
  if (from == null || to == null || step == null || step === 0) return null;
  var n = Math.round((to - from) / step) + 1;
  return n > 1 ? n : null;
}

function applyAxisCounts(layout, size) {
  if (!layout) return layout;
  if (typeof isMafCalib === "function" && layout.z === "kgh10" && layout.cols === 256) return layout;
  var zN = axisPointCount(layout.zFrom, layout.zTo, layout.zStep);
  if (zN) layout.zCount = zN;
  var xN = axisPointCount(layout.xFrom, layout.xTo, layout.xStep);
  if (!xN) return layout;
  layout.xCount = xN;
  if (size && xN <= size) {
    layout.cols = xN;
    layout.rows = size % xN === 0 ? size / xN : 1;
  }
  return layout;
}

function customAxis(from, step, n, label, to) {
  from = cellNum(from);
  step = cellNum(step);
  to = cellNum(to);
  if (from == null || n < 1) return null;
  if (step == null || step === 0) {
    if (to == null || n <= 1) return null;
    step = (to - from) / (n - 1);
  }
  return {
    min: from,
    max: from + (n - 1) * step,
    label: label || "",
    digits: axisDigits(step),
    step: Math.abs(step)
  };
}

function fitGrid(size, colsWant) {
  var want = Math.max(1, Math.round(Number(colsWant) || size));
  if (size % want === 0) return { rows: size / want, cols: want };
  var pairs = factorPairs(size);
  var best = pairs[0];
  var bd = 1e9;
  for (var i = 0; i < pairs.length; i++) {
    var d = Math.abs(pairs[i].cols - want);
    if (d < bd) {
      bd = d;
      best = pairs[i];
    }
  }
  return best;
}

function resolveAxis(kind, n, item) {
  var L = item.layout || {};
  if (kind === "row" && n <= 1) return null;
  if (kind === "row" && L.yBreaks && L.yBreaks.length) {
    var yb = L.yBreaks;
    var yst = yb.length > 1 ? Math.abs(yb[1] - yb[0]) : 1;
    return {
      min: yb[0],
      max: yb[yb.length - 1],
      label: L.yName || "",
      digits: typeof axisDigits === "function" ? axisDigits(yst) : 1,
      values: yb
    };
  }
  if (kind !== "row" && L.xBreaks && L.xBreaks.length) {
    var xb = L.xBreaks;
    var xst = xb.length > 1 ? Math.abs(xb[1] - xb[0]) : 1;
    return {
      min: xb[0],
      max: xb[xb.length - 1],
      label: L.xName || "",
      digits: typeof axisDigits === "function" ? Math.max(2, axisDigits(xst)) : 2,
      values: xb
    };
  }
  if (kind !== "row") {
    var cx = customAxis(L.xFrom, L.xStep, n, L.xName, L.xTo);
    if (cx) return cx;
  } else {
    var cy = customAxis(L.yFrom, L.yStep, n, L.yName, L.yTo);
    if (cy) return cy;
  }
  var key = kind === "row" ? L.y : L.x;
  var lo = kind === "row" ? L.yMin : L.xMin;
  var hi = kind === "row" ? L.yMax : L.xMax;
  if (key && key !== "auto" && AXIS_PRESETS[key]) {
    var a = AXIS_PRESETS[key];
    var min = lo === "" || lo == null ? (key === "idx" ? 0 : a.min) : Number(lo);
    var max = hi === "" || hi == null ? (key === "idx" ? n - 1 : a.max) : Number(hi);
    var step = a.step != null ? a.step : (n > 1 ? (max - min) / (n - 1) : 1);
    return { min: min, max: max, label: a.label, digits: a.digits, step: step };
  }
  if (kind === "row") return axisFromText((item.name || ""), n, "row");
  return axisFromText(((item.unit || "") + " " + (item.name || "")), n, "col");
}
