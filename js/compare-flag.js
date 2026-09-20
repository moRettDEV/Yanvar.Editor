function markFlagCompare(row, item) {
  if (!row || !item) return;
  row.classList.remove("cmp-diff", "cmp-other");
  var old = row.querySelector("em.cmp-flag-lab");
  if (old) old.remove();
  if (typeof hasCompare !== "function" || !hasCompare()) return;
  if (item.kind !== "flag" || typeof flagOn !== "function") return;
  var here = flagOn(state.bin, item);
  var there = flagOn(state.compareBin, item);
  if (here === there) return;
  row.classList.add("cmp-diff");
  var em = document.createElement("em");
  em.className = "cmp-flag-lab";
  em.textContent = "в " + (typeof plotFileLabel === "function" ? plotFileLabel("cmp") : "той") + (there ? ": вкл" : ": выкл");
  row.appendChild(em);
}

function markPinRowCompare(row, item, value) {
  if (!row || !item || typeof hasCompare !== "function" || !hasCompare()) return;
  row.classList.remove("cmp-diff", "cmp-other");
  var here = readRaw(state.bin, item) || 0;
  var there = readRaw(state.compareBin, item) || 0;
  if (here === there) return;
  if (here === value) row.classList.add("cmp-diff");
  if (there === value) row.classList.add("cmp-other");
}

(function wrapFlagCompare() {
  if (typeof bindFlagToggle === "function") {
    var prevBind = bindFlagToggle;
    bindFlagToggle = function (row, item, lab) {
      prevBind(row, item, lab);
      markFlagCompare(row, item);
      var click = row.onclick;
      row.onclick = function () {
        if (click) click();
        markFlagCompare(row, item);
      };
    };
  }
  if (typeof addPinRow === "function") {
    var prevPin = addPinRow;
    addPinRow = function (list, item, label, value, on, view) {
      prevPin(list, item, label, value, on, view);
      markPinRowCompare(list.lastElementChild, item, value);
    };
  }
})();
