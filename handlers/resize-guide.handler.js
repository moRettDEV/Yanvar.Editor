var GUIDE_MIN_W = 260;

function guideMaxWidth() {
  return Math.max(GUIDE_MIN_W, window.innerWidth - 640);
}

function applyGuideWidth(px) {
  var pane = document.getElementById("guide-pane");
  if (!pane) return;
  var w = Math.round(Math.min(guideMaxWidth(), Math.max(GUIDE_MIN_W, px)));
  pane.style.flexBasis = w + "px";
  pane.style.width = w + "px";
  pane.style.maxWidth = "none";
}

function persistGuideWidth() {
  var pane = document.getElementById("guide-pane");
  if (!pane) return;
  try { localStorage.setItem("yanvar-guide-w", String(Math.round(pane.getBoundingClientRect().width))); } catch (e) {}
}

function restoreGuideWidth() {
  var saved = 0;
  try { saved = parseInt(localStorage.getItem("yanvar-guide-w") || "0", 10) || 0; } catch (e) {}
  applyGuideWidth(saved >= GUIDE_MIN_W ? saved : GUIDE_MIN_W);
}
