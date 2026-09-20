function aiUnknown() {
  return "unknown";
}

function aiFirmwareContext() {
  var fw = state.fwDetect || {};
  var bin = state.bin;
  return {
    ecu: fw.label || aiUnknown(),
    firmware: fw.id || aiUnknown(),
    firmware_family: state.mapFamily || aiUnknown(),
    checksum: aiUnknown(),
    file_name: state.filesName || aiUnknown(),
    file_size: bin ? bin.length : 0,
    map_name: state.mapName || aiUnknown(),
    architecture: fw.id && /^J5/.test(fw.id) ? "January 5.1"
      : fw.id && /^J7/.test(fw.id) ? "January 7"
      : aiUnknown(),
    editor: "Январь.редактор",
    editor_version: "5.1.0",
    export_version: 1,
    compare_file: state.compareName || null,
    dirty_bytes: typeof countDirtyBytes === "function" ? countDirtyBytes() : 0
  };
}
