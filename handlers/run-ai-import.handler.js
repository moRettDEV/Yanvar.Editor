function runAiImport(bytes, name) {
  if (!state.bin || !state.map) return;
  var items;
  try {
    items = parseAiImport(bytes, name);
  } catch (e) {
    if (typeof setStatus === "function") setStatus("ИИ-импорт: " + (e.message || "не разобрать файл"));
    return;
  }
  var ok = 0, skip = 0, i;
  for (i = 0; i < items.length; i++) {
    if (applyAiPatch(items[i])) ok++;
    else skip++;
  }
  if (typeof selectNode === "function" && state.selected) selectNode(state.selected);
  else if (typeof refreshTree === "function") refreshTree();
  if (typeof refreshDirtyUi === "function") refreshDirtyUi();
  if (typeof persistSession === "function") persistSession();
  if (typeof setStatus === "function") {
    setStatus("ИИ-импорт ← " + (name || "файл") + "  записано " + ok + (skip ? "  ·  пропуск " + skip : ""));
  }
}
