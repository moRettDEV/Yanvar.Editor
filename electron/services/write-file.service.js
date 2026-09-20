var fs = require("fs");

function writeFileBytes(filePath, bytes) {
  return fs.promises.writeFile(filePath, Buffer.from(bytes));
}

module.exports = { writeFileBytes };
