var guideDepth = 0;
var guideBacking = false;

function canGuideBack() {
  return guideDepth > 0;
}

function refreshGuideBack() {
  var btn = document.getElementById("guide-back");
  if (!btn) return;
  btn.disabled = !canGuideBack();
}

function onGuideFrameLoad() {
  if (guideBacking) {
    guideBacking = false;
    if (guideDepth > 0) guideDepth -= 1;
  } else if (document.getElementById("guide-frame").dataset.nav === "1") {
    guideDepth += 1;
  } else {
    document.getElementById("guide-frame").dataset.nav = "1";
    guideDepth = 0;
  }
  refreshGuideBack();
}

function guideBack() {
  var frame = document.getElementById("guide-frame");
  if (!canGuideBack() || !frame || !frame.contentWindow) return;
  guideBacking = true;
  frame.contentWindow.history.back();
}
