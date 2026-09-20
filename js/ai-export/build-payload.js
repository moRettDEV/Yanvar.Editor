function buildAiPayload(opts) {
  var rows = collectAiScope(opts);
  var rich = opts.mode !== "brief";
  var items = rows.map(function (row) {
    var full = describeAiItem(row, state.bin);
    return rich ? full : briefAiItem(full);
  });
  return {
    context: aiFirmwareContext(),
    mode: rich ? "described" : "brief",
    item_count: items.length,
    items: items,
    notes: [
      "Fields marked unknown were not available in the map/parser.",
      "Do not invent ECU hardware that is not listed in context."
    ]
  };
}
