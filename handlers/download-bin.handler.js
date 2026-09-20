function downloadBin() {
  if (!state.bin) return;
  var asked = window.prompt("Имя файла прошивки", typeof suggestBinName === "function" ? suggestBinName() : "firmware.bin");
  if (asked == null) return;
  var name = String(asked).trim();
  if (!name) return;
  if (!/\.bin$/i.test(name)) name += ".bin";
  var blob = new Blob([state.bin], { type: "application/octet-stream" });
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
  if (typeof applySavedBinName === "function") applySavedBinName(name);
  if (typeof setStatus === "function") setStatus("bin → " + name + "  " + state.bin.length + " байт");
}
