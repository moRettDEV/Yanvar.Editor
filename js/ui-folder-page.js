function renderFolderPage(item) {
  var wrap = document.createElement("div");
  wrap.className = "ctp-page folder-page";
  var h2 = document.createElement("h2");
  h2.className = "ctp-map-title tight";
  h2.textContent = item.name;
  var list = document.createElement("div");
  list.className = "folder-kids";
  var kids = item.children || [];
  var i, ch, row, nm;
  for (i = 0; i < kids.length; i++) {
    ch = kids[i];
    if (ch.kind === "label") continue;
    row = document.createElement("button");
    row.type = "button";
    row.className = "folder-kid";
    if (typeof iconFor === "function") row.appendChild(iconFor(ch));
    nm = document.createElement("span");
    nm.textContent = ch.name;
    row.appendChild(nm);
    row.addEventListener("click", (function (node) {
      return function () { selectNode(node); };
    })(ch));
    list.appendChild(row);
  }
  wrap.appendChild(h2);
  wrap.appendChild(list);
  return wrap;
}
