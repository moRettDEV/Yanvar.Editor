function openMap(u8, name) {
  if (!state.bin) {
    if (typeof setStatus === "function") setStatus("сначала открой прошивку .bin");
    if (typeof refreshOpenHint === "function") refreshOpenHint();
    return;
  }
  state.mapBuf = u8;
  state.mapName = name || "map.j5";
  if (typeof tryParse === "function") tryParse();
}

function promptOpenBin() {
  var el = document.getElementById("file-bin");
  if (!el) return;
  el.value = "";
  el.click();
}

function promptOpenMap() {
  if (!state.bin) return;
  var el = document.getElementById("file-map");
  if (!el) return;
  el.value = "";
  el.click();
}
