var state = {
  map: null, bin: null, selected: null, filter: "", hits: [], hitI: 0, open: {},
  filesName: "", mapName: "", selAddr: null, selName: "", view3d: false
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
  if (!state.map || !state.filter) {
    state.hits = [];
    cnt.textContent = "";
    refreshTree();
    return;
  }
  state.hits = collectHits(state.map.tree, state.filter);
  cnt.textContent = state.hits.length
    ? state.hits.length + " \u043d\u0430\u0439\u0434\u0435\u043d\u043e"
    : "\u043d\u0435\u0442";
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
    mapBuf: state.mapBuf ? state.mapBuf.buffer.slice(state.mapBuf.byteOffset, state.mapBuf.byteOffset + state.mapBuf.byteLength) : null,
    binName: state.filesName,
    mapName: state.mapName,
    selAddr: state.selAddr,
    selName: state.selName,
    open: state.open || {},
    view3d: !!state.view3d
  });
}

function tryParse() {
  if (!state.mapBuf || !state.bin) return;
  state.map = parseMap(state.mapBuf);
  var n = state.map.entries.length;
  var leaves = state.map.entries.filter(function (e) { return e.kind !== "folder"; }).length;
  setStatus("CTM v" + state.map.ver + "  \u043f\u0443\u043d\u043a\u0442\u043e\u0432 " + n + "  \u0441 \u0430\u0434\u0440\u0435\u0441\u043e\u043c " + leaves + "  bin " + state.bin.length + " \u0431\u0430\u0439\u0442");
  document.title = state.filesName ? "CTP \u2014 " + state.filesName : "CTP viewer";
  var drop = document.getElementById("drop");
  drop.textContent = (state.filesName || "bin") + " + " + (state.mapName || "j5");
  refreshTree();
  var saved = findSavedNode();
  if (saved) selectNode(saved);
  persistSession();
}

function showTransferBar(n) {
  if (document.getElementById("xfer")) return;
  var bar = document.createElement("div");
  bar.id = "xfer";
  bar.className = "xfer";
  var t = document.createElement("span");
  if (n) {
    t.innerHTML = "<b>\u041f\u0440\u0430\u0432\u043e\u043a \u0432 \u044d\u0442\u043e\u043c \u043e\u043a\u043d\u0435: " + n + ".</b> \u042d\u0442\u043e \u043d\u0435 \u043a\u0443\u043a\u0438, \u0430 localStorage \u0444\u0430\u0439\u043b\u0430. \u0421\u043a\u0430\u0447\u0430\u0439 JSON \u0438 \u043a\u0438\u043d\u044c \u0432 \u043e\u043a\u043d\u043e http://127.0.0.1:8765";
  } else {
    t.innerHTML = "<b>\u0412 \u044d\u0442\u043e\u043c \u043e\u043a\u043d\u0435 \u043f\u0440\u0430\u0432\u043e\u043a 0.</b> \u041d\u0443\u0436\u043d\u043e \u0442\u043e \u043e\u043a\u043d\u043e, \u0433\u0434\u0435 \u0442\u044b \u0441\u0438\u0434\u0435\u043b \u0447\u0435\u0440\u0435\u0437 \u0444\u0430\u0439\u043b.";
  }
  var btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "\u0421\u043a\u0430\u0447\u0430\u0442\u044c \u043f\u0440\u0430\u0432\u043a\u0438";
  btn.onclick = function () { Corrections.downloadBackup(); };
  bar.appendChild(t);
  bar.appendChild(btn);
  var app = document.getElementById("app");
  app.insertBefore(bar, document.getElementById("main"));
}

