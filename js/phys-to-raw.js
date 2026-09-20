function invertTablePhys(phys, item) {
  var w = item && item.width === 2 ? 2 : 1;
  var kn = typeof knownTableZ === "function" ? knownTableZ(item) : null;
  if (item && item.layout && item.layout.z && item.layout.z !== "auto") kn = item.layout.z;
  if (kn && typeof invertPreset === "function") {
    var fromP = invertPreset(phys, kn, w);
    if (fromP != null) return fromP;
  }
  if (typeof tableScale === "function") {
    var scale = tableScale(item);
    if (scale && typeof scale.toPhys === "function") {
      return invertBySearch(phys, scale.toPhys, w);
    }
  }
  return clampRaw(phys, w);
}

function physToRaw(phys, item) {
  if (phys == null || !isFinite(phys) || !item) return null;
  if (item.kind === "table" || (item.cols >= 2 && item.kind !== "scalar")) {
    return invertTablePhys(phys, item);
  }
  var raw0 = typeof state !== "undefined" && state.bin ? readRaw(state.bin, item) : 0;
  var info = typeof physValue === "function" ? physValue(raw0 == null ? 0 : raw0, item) : null;
  var formula = info && info.formula ? info.formula : "raw";
  return invertFormula(phys, formula, item.width === 2 ? 2 : 1);
}
