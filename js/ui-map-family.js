function paintMapFamily() {
  var host = document.getElementById("family-seg");
  if (!host) return;
  var cur = state.mapFamily || "trs";
  var btns = host.querySelectorAll("[data-family]");
  var i;
  for (i = 0; i < btns.length; i++) {
    var on = btns[i].getAttribute("data-family") === cur;
    btns[i].classList.toggle("on", on);
    btns[i].setAttribute("aria-checked", on ? "true" : "false");
  }
}

function bindMapFamily() {
  var host = document.getElementById("family-seg");
  if (!host || host._bound) return;
  host._bound = true;
  host.addEventListener("click", function (e) {
    var btn = e.target && e.target.closest ? e.target.closest("[data-family]") : null;
    if (btn) setMapFamily(btn.getAttribute("data-family"));
  });
  paintMapFamily();
}
