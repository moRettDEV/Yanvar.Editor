function suggestBinName() {
  var name = String(state.filesName || "firmware.bin").replace(/^.*[\\/]/, "");
  if (!name) name = "firmware.bin";
  if (!/\.bin$/i.test(name)) name += ".bin";
  return name;
}

function applySavedBinName(saved) {
  if (!saved) return;
  state.filesName = String(saved).replace(/^.*[\\/]/, "") || state.filesName;
  if (state.bin && typeof cloneU8 === "function") state.origBin = cloneU8(state.bin);
  state.binDirty = false;
  document.title = (state.filesName || "bin") + " — Январь.редактор";
  if (typeof persistSession === "function") persistSession();
  if (typeof refreshDirtyUi === "function") refreshDirtyUi();
}
