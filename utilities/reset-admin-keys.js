const fs = require("fs")

fs.writeFileSync(__dirname + "/../data/private/admin-keys.json", "[]")
console.log("updated keys file")
