function describeAiItem(row, bin) {
  var item = row.item;
  var rec = {
    name: item.name || aiUnknown(),
    kind: item.kind || aiUnknown(),
    address: item.addr != null && typeof hexYX === "function" ? "0x" + hexYX(item.addr).addr : aiUnknown(),
    address_int: item.addr == null ? null : item.addr,
    folder: row.folder || null,
    type: aiStorageType(item),
    size_bytes: typeof itemByteSpan === "function" ? itemByteSpan(item) : (item.width === 2 ? 2 : 1),
    unit: item.unit || aiUnknown(),
    description: aiUnknown(),
    related: aiRelatedNames(row)
  };
  if (item.kind === "flag") {
    rec.bit = item.bit == null ? 0 : item.bit;
    rec.raw = typeof flagOn === "function" ? (flagOn(bin, item) ? 1 : 0) : null;
    rec.value = rec.raw ? true : false;
    rec.conversion = "bit";
    rec.min = 0;
    rec.max = 1;
  } else if (item.kind === "table") {
    rec.map = describeAiTable(item, bin);
    rec.raw = null;
    rec.value = null;
    rec.conversion = rec.map.conversion;
    rec.min = aiUnknown();
    rec.max = aiUnknown();
  } else {
    rec.raw = typeof readRaw === "function" ? readRaw(bin, item) : null;
    var phys = typeof physValue === "function" ? physValue(rec.raw, item) : { value: rec.raw, formula: "raw" };
    rec.value = phys.value;
    rec.conversion = phys.formula || aiUnknown();
    var rng = typeof ctpRange === "function" ? ctpRange(item) : null;
    rec.min = rng ? rng.min : aiUnknown();
    rec.max = rng ? rng.max : aiUnknown();
  }
  rec.changed_from_file = typeof isItemDirty === "function" ? isItemDirty(item) : false;
  rec.differs_from_compare = typeof isItemDiff === "function" ? isItemDiff(item) : false;
  if (rec.differs_from_compare && state.compareBin && item.kind !== "table") {
    rec.compare_raw = item.kind === "flag"
      ? (flagOn(state.compareBin, item) ? 1 : 0)
      : readRaw(state.compareBin, item);
  }
  return rec;
}

function briefAiItem(full) {
  var o = {
    address: full.address,
    size: full.size_bytes,
    type: full.type,
    raw_value: full.raw
  };
  if (full.kind === "flag") o.bit = full.bit;
  if (full.map) {
    o.dimensions = full.map.dimensions;
    o.raw_values = full.map.values_raw;
  }
  return o;
}
