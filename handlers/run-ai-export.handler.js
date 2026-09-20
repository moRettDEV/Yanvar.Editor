function readAiExportForm() {
  var dlg = document.getElementById("ai-export-dlg");
  if (!dlg) return null;
  var scope = (dlg.querySelector("input[name=ai-scope]:checked") || {}).value || "all";
  var mode = (dlg.querySelector("input[name=ai-mode]:checked") || {}).value || "described";
  var fileFmt = (dlg.querySelector("input[name=ai-fmt]:checked") || {}).value || "json";
  var keys = {};
  var boxes = dlg.querySelectorAll("#ai-export-list input[type=checkbox]");
  var i;
  for (i = 0; i < boxes.length; i++) if (boxes[i].checked) keys[boxes[i].value] = true;
  return {
    scope: scope,
    mode: mode,
    fileFmt: fileFmt,
    addrFrom: (document.getElementById("ai-addr-from") || {}).value,
    addrTo: (document.getElementById("ai-addr-to") || {}).value,
    keys: keys
  };
}

function runAiExport() {
  if (!state.bin || !state.map) return;
  var opts = readAiExportForm();
  if (!opts) return;
  var payload = buildAiPayload(opts);
  if (!payload.items.length) {
    if (typeof setStatus === "function") setStatus("нечего экспортировать — уточни область");
    return;
  }
  var text = formatAiExport(payload, opts.fileFmt);
  var name = suggestAiExportName(opts.fileFmt);
  var bytes = new TextEncoder().encode(text);
  if (window.yanvar && window.yanvar.saveAiExport) {
    window.yanvar.saveAiExport(name, bytes).then(function (path) {
      if (!path) return;
      closeAiExport();
      if (typeof setStatus === "function") setStatus("ИИ-экспорт → " + path + "  " + payload.item_count + " пар.");
    });
    return;
  }
  downloadAiText(name, text);
  closeAiExport();
  if (typeof setStatus === "function") setStatus("ИИ-экспорт → " + name + "  " + payload.item_count + " пар.");
}
