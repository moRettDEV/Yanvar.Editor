function openAiImport() {
  if (!state.bin || !state.map) return;
  var pick = document.getElementById("file-ai-import");
  if (pick) {
    pick.value = "";
    pick.click();
  }
}

function bindAiImport() {
  var btn = document.getElementById("ai-import-btn");
  var pick = document.getElementById("file-ai-import");
  if (btn) btn.addEventListener("click", openAiImport);
  if (!pick) return;
  pick.addEventListener("change", function () {
    var f = pick.files && pick.files[0];
    if (!f) return;
    f.arrayBuffer().then(function (ab) {
      runAiImport(new Uint8Array(ab), f.name);
    });
  });
}
