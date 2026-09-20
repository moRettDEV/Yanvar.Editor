function mafLiveWords(bin, item) {
  if (!bin || !item || item.addr == null) return 0;
  var w = item.width === 2 ? 2 : 1;
  return Math.floor(liveSpan(bin, item.addr) / w);
}

function mafDisplayTexts(item, bytes, layout, bin) {
  var texts = physTextsFromBin(bytes, layout.rows, layout.cols, item, bin);
  if (typeof fillMafCteText === "function") fillMafCteText(item, texts);
  return texts;
}

function mafCanEditCell(item, index) {
  return typeof cellFits !== "function" || cellFits(state.bin, item, index);
}

function mafGraphOpts(item, layout, texts, compareOverlay) {
  var maf = typeof isMafCalib === "function" && isMafCalib(item);
  var cmp = typeof hasCompare === "function" && hasCompare();
  if (cmp) {
    return {
      overlay: compareOverlay || [],
      hideFlatBlue: false,
      keepOverlay: !!(compareOverlay && compareOverlay.length)
    };
  }
  if (maf) {
    return {
      overlay: typeof overlayRow === "function" ? overlayRow(texts, 0, layout.cols) : [],
      hideFlatBlue: true,
      keepOverlay: true
    };
  }
  return { overlay: [], hideFlatBlue: false, keepOverlay: false };
}

function mafMetaLine(item, pack, layout, bin) {
  var hx = typeof hexYX === "function" ? hexYX(item.addr) : { addr: "" };
  if (typeof isMafCalib !== "function" || !isMafCalib(item)) {
    return "0x" + hx.addr + "  " + layout.rows + "×" + layout.cols + "  " + pack.size + " байт";
  }
  var n = mafLiveWords(bin, item);
  var full = n >= 256;
  return "0x" + hx.addr + "  1×256  " + (full ? "256 слов в файле  ·  0…5 В" : "в файле " + n + " слов  ·  хвост дописан до 256");
}
