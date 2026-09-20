function isGuideOpen() {
  var app = document.getElementById("app");
  return !!(app && app.classList.contains("guide-on"));
}

function setGuideOpen(on) {
  var app = document.getElementById("app");
  var pane = document.getElementById("guide-pane");
  var btn = document.getElementById("guide-btn");
  var frame = document.getElementById("guide-frame");
  if (typeof closeFileMenu === "function") closeFileMenu();
  if (app) app.classList.toggle("guide-on", !!on);
  if (pane) pane.hidden = !on;
  if (btn) {
    btn.setAttribute("aria-pressed", on ? "true" : "false");
    btn.classList.toggle("on", !!on);
  }
  if (on && frame && !frame.getAttribute("src")) {
    frame.setAttribute("src", "/guide/index.html");
  }
  try { localStorage.setItem("yanvar-guide", on ? "1" : "0"); } catch (e) {}
}

function toggleGuide() {
  setGuideOpen(!isGuideOpen());
}
