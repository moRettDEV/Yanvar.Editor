function openBin(u8, name) {
  state.bin = u8;
  state.origBin = typeof cloneU8 === "function" ? cloneU8(u8) : new Uint8Array(u8);
  state.filesName = name || "firmware.bin";
  state.binDirty = false;
  state.selected = null;
  state.compareBin = null;
  state.compareName = "";
  state.compareOnly = false;
  state.mapBuf = null;
  state.map = null;
  state.mapName = "";
  if (typeof attachBundledMap === "function") {
    attachBundledMap();
    return;
  }
  if (typeof refreshOpenHint === "function") refreshOpenHint();
  if (typeof refreshDirtyUi === "function") refreshDirtyUi();
  if (typeof persistSession === "function") persistSession();
}
