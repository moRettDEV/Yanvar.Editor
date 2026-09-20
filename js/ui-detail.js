function renderDetail(item, bin, all) {
  if (typeof EditUndo !== "undefined") EditUndo.unbind();
  var host = document.getElementById("detail");
  host.innerHTML = "";
  if (!item) return;
  var menuItem = item;
  if (item.kind === "folder") {
    var pinHost = typeof folderPinHost === "function" ? folderPinHost(item) : null;
    if (pinHost) {
      if (!pinHost.flagTitle) pinHost.flagTitle = item.name;
      host.appendChild(renderPin(pinHost, bin, item));
    } else if (typeof isBitsFolder === "function" ? isBitsFolder(item)
      : (item.children && item.children.every(function (c) { return c.kind === "flag" || c.kind === "label"; }))) {
      host.appendChild(renderFlagFolder(item, bin));
    } else if (typeof renderFolderPage === "function") {
      host.appendChild(renderFolderPage(item));
    } else {
      host.appendChild(el("h2", "", item.name));
      host.appendChild(el("p", "", (item.children ? item.children.length : 0) + " пунктов"));
    }
  } else if (item.kind === "label") {
    host.appendChild(renderLabel(item));
  } else if (item.kind === "flag") host.appendChild(renderFlag(item, bin));
  else if (item.kind === "pin") host.appendChild(renderPin(item, bin));
  else if (item.kind === "table") host.appendChild(renderTable(item, bin, all));
  else host.appendChild(renderScalar(item, bin));
  if (typeof paintCompareDetail === "function") paintCompareDetail(host, menuItem);
  if (typeof attachItemMenu === "function") attachItemMenu(host, menuItem, { bin: bin });
}
