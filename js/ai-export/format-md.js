function aiMdBlock(title, rec) {
  var lines = ["### " + title, ""];
  Object.keys(rec).forEach(function (k) {
    if (k === "map" || k === "related" || k === "values_raw" || k === "values_phys") return;
    var v = rec[k];
    if (v && typeof v === "object") return;
    lines.push("- **" + k + ":** " + (v == null ? "unknown" : v));
  });
  return lines.join("\n");
}

function formatAiMarkdown(payload) {
  var c = payload.context || {};
  var lines = [
    "# Firmware export for AI",
    "",
    "## ECU / file",
    "",
    "- **ecu:** " + c.ecu,
    "- **firmware:** " + c.firmware,
    "- **family:** " + c.firmware_family,
    "- **checksum:** " + c.checksum,
    "- **file:** " + c.file_name + " (" + c.file_size + " bytes)",
    "- **map:** " + c.map_name,
    "- **architecture:** " + c.architecture,
    "- **editor:** " + c.editor + " " + c.editor_version,
    "- **export_version:** " + c.export_version,
    "- **dirty_bytes:** " + c.dirty_bytes,
    ""
  ];
  if (c.compare_file) lines.push("- **compare_file:** " + c.compare_file, "");
  lines.push("## Items (" + payload.item_count + ")", "");
  (payload.items || []).forEach(function (it) {
    if (it.map) {
      lines.push(aiMdBlock("Map: " + it.name, it));
      lines.push("", "- **dimensions:** " + it.map.dimensions);
      if (it.map.x_axis) lines.push("- **X:** " + it.map.x_axis.name + " = " + JSON.stringify(it.map.x_axis.values));
      if (it.map.y_axis) lines.push("- **Y:** " + it.map.y_axis.name + " = " + JSON.stringify(it.map.y_axis.values));
      lines.push("- **values_phys:** " + JSON.stringify(it.map.values_phys));
      lines.push("- **values_raw:** " + JSON.stringify(it.map.values_raw), "");
    } else {
      lines.push(aiMdBlock(it.name || it.address, it), "");
    }
  });
  return lines.join("\n");
}
