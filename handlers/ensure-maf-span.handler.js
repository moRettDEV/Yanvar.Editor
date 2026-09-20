function mafCteRawAt(i) {
  var kg = typeof MAF_CTE_KG !== "undefined" && MAF_CTE_KG[i] != null ? MAF_CTE_KG[i] : 0;
  var raw = Math.round(kg * 10 + 1000);
  if (raw < 0) raw = 0;
  if (raw > 65535) raw = 65535;
  return raw;
}

function mafPadBin(bin, item) {
  if (!bin || !item || item.addr == null) return bin;
  if (typeof applyMafCalib === "function") applyMafCalib(item);
  var need = item.addr + 512;
  if (bin.length >= need) return bin;
  var out = new Uint8Array(need);
  out.set(bin);
  var i, a, raw;
  for (i = 0; i < 256; i++) {
    a = item.addr + i * 2;
    if (a + 1 < bin.length) continue;
    raw = mafCteRawAt(i);
    out[a] = raw & 255;
    out[a + 1] = (raw >> 8) & 255;
  }
  return out;
}

function findMafItem(list) {
  if (!list || typeof isMafCalib !== "function") return null;
  var i;
  for (i = 0; i < list.length; i++) if (isMafCalib(list[i])) return list[i];
  return null;
}

function ensureMafSpan() {
  var item = findMafItem(state.map && state.map.entries);
  if (!item) return;
  if (state.bin) state.bin = mafPadBin(state.bin, item);
  if (state.origBin) state.origBin = mafPadBin(state.origBin, item);
  if (state.compareBin) state.compareBin = mafPadBin(state.compareBin, item);
}
