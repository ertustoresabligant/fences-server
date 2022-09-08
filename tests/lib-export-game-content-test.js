const lib = require(__dirname + "/../lib.js")

const game = { width: 2, height: 2, content: "12012" }
const data = lib.exportGameContent(game)
console.log(data)
