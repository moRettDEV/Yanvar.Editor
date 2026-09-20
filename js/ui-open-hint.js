function refreshOpenGate() {
  var mapItem = document.getElementById("open-map-item");
  var cmpItem = document.getElementById("open-compare-item");
  if (mapItem) mapItem.classList.toggle("off", !state.bin);
  if (cmpItem) cmpItem.classList.toggle("off", !(state.bin && state.map));
}

function refreshOpenHint() {
  refreshOpenGate();
  if (state.bin && state.map) return;
  var host = document.getElementById("detail");
  if (!host) return;
  host.innerHTML = "";
  var box = document.createElement("div");
  box.className = "open-hint";
  var step = el("p", "open-hint-step", state.bin ? "2" : "1");
  var title = el("h2", "", state.bin ? "Карта" : "Открой прошивку");
  var text = el("p", "hint", "");
  var go = document.createElement("button");
  go.type = "button";
  go.className = "open-hint-go";
  box.appendChild(step);
  box.appendChild(title);
  if (!state.bin) {
    text.innerHTML = "Слайдер <b>TRS / LS / Сток</b> сверху. Для TRS карта подхватится сама.";
    go.textContent = "Открыть прошивку";
    go.addEventListener("click", promptOpenBin);
  } else {
    box.appendChild(el("p", "open-hint-file", state.filesName || "прошивка"));
    text.innerHTML = state.fwDetect && state.fwDetect.label
      ? "Определено: <b>" + state.fwDetect.label + "</b>. Карту можно выбрать вручную."
      : "Карта не подошла. Открой <b>.j5 / .j7</b> вручную.";
    go.textContent = "Открыть карту";
    go.addEventListener("click", promptOpenMap);
  }
  box.appendChild(text);
  box.appendChild(go);
  host.appendChild(box);
}
