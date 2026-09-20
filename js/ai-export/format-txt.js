function formatAiTxt(payload) {
  if (payload.mode === "brief") {
    var lines = ["address | size | type | raw_value"];
    (payload.items || []).forEach(function (it) {
      if (it.raw_values) {
        lines.push(it.address + " map " + it.dimensions + " " + JSON.stringify(it.raw_values));
      } else {
        lines.push([it.address, it.size, it.type, it.raw_value].join(" | "));
      }
    });
    return lines.join("\n");
  }
  var c = payload.context || {};
  var out = [
    "ECU: " + c.ecu,
    "Firmware: " + c.firmware,
    "Checksum: " + c.checksum,
    "File size: " + c.file_size,
    "Architecture: " + c.architecture,
    "Editor: " + c.editor + " " + c.editor_version,
    "Export version: " + c.export_version,
    ""
  ];
  (payload.items || []).forEach(function (it) {
    if (it.map) {
      out.push("Map:");
      out.push("  name: " + it.name);
      out.push("  address: " + it.address);
      out.push("  type: " + it.type);
      out.push("  dimensions: " + it.map.dimensions);
      if (it.map.x_axis) out.push("  X axis: " + it.map.x_axis.name + " " + JSON.stringify(it.map.x_axis.values));
      if (it.map.y_axis) out.push("  Y axis: " + it.map.y_axis.name + " " + JSON.stringify(it.map.y_axis.values));
      out.push("  values: " + JSON.stringify(it.map.values_phys));
      out.push("");
    } else {
      out.push("Parameter:");
      out.push("  name: " + it.name);
      out.push("  address: " + it.address);
      out.push("  type: " + it.type);
      out.push("  unit: " + it.unit);
      out.push("  conversion: " + it.conversion);
      out.push("  value: " + it.value);
      out.push("  raw: " + it.raw);
      out.push("  min: " + it.min);
      out.push("  max: " + it.max);
      out.push("  description: " + it.description);
      out.push("");
    }
  });
  return out.join("\n");
}
