function liveSpan(bin, addr) {
  if (!bin || addr == null || addr < 0 || addr >= bin.length) return 0;
  return bin.length - addr;
}

function cellFits(bin, item, index) {
  if (!bin || !item || item.addr == null || index < 0) return false;
  var w = item.width === 2 ? 2 : 1;
  var a = item.addr + index * w;
  return a >= 0 && a + w - 1 < bin.length;
}

function bothFit(aBin, bBin, addr, n) {
  if (!aBin || !bBin || addr == null || addr < 0 || n < 1) return false;
  return addr + n - 1 < aBin.length && addr + n - 1 < bBin.length;
}

(function () {
  if (typeof tablePayload === "function") {
    var prevPayload = tablePayload;
    tablePayload = function (bin, addr, n, wrap) {
      return prevPayload(bin, addr, n, false);
    };
  }

  if (typeof tableBytes === "function") {
    var prevBytes = tableBytes;
    tableBytes = function (bin, item, all) {
      if (item) {
        item.wrap = false;
        if (typeof applyMafCalib === "function") applyMafCalib(item);
      }
      var pack = prevBytes(bin, item, all);
      if (!bin || !item || item.addr == null) return pack;
      var want = pack && pack.size ? pack.size : 1;
      if (typeof isMafCalib === "function" && isMafCalib(item)) want = 512;
      var n = Math.min(want, liveSpan(bin, item.addr));
      return {
        bytes: tablePayload(bin, item.addr, n, false),
        size: typeof isMafCalib === "function" && isMafCalib(item) ? 512 : n
      };
    };
  }

  if (typeof tableCells === "function") {
    var prevCells = tableCells;
    tableCells = function (bytes, rows, cols, item) {
      var pack = prevCells(bytes, rows, cols, item);
      if (!pack || !pack.cells) return pack;
      var w = item && item.width === 2 ? 2 : 1;
      var live = bytes ? bytes.length : 0;
      var i;
      for (i = 0; i < pack.cells.length; i++) {
        if (i * w >= live) {
          pack.cells[i].v = NaN;
          pack.cells[i].raw = null;
        }
      }
      return pack;
    };
  }
})();
