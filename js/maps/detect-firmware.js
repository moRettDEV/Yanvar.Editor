var FW_RULES = [
  { id: "J5TRS251", family: "trs", re: /j5trs251/, label: "J5 TRS 251" },
  { id: "J5TRS249", family: "trs", re: /j5trs249/, label: "J5 TRS 249" },
  { id: "J7TRS251", family: "trs", re: /j7trs251/, label: "J7 TRS 251" },
  { id: "J7TRS249", family: "trs", re: /j7trs249/, label: "J7 TRS 249" },
  { id: "J7ESA074", family: "trs", re: /j7es_0\.7\.4|j7es 0\.7\.4/, label: "J7 ESA 0.7.4" },
  { id: "J7ESA049", family: "trs", re: /j7esa/, label: "J7 ESA 0.4.9" },
  { id: "J5LSV43", family: "ls", re: /j5ls/, label: "J5LS V43" }
];

function detectStockId(text) {
  var m = String(text || "").match(/j5v\d{2}[a-z]\d{2}/i)
    || String(text || "").match(/[ai]\d{3}[a-z]{2}\d{2}/i);
  return m ? m[0].toUpperCase() : "";
}

function detectFirmware(bin, name) {
  var text = firmwareHaystack(bin, name);
  var i, rule;
  for (i = 0; i < FW_RULES.length; i++) {
    rule = FW_RULES[i];
    if (rule.re.test(text)) {
      return { id: rule.id, family: rule.family, label: rule.label };
    }
  }
  var stock = detectStockId(text);
  return { id: stock, family: "stock", label: stock || "сток" };
}
