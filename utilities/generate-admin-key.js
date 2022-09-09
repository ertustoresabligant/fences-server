const fs = require("fs")

const keysFile = fs.readFileSync(__dirname + "/../data/private/admin-keys.json", { encoding: "utf8" })
const keys = JSON.parse(keysFile.length<1 ? '[]' : keysFile)
console.log("loaded keys file")

const uuid = require("crypto").randomUUID()
keys.push({ key: uuid })
fs.writeFileSync(__dirname + "/../data/private/admin-keys.json", JSON.stringify(keys))
console.log("updated keys file")

console.log("----- generated UUID: '" + uuid + "' -----")
