function setPin(item, raw) {
  if (!state.bin || !item || item.kind !== "pin" || item.addr == null) return null;
  raw = raw | 0;
  if (raw < 0) raw = 0;
  if (raw > 255) raw = 255;
  state.bin[item.addr] = raw;
  var hx = hexYX(item.addr);
  var rec = {
    name: item.name,
    kind: "pin",
    addr: "0x" + hx.addr,
    addrNum: item.addr,
    raw: raw,
    width: 1,
    ctpValue: raw,
    viewerValue: raw,
    source: "edit",
    formulaGuess: "pin",
    verified: true,
    binSize: state.bin.length
  };
  Corrections.save(rec).then(function () {
    if (typeof onCorrectionSaved === "function") onCorrectionSaved();
  });
  state.binDirty = true;
  persistSession();
  return raw;
}
