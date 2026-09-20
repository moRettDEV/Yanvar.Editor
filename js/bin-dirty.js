function markBinDirty() {
  state.binDirty = countDirtyBytes() > 0;
  if (typeof persistSession === "function") persistSession();
  if (typeof refreshDirtyUi === "function") refreshDirtyUi();
}

var treeTimer = 0;
function refreshDirtyUi() {
  var n = countDirtyBytes();
  state.binDirty = n > 0;
  var save = document.getElementById("download-bin");
  var revert = document.getElementById("revert-bin");
  var menuBtn = document.getElementById("file-menu-btn");
  if (save) save.disabled = !state.bin;
  var aiBtn = document.getElementById("ai-export-btn");
  if (aiBtn) aiBtn.disabled = !state.bin || !state.map;
  if (revert) revert.disabled = !n;
  if (menuBtn) menuBtn.classList.toggle("dirty", !!n);
  if (typeof refreshOpenGate === "function") refreshOpenGate();
  if (typeof setStatus === "function") {
    var base = state.filesName ? state.filesName : "нет bin";
    var map = state.mapName ? " + " + state.mapName : "";
    var cmp = state.compareName ? "  ·  ср. " + state.compareName : "";
    setStatus(base + map + cmp + (n ? "  ·  изменено " + n + " байт" : ""));
    if (typeof refreshCompareUi === "function") refreshCompareUi();
  }
  if (typeof refreshTree === "function") {
    clearTimeout(treeTimer);
    treeTimer = setTimeout(refreshTree, 280);
  }
}

function applyThemePlots() {
  if (typeof PLOT_BLUE !== "undefined") PLOT_BLUE = "#c4b5fd";
  if (typeof PLOT_GREEN !== "undefined") PLOT_GREEN = "#a78bfa";
}

function heatColor(v, lo, hi) {
  var t = (v - lo) / (hi - lo);
  if (t < 0) t = 0;
  if (t > 1) t = 1;
  var r, g, b;
  if (t < 0.5) {
    var u = t * 2;
    r = 24 + 80 * u;
    g = 24 + 48 * u;
    b = 40 + 120 * u;
  } else {
    var u2 = (t - 0.5) * 2;
    r = 104 + 92 * u2;
    g = 72 + 67 * u2;
    b = 160 + 50 * u2;
  }
  return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
}
