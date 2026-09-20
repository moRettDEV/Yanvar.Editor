function toggleFlag(item) {
  if (!state.bin || !item || item.kind !== "flag") return null;
  var next = !flagOn(state.bin, item);
  setFlag(state.bin, item, next);
  var hx = hexYX(item.addr);
  var rec = {
    name: item.name,
    kind: "flag",
    addr: "0x" + hx.addr,
    addrNum: item.addr,
    raw: state.bin[item.addr],
    bit: item.bit || 0,
    width: 1,
    ctpValue: next ? 1 : 0,
    viewerValue: next ? 1 : 0,
    source: "edit",
    formulaGuess: "bit",
    verified: true,
    binSize: state.bin.length
  };
  Corrections.save(rec).then(function () {
    if (typeof onCorrectionSaved === "function") onCorrectionSaved();
  });
  state.binDirty = true;
  persistSession();
  return next;
}
