function closeAiExport() {
  var dlg = document.getElementById("ai-export-dlg");
  if (dlg) dlg.hidden = true;
}

function ensureAiExportDlg() {
  var dlg = document.getElementById("ai-export-dlg");
  if (dlg) return dlg;
  dlg = document.createElement("div");
  dlg.id = "ai-export-dlg";
  dlg.className = "ai-dlg";
  dlg.hidden = true;
  dlg.innerHTML = ""
    + "<div class=\"ai-dlg-card\">"
    + "<h2>Экспорт прошивки для ИИ</h2>"
    + "<fieldset><legend>Область</legend>"
    + "<label><input type=\"radio\" name=\"ai-scope\" value=\"all\" checked> Вся прошивка</label>"
    + "<label><input type=\"radio\" name=\"ai-scope\" value=\"params\"> Выбранные параметры</label>"
    + "<label><input type=\"radio\" name=\"ai-scope\" value=\"maps\"> Выбранные карты</label>"
    + "<label><input type=\"radio\" name=\"ai-scope\" value=\"addr\"> Диапазон адресов</label>"
    + "</fieldset>"
    + "<div id=\"ai-export-addr\" hidden class=\"ai-addr\">"
    + "<input id=\"ai-addr-from\" placeholder=\"0x0000\" spellcheck=\"false\">"
    + "<span>—</span>"
    + "<input id=\"ai-addr-to\" placeholder=\"0xFFFF\" spellcheck=\"false\">"
    + "</div>"
    + "<div id=\"ai-export-picks\" hidden><div id=\"ai-export-list\"></div></div>"
    + "<fieldset><legend>Формат</legend>"
    + "<label><input type=\"radio\" name=\"ai-mode\" value=\"described\" checked> С описанием</label>"
    + "<label><input type=\"radio\" name=\"ai-mode\" value=\"brief\"> Без описания</label>"
    + "</fieldset>"
    + "<fieldset><legend>Файл</legend>"
    + "<label><input type=\"radio\" name=\"ai-fmt\" value=\"json\" checked> JSON</label>"
    + "<label><input type=\"radio\" name=\"ai-fmt\" value=\"md\"> Markdown</label>"
    + "<label><input type=\"radio\" name=\"ai-fmt\" value=\"txt\"> TXT</label>"
    + "</fieldset>"
    + "<div class=\"ai-dlg-actions\">"
    + "<button type=\"button\" id=\"ai-export-cancel\">Закрыть</button>"
    + "<button type=\"button\" class=\"on\" id=\"ai-export-go\">Экспортировать</button>"
    + "</div></div>";
  document.body.appendChild(dlg);
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg) closeAiExport();
  });
  document.getElementById("ai-export-cancel").addEventListener("click", closeAiExport);
  document.getElementById("ai-export-go").addEventListener("click", runAiExport);
  dlg.addEventListener("change", function (e) {
    if (e.target && e.target.name === "ai-scope") syncAiExportScopeUi();
  });
  return dlg;
}

function openAiExport() {
  if (!state.bin || !state.map) return;
  var dlg = ensureAiExportDlg();
  var picked = defaultAiPickedKeys();
  var sel = state.selected;
  if (sel && sel.kind === "table") {
    var maps = dlg.querySelector("input[name=ai-scope][value=maps]");
    if (maps) maps.checked = true;
  } else if (Object.keys(picked).length) {
    var pars = dlg.querySelector("input[name=ai-scope][value=params]");
    if (pars) pars.checked = true;
  }
  syncAiExportScopeUi();
  dlg.hidden = false;
}
