function near(arr, x, eps) {
  eps = eps || 1e-4;
  for (var i = 0; i < arr.length; i++) if (Math.abs(arr[i] - x) < eps) return true;
  return false;
}

function hasUnit(unit, re) {
  return re.test(unit || "");
}

function applyFormula(raw, f) {
  if (f == null || f === "" || f === "?" || f === "bit") return null;
  if (f === "i8") return raw > 127 ? raw - 256 : raw;
  if (typeof Z_PRESETS !== "undefined" && Z_PRESETS[f]) return Z_PRESETS[f].toPhys(raw);
  var expr = String(f).replace(/,/g, ".").replace(/\s+/g, "").replace(/raw/gi, "R");
  if (!/^[\sR0-9.+\-*/()]+$/.test(expr)) return null;
  try {
    var v = Function("R", "return (" + expr + ")")(raw);
    return isFinite(v) ? v : null;
  } catch (e) {
    return null;
  }
}

function ok(raw, f) {
  var v = applyFormula(raw, f);
  if (v == null) return null;
  return { value: v, verified: true, formula: f.replace(/\*/g, " * ").replace(/\//g, " / ").replace(/-/g, " - ") };
}

var KNOWN = {
  0x607d: "raw*5-40",
  0x6077: "raw*2.871094/256",
  0x6078: "raw*2.871094",
  0x6070: "raw/48",
  0x5f1d: "raw*0.02",
  0x60ea: "raw*30",
  0x60a1: "raw",
  0x6086: "raw/256",
  0x6087: "raw/256",
  0x5f6b: "raw/256",
  0x5f6c: "raw/256",
  0x6053: "raw/64",
  0x5f77: "raw",
  0x6084: "raw/5",
  0x6062: "raw*0.1",
  0x75ee: "raw*100/256",
  0x607c: "raw*14.7/96",
  0x60ad: "raw*14.7/128",
  0x60d7: "raw*14.7/128",
  0x6058: "raw/4",
  0x6059: "raw/4",
  0x6055: "raw/16",
  0x6056: "raw",
  0x606f: "raw*0.02",
  0x605a: "raw*10",
  0x60e5: "raw*10",
  0x606e: "raw",
  0x60d8: "raw",
  0x60ae: "raw/2",
  0x60df: "raw*0.2",
  0x5f8c: "raw",
  0x60bf: "raw*0.093",
  0x60c0: "raw*0.093",
  0x60be: "raw*30",
  0x60fa: "raw*6.4",
  0x60e1: "raw/2.55",
  0x60e2: "raw/2.55",
  0x5cb2: "raw/50",
  0x5cb3: "50/raw",
  0x6080: "raw*25",
  0x6083: "raw*0.2098/122",
  0x6081: "i8",
  0x6093: "raw/640",
  0x6094: "raw/640",
  0x5f6d: "raw*16/88.2",
  0x5ef8: "raw/100",
  0x60e3: "raw*25.6",
  0x607e: "uoz",
  0x5f8f: "raw-40",
  0x5f97: "raw/256",
  0x605e: "raw*6",
  0x5f8b: "raw*256/100",
  0x605c: "raw*40",
  0x608a: "raw-40",
  0x607a: "raw*12.5/256",
  0x5f6f: "raw-40",
  0x60a3: "raw-40",
  0x5fa5: "raw-40",
  0x5f96: "raw-40",
  0x60fe: "raw/125",
  0x6057: "raw*2.4681/147",
  0x6076: "raw*2.4681/147",
  0x5fa8: "raw/125",
  0x5faa: "raw/125",
  0x60b9: "raw-40",
  0x6063: "raw*25.6",
  0x5ef2: "raw/60",
  0x5ef4: "raw*199.9/41",
  0x60d2: "raw*5/4",
  0x60ab: "raw/100",
  0x606d: "raw*50",
  0x5cb4: "raw*95.5/210",
  0x60c8: "raw-40",
  0x60c7: "raw-40",
  0x5f5f: "raw/5",
  0x5f94: "raw*2.399/209",
  0x60a0: "raw-40",
  0x5f87: "raw*8",
  0x5f8a: "raw-40",
  0x60bd: "raw*0.0752/234",
  0x5f85: "raw*8",
  0x5f86: "raw*8",
  0x5f7d: "raw-40",
  0x5f7e: "raw-40",
  0x5f7f: "raw/91.55",
  0x5f80: "raw/91.55",
  0x5f1c: "raw*40",
  0x5efe: "raw",
  0x5eff: "raw",
  0x5f8d: "raw*5.12",
  0x6064: "raw",
  0x6072: "raw",
  0x60f8: "i8",
  0x608f: "raw*125",
  0x6090: "raw*125",
  0x60f7: "raw-40",
  0x6091: "raw/3840",
  0x6092: "raw/19660",
  0x5f51: "raw*5/256",
  0x5f70: "raw-40",
  0x60e0: "raw*30",
  0x5f50: "raw/16",
  0x5fa6: "raw*5/256",
  0x5fb9: "raw",
  0x60b1: "raw*5/256",
  0x60b2: "raw*5/256",
  0x60b5: "raw",
  0x5f0b: "raw*5/256",
  0x5f0c: "raw*5/256"
};

function formulaFromDoubles(d) {
  d = d || [];
  if (near(d, 150) && near(d, 40) && near(d, 5)) return "raw*5-40";
  if (near(d, 150) && near(d, 40) && !near(d, 5)) return "raw-40";
  if (d.length >= 3 && near(d, 40) && near(d, 1) && !near(d, 5) && !near(d, 150)) return "raw-40";
  if (d.length === 2 && near(d, 1) && near(d, 40)) return "raw*40";
  if (d.length === 2 && near(d, 1) && near(d, 8)) return "raw*8";
  if (near(d, 25.6) && near(d, 1) && !near(d, 6)) return "raw*25.6";
  if (near(d, 2) && near(d, 50)) return "raw*25";
  if (d.length === 2 && near(d, 1) && near(d, 50)) return "raw*50";
  if (d.length === 2 && near(d, 100) && near(d, 1)) return "raw/100";
  if (d.length === 2 && near(d, 60) && near(d, 1)) return "raw/60";
  if (d.length === 2 && near(d, 640) && near(d, 1)) return "raw/640";
  if (near(d, 91.55) && near(d, 1)) return "raw/91.55";
  if (near(d, 88.2) && near(d, 16)) return "raw*16/88.2";
  if (near(d, 14.7) && near(d, 256)) return "raw*14.7/128";
  if (near(d, 2.871094) && near(d, 256)) return "raw*2.871094/256";
  if (near(d, 131072)) return "raw*2.871094";
  if (near(d, 2.55) && near(d, 1)) return "raw/2.55";
  if (near(d, 100) && near(d, 256)) return "raw*100/256";
  if (near(d, 256) && near(d, 5)) return "raw*5/256";
  if (near(d, 48) && near(d, 1)) return "raw/48";
  if (near(d, 0.093)) return "raw*0.093";
  if (near(d, 0.02) && near(d, 1)) return "raw*0.02";
  if (d.length === 2 && near(d, 1) && near(d, 0.2)) return "raw*0.2";
  if (d.length === 2 && near(d, 1) && near(d, 0.1)) return "raw*0.1";
  if (near(d, 256) && near(d, 1)) return "raw/256";
  if (near(d, 64) && near(d, 1)) return "raw/64";
  if (near(d, 16) && near(d, 1)) return "raw/16";
  if (near(d, 10) && near(d, 1)) return "raw*10";
  if (near(d, 30) && near(d, 1)) return "raw*30";
  if (near(d, 5) && near(d, 1)) return "raw/5";
  if (near(d, 4) && near(d, 1)) return "raw/4";
  if (near(d, 2) && near(d, 1)) return "raw/2";
  if (d.length === 2 && near(d, 1) && Math.abs(d[0] - 1) < 1e-6 && Math.abs(d[1] - 1) < 1e-6) return "raw";
  return null;
}

function physValue(raw, item) {
  var addr = item && item.addr;
  if (addr != null && KNOWN[addr]) {
    var kn = ok(raw, KNOWN[addr]);
    if (kn) return kn;
  }
  var fromD = formulaFromDoubles(item.doubles || []);
  if (fromD) {
    var dd = ok(raw, fromD);
    if (dd) return dd;
  }
  if (typeof Corrections !== "undefined" && item && addr != null && typeof hexYX === "function") {
    var rec = Corrections.find(item.name, "0x" + hexYX(addr).addr);
    if (rec && rec.formulaGuess) {
      var cv = ok(raw, rec.formulaGuess);
      if (cv) {
        cv.verified = true;
        return cv;
      }
    }
  }
  var unit = (item && item.unit) || "";
  if (hasUnit(unit, /\u0448\u0430\u0433/i)) return { value: raw, verified: false, formula: "raw" };
  return { value: raw, verified: false, formula: "raw" };
}

function alfCell(raw) {
  return (raw * 14.7) / 128;
}
