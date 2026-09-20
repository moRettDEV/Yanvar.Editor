function invertBySearch(phys, toPhys, width) {
  var max = width === 2 ? 65535 : 255;
  var best = 0;
  var bestD = Infinity;
  var r, d;
  for (r = 0; r <= max; r++) {
    d = Math.abs(toPhys(r) - phys);
    if (d < bestD) {
      bestD = d;
      best = r;
      if (d < 1e-12) return r;
    }
  }
  return best;
}

function invertFormula(phys, formula, width) {
  if (phys == null || !isFinite(phys)) return null;
  width = width === 2 ? 2 : 1;
  if (formula == null || formula === "" || formula === "?" || formula === "bit" || formula === "pin") {
    return clampRaw(phys, width);
  }
  if (formula === "i8") return signedToU8(phys);
  if (typeof Z_PRESETS !== "undefined" && Z_PRESETS[formula]) {
    return invertPreset(phys, formula, width);
  }
  var expr = String(formula).replace(/,/g, ".").replace(/\s+/g, "");
  var m;
  m = /^(\d+(?:\.\d+)?)\/raw$/i.exec(expr);
  if (m) return phys ? clampRaw(Number(m[1]) / phys, width) : 1;
  m = /^raw\*(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/i.exec(expr);
  if (m) return clampRaw((phys + Number(m[2])) / Number(m[1]), width);
  m = /^raw\*(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/i.exec(expr);
  if (m) return clampRaw(phys * Number(m[2]) / Number(m[1]), width);
  m = /^raw\/(\d+(?:\.\d+)?)$/i.exec(expr);
  if (m) return clampRaw(phys * Number(m[1]), width);
  m = /^raw\*(\d+(?:\.\d+)?)$/i.exec(expr);
  if (m) return clampRaw(phys / Number(m[1]), width);
  m = /^raw-(\d+(?:\.\d+)?)$/i.exec(expr);
  if (m) return clampRaw(phys + Number(m[1]), width);
  if (/^raw$/i.test(expr)) return clampRaw(phys, width);
  if (typeof applyFormula === "function") {
    return invertBySearch(phys, function (r) { return applyFormula(r, formula); }, width);
  }
  return clampRaw(phys, width);
}
