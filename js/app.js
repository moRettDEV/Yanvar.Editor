var state = {
  map: null, bin: null, origBin: null, selected: null, filter: "", hits: [], hitI: 0, open: {},
  filesName: "", mapName: "", selAddr: null, selName: "", view3d: false, binDirty: false,
  compareBin: null, compareName: "", compareOnly: false,
  mapFamily: "trs", fwDetect: null
};

function setStatus(t) {
  document.getElementById("status").textContent = t;
}

function refreshTree() {
  var tree = document.getElementById("tree");
  var y = tree.scrollTop;
  tree.innerHTML = "";
  if (!state.map) return;
  tree.appendChild(renderTree(state.map.tree, state.filter, state.selected));
  tree.scrollTop = y;
  var on = tree.querySelector(".row.on");
  if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest" });
}

function selectNode(node) {
  state.selected = node;
  state.selAddr = node && node.addr != null ? node.addr : null;
  state.selName = node ? node.name : "";
  if (node && state.map) {
    openTreePath(treePathOf(node, state.map.tree), node.kind === "folder");
  }
  refreshTree();
  renderDetail(node, state.bin, state.map ? state.map.entries : []);
  persistSession();
}

function applySearch(q) {
  state.filter = typeof normQ === "function" ? normQ(q) : String(q || "").toLowerCase();
  state.hitI = 0;
  var cnt = document.getElementById("search-count");
  if (!state.map) {
    state.hits = [];
    cnt.textContent = "";
    refreshTree();
    return;
  }
  var hits = collectHits(state.map.tree, state.filter);
  if (state.compareOnly && typeof isItemDiff === "function") hits = hits.filter(isItemDiff);
  if (!state.filter && !state.compareOnly) hits = [];
  state.hits = hits;
  if (state.filter || state.compareOnly) {
    cnt.textContent = hits.length ? hits.length + (state.compareOnly ? " отличий" : " найдено") : "нет";
  } else cnt.textContent = "";
  refreshTree();
}

function jumpHit(dir) {
  if (!state.hits || !state.hits.length) return;
  state.hitI = (state.hitI + dir + state.hits.length) % state.hits.length;
  selectNode(state.hits[state.hitI]);
}

function findSavedNode() {
  if (!state.map || state.selName == null) return null;
  var list = state.map.entries;
  var i;
  for (i = 0; i < list.length; i++) {
    if (list[i].name === state.selName && (state.selAddr == null || list[i].addr === state.selAddr)) return list[i];
  }
  for (i = 0; i < list.length; i++) {
    if (list[i].name === state.selName) return list[i];
  }
  return null;
}

function persistSession() {
  if (!state.bin && !state.mapBuf) return;
  SessionFiles.save({
    bin: state.bin ? state.bin.buffer.slice(state.bin.byteOffset, state.bin.byteOffset + state.bin.byteLength) : null,
    orig: state.origBin ? state.origBin.buffer.slice(state.origBin.byteOffset, state.origBin.byteOffset + state.origBin.byteLength) : null,
    mapBuf: state.mapBuf ? state.mapBuf.buffer.slice(state.mapBuf.byteOffset, state.mapBuf.byteOffset + state.mapBuf.byteLength) : null,
    binName: state.filesName,
    mapName: state.mapName,
    selAddr: state.selAddr,
    selName: state.selName,
    open: state.open || {},
    view3d: !!state.view3d,
    compare: state.compareBin ? state.compareBin.buffer.slice(state.compareBin.byteOffset, state.compareBin.byteOffset + state.compareBin.byteLength) : null,
    compareName: state.compareName || "",
    compareOnly: !!state.compareOnly,
    mapFamily: state.mapFamily || "trs"
  });
}

function tryParse() {
  if (!state.mapBuf || !state.bin) return;
  state.map = parseMap(state.mapBuf);
  if (!state.origBin) state.origBin = cloneU8(state.bin);
  if (typeof ensureMafSpan === "function") ensureMafSpan();
  document.title = (state.filesName || "bin") + " — Январь.редактор";
  refreshTree();
  var saved = findSavedNode();
  if (saved) selectNode(saved);
  refreshDirtyUi();
  if (typeof refreshCompareUi === "function") refreshCompareUi();
  persistSession();
}

function classifyFile(f, u8) {
  var name = (f.name || "").toLowerCase();
  if (/\.cte$/i.test(name)) return "cte";
  if (/\.j5|\.j7/i.test(name)) return "map";
  if (name.indexOf(".bin") !== -1) return "bin";
  if (u8 && u8[0] === 0x43 && u8[1] === 0x54 && u8[2] === 0x4d) return "map";
  return "bin";
}

