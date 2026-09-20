function paintAiExportList(picked) {
  var host = document.getElementById("ai-export-list");
  if (!host || !state.map) return;
  host.innerHTML = "";
  var dlg = document.getElementById("ai-export-dlg");
  var scope = ((dlg && dlg.querySelector("input[name=ai-scope]:checked")) || {}).value || "all";
  var rows = walkExportRows(state.map.tree);
  if (scope === "maps") rows = rows.filter(function (r) { return r.item.kind === "table"; });
  if (scope === "params") rows = rows.filter(function (r) { return r.item.kind !== "table"; });
  var i, row, lab, box, key;
  for (i = 0; i < rows.length; i++) {
    row = rows[i];
    key = aiItemKey(row.item);
    lab = document.createElement("label");
    lab.className = "ai-pick";
    box = document.createElement("input");
    box.type = "checkbox";
    box.value = key;
    box.checked = !picked || !!picked[key];
    lab.appendChild(box);
    lab.appendChild(document.createTextNode(
      (row.item.kind === "table" ? "карта  " : "") + (row.item.name || "") +
      (row.folder ? "  ·  " + row.folder : "")
    ));
    host.appendChild(lab);
  }
}

function syncAiExportScopeUi() {
  var dlg = document.getElementById("ai-export-dlg");
  if (!dlg) return;
  var scope = (dlg.querySelector("input[name=ai-scope]:checked") || {}).value || "all";
  var list = document.getElementById("ai-export-picks");
  var addr = document.getElementById("ai-export-addr");
  if (list) list.hidden = scope !== "picked" && scope !== "maps" && scope !== "params";
  if (addr) addr.hidden = scope !== "addr";
  if (!list || list.hidden) return;
  var picked = defaultAiPickedKeys();
  paintAiExportList(Object.keys(picked).length ? picked : null);
}
