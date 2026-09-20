function bundledMapMiss(family, det) {
  if (det && det.family && det.family !== family) {
    return det.label + " · слайдер «" + familyLabel(family) + "» не тот, смени тип или открой карту";
  }
  if (det && det.label) return det.label + " · открой карту вручную";
  return "карта не нашлась · открой .j5 / .j7";
}

function attachBundledMap() {
  if (!state.bin) return;
  var det = detectFirmware(state.bin, state.filesName);
  state.fwDetect = det;
  var family = state.mapFamily || "trs";
  var hit = matchBundledMap(family, det);
  if (hit) {
    loadBundledMap(hit.file);
    return;
  }
  state.mapBuf = null;
  state.map = null;
  state.mapName = "";
  if (typeof refreshTree === "function") refreshTree();
  if (typeof refreshOpenHint === "function") refreshOpenHint();
  if (typeof refreshDirtyUi === "function") refreshDirtyUi();
  if (typeof setStatus === "function") setStatus(bundledMapMiss(family, det));
}
