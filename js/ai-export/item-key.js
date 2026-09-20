function aiItemKey(item) {
  if (!item) return "";
  return [item.kind || "", item.addr == null ? "" : item.addr, item.name || "", item.bit == null ? "" : item.bit].join("|");
}
