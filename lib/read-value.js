function readRaw(bin, item) {
  if (!bin || item.addr == null || item.addr >= bin.length) return null;
  if (item.width === 2 && item.addr + 1 < bin.length) {
    return bin[item.addr] | (bin[item.addr + 1] << 8);
  }
  return bin[item.addr];
}

function hexYX(addr) {
  var y = addr & ~0xf;
  var x = addr & 0xf;
  return {
    y: y.toString(16).toUpperCase().padStart(6, "0"),
    x: x.toString(16).toUpperCase().padStart(2, "0"),
    addr: addr.toString(16).toUpperCase().padStart(4, "0")
  };
}

function cellRaw(bytes, i, item) {
  var w = (item && item.width) || 1;
  if (w === 2) {
    var o = i * 2;
    if (!bytes || o + 1 >= bytes.length) return null;
    return bytes[o] | (bytes[o + 1] << 8);
  }
  return bytes && i < bytes.length ? bytes[i] : null;
}

function tablePayload(bin, addr, n, wrap) {
  if (!bin || addr == null || n < 1) return new Uint8Array(0);
  if (addr + n <= bin.length) return bin.subarray(addr, addr + n);
  var out = new Uint8Array(n);
  var first = Math.max(0, bin.length - addr);
  if (first > 0) out.set(bin.subarray(addr), 0);
  if (wrap && n > first) out.set(bin.subarray(0, Math.min(bin.length, n - first)), first);
  return out;
}

function tableBytes(bin, item, all) {
  var addrs = all
    .filter(function (e) {
      return e.addr != null && e.kind !== "folder" && e.kind !== "flag" && e.kind !== "label" && e.kind !== "pin";
    })
    .map(function (e) { return e.addr; })
    .sort(function (a, b) { return a - b; });
  var next = bin.length;
  for (var i = 0; i < addrs.length; i++) {
    if (addrs[i] > item.addr) {
      next = addrs[i];
      break;
    }
  }
  var n = Math.max(1, Math.min(4096, next - item.addr));
  var cellW = item.width || 1;
  var want = 0;
  if (item.rows >= 2 && item.cols >= 2) want = item.rows * item.cols * cellW;
  else if (item.cols >= 2 && item.cols <= 256 && (!item.rows || item.rows <= 1)) want = item.cols * cellW;
  if (want) {
    var pastEnd = item.addr + want > bin.length;
    if (want <= n || item.wrap || pastEnd) n = Math.min(4096, want);
  }
  var live = bin && item.addr != null ? Math.max(0, bin.length - item.addr) : n;
  if (!item.wrap && n > live) n = Math.max(live, 0);
  if (n < 1) n = 1;
  var bytes = tablePayload(bin, item.addr, n, false);
  var size = n;
  if (typeof isMafCalib === "function" && isMafCalib(item)) size = 512;
  return { bytes: bytes, size: size };
}

function flagOn(bin, item) {
  if (!bin || item.addr == null || item.addr >= bin.length) return false;
  return ((bin[item.addr] >> (item.bit || 0)) & 1) === 1;
}

function setFlag(bin, item, on) {
  if (!bin || item.addr == null || item.addr >= bin.length) return false;
  var mask = 1 << (item.bit || 0);
  if (on) bin[item.addr] |= mask;
  else bin[item.addr] &= ~mask;
  return flagOn(bin, item);
}

function guessGrid(size) {
  if (size % 16 === 0 && size >= 16) return { rows: size / 16, cols: 16 };
  if (size % 8 === 0 && size >= 8) return { rows: size / 8, cols: 8 };
  return { rows: 1, cols: size };
}
