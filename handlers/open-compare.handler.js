function openCompare(u8, name) {
  if (!state.bin || !state.map) {
    if (typeof setStatus === "function") setStatus("сначала открой прошивку и карту");
    return;
  }
  state.compareBin = u8;
  state.compareName = name || "compare.bin";
  state.compareOnly = true;
  if (typeof refreshCompareUi === "function") refreshCompareUi();
  if (typeof applySearch === "function") applySearch((document.getElementById("search") || {}).value || "");
  else if (typeof refreshTree === "function") refreshTree();
  if (state.selected && typeof selectNode === "function") selectNode(state.selected);
  if (typeof persistSession === "function") persistSession();
}

function promptOpenCompare() {
  var el = document.getElementById("file-compare");
  if (!el) return;
  el.value = "";
  el.click();
}
