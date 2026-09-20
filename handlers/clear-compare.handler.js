function clearCompare() {
  state.compareBin = null;
  state.compareName = "";
  state.compareOnly = false;
  if (typeof refreshCompareUi === "function") refreshCompareUi();
  if (typeof applySearch === "function") applySearch((document.getElementById("search") || {}).value || "");
  else if (typeof refreshTree === "function") refreshTree();
  if (state.selected && typeof selectNode === "function") selectNode(state.selected);
  if (typeof persistSession === "function") persistSession();
}