function onFiles(list) {
  var jobs = [];
  var names = [];
  for (var i = 0; i < list.length; i++) {
    (function (f) {
      names.push(f.name);
      jobs.push(
        f.arrayBuffer().then(function (ab) {
          var u8 = new Uint8Array(ab);
          var name = f.name.toLowerCase();
          if (/\.cte$/i.test(name)) {
            if (typeof applyCteBuf === "function") return applyCteBuf(u8, f.name);
          } else if (/\.json$/i.test(name) || name.indexOf("correction") !== -1) {
            var txt = new TextDecoder("utf-8").decode(u8);
            var list = JSON.parse(txt);
            if (!Array.isArray(list)) list = [];
            return Corrections.importList(list).then(function (res) {
              setStatus("\u043f\u0440\u0430\u0432\u043e\u043a " + Corrections.all().length + (res.file ? " \u2192 data/corrections.json" : " (\u0442\u043e\u043b\u044c\u043a\u043e \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435)"));
              if (state.selected) selectNode(state.selected);
              else refreshTree();
            });
          } else if (name.indexOf(".j5") !== -1) {
            state.mapBuf = u8;
            state.mapName = f.name;
          } else if (name.indexOf(".bin") !== -1) {
            state.bin = u8;
            state.filesName = f.name;
          } else if (u8[0] === 0x43 && u8[1] === 0x54 && u8[2] === 0x4d) {
            state.mapBuf = u8;
            state.mapName = f.name;
          } else {
            state.bin = u8;
            state.filesName = f.name;
          }
        })
      );
    })(list[i]);
  }
  if (!state.filesName) state.filesName = names.filter(function (n) { return /\.bin$/i.test(n); })[0] || names[0] || "";
  Promise.all(jobs).then(tryParse);
}

function init() {
  document.getElementById("status").textContent = "\u043d\u0435\u0442 \u0444\u0430\u0439\u043b\u043e\u0432";
  var drop = document.getElementById("drop");
  var files = document.getElementById("files");
  drop.addEventListener("dragover", function (e) {
    e.preventDefault();
    drop.classList.add("hot");
  });
  drop.addEventListener("dragleave", function () { drop.classList.remove("hot"); });
  drop.addEventListener("drop", function (e) {
    e.preventDefault();
    drop.classList.remove("hot");
    onFiles(e.dataTransfer.files);
  });
  files.addEventListener("change", function () { onFiles(files.files); });
  document.getElementById("dump-corrections").addEventListener("click", function () {
    Corrections.downloadBackup();
  });
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
  Corrections.load().then(function (list) {
    var n = list.length;
    var extra = Corrections.hasServer()
      ? "  corrections.json " + n
      : "  \u0437\u0430\u043f\u0443\u0441\u0442\u0438 start.cmd \u0447\u0442\u043e\u0431\u044b \u044f \u0443\u0432\u0438\u0434\u0435\u043b \u043f\u0440\u0430\u0432\u043a\u0438";
    var el = document.getElementById("status");
    if (el.textContent === "\u043d\u0435\u0442 \u0444\u0430\u0439\u043b\u043e\u0432") el.textContent = extra.trim();
    else el.textContent += extra;
    if (!Corrections.hasServer()) showTransferBar(n);
    el.title = "\u041a\u043b\u0438\u043a \u2014 \u0441\u043a\u0430\u0447\u0430\u0442\u044c corrections.json";
    el.style.cursor = "pointer";
    el.onclick = function () { Corrections.downloadBackup(); };
    if (state.selected) selectNode(state.selected);
    else refreshTree();
  });
  SessionFiles.load().then(function (last) {
    if (!last || !last.bin || !last.mapBuf) return;
    state.bin = new Uint8Array(last.bin);
    state.mapBuf = new Uint8Array(last.mapBuf);
    state.filesName = last.binName || "";
    state.mapName = last.mapName || "";
    state.selAddr = last.selAddr;
    state.selName = last.selName || "";
    state.open = last.open && typeof last.open === "object" ? last.open : {};
    state.view3d = !!last.view3d;
    tryParse();
  });
}

function onCorrectionSaved() {
  refreshTree();
  var n = Corrections.all().length;
  var el = document.getElementById("status");
  el.textContent = (el.textContent.replace(/\s*corrections.json \d+/, "") + "  corrections.json " + n).trim();
}

init();