function onFiles(list) {
  var files = [];
  var i;
  for (i = 0; i < list.length; i++) files.push(list[i]);
  Promise.all(files.map(function (f) {
    return f.arrayBuffer().then(function (ab) {
      return { file: f, u8: new Uint8Array(ab) };
    });
  })).then(function (items) {
    var bins = [];
    var maps = [];
    var ctes = [];
    items.forEach(function (it) {
      var kind = classifyFile(it.file, it.u8);
      if (kind === "cte") ctes.push(it);
      else if (kind === "map") maps.push(it);
      else bins.push(it);
    });
    if (bins.length) {
      var b = bins[bins.length - 1];
      openBin(b.u8, b.file.name);
    }
    if (maps.length) {
      var m = maps[maps.length - 1];
      openMap(m.u8, m.file.name);
    }
    ctes.forEach(function (c) {
      if (typeof applyCteBuf === "function") applyCteBuf(c.u8, c.file.name);
    });
  });
}

function init() {
  applyThemePlots();
  document.title = "Январь.редактор";
  setStatus("открой прошивку .bin");
  if (typeof refreshOpenHint === "function") refreshOpenHint();
  var app = document.getElementById("app");
  var fileBin = document.getElementById("file-bin");
  var fileMap = document.getElementById("file-map");
  app.addEventListener("dragover", function (e) {
    e.preventDefault();
    app.classList.add("hot");
  });
  app.addEventListener("dragleave", function (e) {
    if (e.relatedTarget && app.contains(e.relatedTarget)) return;
    app.classList.remove("hot");
  });
  app.addEventListener("drop", function (e) {
    e.preventDefault();
    app.classList.remove("hot");
    onFiles(e.dataTransfer.files);
  });
  fileBin.addEventListener("change", function () {
    if (fileBin.files && fileBin.files.length) onFiles(fileBin.files);
  });
  fileMap.addEventListener("change", function () {
    if (fileMap.files && fileMap.files.length) onFiles(fileMap.files);
  });
  var fileCompare = document.getElementById("file-compare");
  fileCompare.addEventListener("change", function () {
    var f = fileCompare.files && fileCompare.files[0];
    if (!f) return;
    f.arrayBuffer().then(function (ab) {
      openCompare(new Uint8Array(ab), f.name);
    });
  });
  if (typeof bindFileMenu === "function") bindFileMenu();
  if (typeof bindGuide === "function") bindGuide();
  if (typeof bindMapFamily === "function") bindMapFamily();
  if (typeof bindCompareUi === "function") bindCompareUi();
  document.getElementById("download-bin").addEventListener("click", downloadBin);
  var aiBtn = document.getElementById("ai-export-btn");
  if (aiBtn) aiBtn.addEventListener("click", openAiExport);
  if (typeof bindAiImport === "function") bindAiImport();
  document.getElementById("revert-bin").addEventListener("click", revertBin);
  var search = document.getElementById("search");
  search.addEventListener("input", function (e) { applySearch(e.target.value); });
  search.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!state.hits.length) applySearch(search.value);
      jumpHit(e.shiftKey ? -1 : 1);
    }
  });
  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      downloadBin();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F")) {
      e.preventDefault();
      search.focus();
      search.select();
    }
    if (e.key === "F3") {
      e.preventDefault();
      jumpHit(e.shiftKey ? -1 : 1);
    }
  });
  window.addEventListener("beforeunload", function (e) {
    if (!state.binDirty) return;
    e.preventDefault();
    e.returnValue = "";
  });
  SessionFiles.load().then(function (last) {
    if (!last || !last.bin) {
      if (typeof refreshOpenHint === "function") refreshOpenHint();
      return;
    }
    state.bin = new Uint8Array(last.bin);
    state.origBin = last.orig ? new Uint8Array(last.orig) : cloneU8(state.bin);
    state.filesName = last.binName || "";
    state.selAddr = last.selAddr;
    state.selName = last.selName || "";
    state.open = last.open && typeof last.open === "object" ? last.open : {};
    state.view3d = !!last.view3d;
    if (last.mapFamily === "ls" || last.mapFamily === "stock" || last.mapFamily === "trs") {
      state.mapFamily = last.mapFamily;
    }
    if (typeof paintMapFamily === "function") paintMapFamily();
    if (last.compare) {
      state.compareBin = new Uint8Array(last.compare);
      state.compareName = last.compareName || "";
      state.compareOnly = !!last.compareOnly;
    }
    if (last.mapBuf) {
      state.mapBuf = new Uint8Array(last.mapBuf);
      state.mapName = last.mapName || "";
      tryParse();
      return;
    }
    if (typeof attachBundledMap === "function") {
      attachBundledMap();
      return;
    }
    if (typeof refreshOpenHint === "function") refreshOpenHint();
    if (typeof refreshDirtyUi === "function") refreshDirtyUi();
  });
}

init();
