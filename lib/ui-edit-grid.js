function makeEditGrid(bytes, rows, cols, item, ctpText, onInput, activeRow, onSelect, onBefore, extra) {
  extra = extra || {};
  return makeGridTable(bytes, rows, cols, item, null, activeRow, {
    editable: true,
    values: ctpText,
    onChange: onInput,
    onSelect: onSelect,
    onBeforeChange: onBefore,
    canEdit: extra.canEdit
  });
}
