function clampRaw(n, width) {
  n = Math.round(Number(n));
  if (!isFinite(n)) n = 0;
  var max = width === 2 ? 65535 : 255;
  if (n < 0) n = 0;
  if (n > max) n = max;
  return n;
}

function writeRawBytes(bin, addr, raw, width) {
  if (!bin || addr == null || addr < 0) return false;
  width = width === 2 ? 2 : 1;
  raw = clampRaw(raw, width);
  if (addr + width - 1 >= bin.length) return false;
  bin[addr] = raw & 0xff;
  if (width === 2) bin[addr + 1] = (raw >> 8) & 0xff;
  return true;
}

function writeMasked(bin, addr, raw, mask) {
  if (!bin || addr == null || addr < 0 || addr >= bin.length) return false;
  raw = clampRaw(raw, 1) & mask;
  bin[addr] = (bin[addr] & ~mask) | raw;
  return true;
}
