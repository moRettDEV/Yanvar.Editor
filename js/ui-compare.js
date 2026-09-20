function plotFileLabel(which) {
  var n = which === "cmp" ? state.compareName : state.filesName;
  n = String(n || (which === "cmp" ? "сравниваемая" : "эта"));
  return n.replace(/^.*[\\/]/, "");
}

function comparePlotOverlay(item, layout, row, all) {
  if (typeof hasCompare !== "function" || !hasCompare() || !item) return [];
  var pack = tableBytes(state.compareBin, item, all || (state.map ? state.map.entries : [item]));
  var texts = physTextsFromBin(pack.bytes, layout.rows, layout.cols, item, state.compareBin);
  return overlayRow(texts, row, layout.cols);
}

function syncPlotLegend(host, mode) {
  if (!host) return;
  var el = host.querySelector(".plot-legend");
  var on = typeof hasCompare === "function" && hasCompare();
  if (!on) {
    if (el) el.hidden = true;
    return;
  }
  if (!el) {
    el = document.createElement("div");
    el.className = "plot-legend";
    host.insertBefore(el, host.firstChild);
  }
  el.hidden = false;
  el.innerHTML = "";
  function add(cls, lab) {
    var s = document.createElement("span");
    s.className = "plot-leg " + cls;
    s.appendChild(document.createElement("i"));
    s.appendChild(document.createTextNode(lab));
    el.appendChild(s);
  }
  add("cur", plotFileLabel("cur"));
  add("cmp", plotFileLabel("cmp"));
  if (mode === "3d") add("diff", "отличия");
}

function refreshCompareUi() {
  var on = typeof hasCompare === "function" && hasCompare();
  var item = document.getElementById("open-compare-item");
  var clear = document.getElementById("clear-compare");
  var chip = document.getElementById("compare-chip");
  if (item) item.classList.toggle("off", !(state.bin && state.map));
  if (clear) clear.hidden = !on;
  if (chip) {
    chip.hidden = !on;
    chip.classList.toggle("on", !!(on && state.compareOnly));
    var n = on && state.map ? countDiffItems(state.map.tree) : 0;
    chip.textContent = on ? (n + " отличий") : "";
  }
}

function bindCompareUi() {
  var chip = document.getElementById("compare-chip");
  var clear = document.getElementById("clear-compare");
  if (chip) {
    chip.addEventListener("click", function () {
      if (!hasCompare()) return;
      state.compareOnly = !state.compareOnly;
      refreshCompareUi();
      if (typeof applySearch === "function") {
        applySearch((document.getElementById("search") || {}).value || "");
      }
    });
  }
  if (clear) clear.addEventListener("click", clearCompare);
}

function paintCompareDetail(host, item) {
  if (!host || !item || typeof hasCompare !== "function" || !hasCompare()) return;
  var bar = document.createElement("p");
  bar.className = "cmp-bar";
  bar.textContent = (state.filesName || "эта") + "  ↔  " + (state.compareName || "та");
  host.insertBefore(bar, host.firstChild);
  if (item.kind === "table" || item.kind === "folder" || !item.kind || item.kind === "scalar") return;
  if (typeof isItemDiff !== "function" || !isItemDiff(item)) return;
  var note = document.createElement("p");
  note.className = "cmp-note";
  if (item.kind === "flag") {
    note.classList.add("cmp-note-flag");
    note.textContent = "в " + plotFileLabel("cmp") + ": " + (flagOn(state.compareBin, item) ? "вкл" : "выкл");
  } else {
    var raw = readRaw(state.compareBin, item);
    var phys = physValue(raw, item);
    note.textContent = "в " + plotFileLabel("cmp") + ": " + (typeof fmtCtp === "function" ? fmtCtp(phys.value) : phys.value);
  }
  host.appendChild(note);
}

function markCompareGrid(grid, item) {
  if (!grid || !item || typeof hasCompare !== "function" || !hasCompare()) return;
  var cells = grid.querySelectorAll("td[data-i]");
  var i, td, idx, w, addr, same, other, k;
  w = item.width === 2 ? 2 : 1;
  for (i = 0; i < cells.length; i++) {
    td = cells[i];
    idx = Number(td.getAttribute("data-i"));
    addr = item.addr + idx * w;
    if (typeof bothFit === "function" && !bothFit(state.bin, state.compareBin, addr, w)) {
      td.classList.remove("cmp");
      td.removeAttribute("title");
      continue;
    }
    same = true;
    for (k = 0; k < w; k++) {
      if (state.bin[addr + k] !== state.compareBin[addr + k]) same = false;
    }
    td.classList.toggle("cmp", !same);
    if (!same) {
      other = physValue(cellRaw(state.compareBin.subarray(addr, addr + w), 0, item), item);
      td.title = "в " + plotFileLabel("cmp") + ": " + (typeof fmtCtp === "function" ? fmtCtp(other.value) : other.value);
    }
  }
}
