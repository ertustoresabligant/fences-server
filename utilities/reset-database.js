const fs = require("fs")

const historyFile = fs.readFileSync(__dirname + "/../data/reset-backups/history.json", { encoding: "utf8" })
const history = JSON.parse(historyFile.length<1 ? '{ "num": 1, "resets": [] }' : historyFile)
console.log("loaded history file")

const number = history.num
history.resets.push({ time: new Date().getTime(), num: number })
history.num++
fs.writeFileSync(__dirname + "/../data/reset-backups/history.json", JSON.stringify(history))
console.log("updated history file")

fs.renameSync(__dirname + "/../data/main.db", __dirname + "/../data/reset-backups/main_" + number + ".db")
console.log("archived old database file")
fs.writeFileSync(__dirname + "/../data/main.db", "")
console.log("created new database file")

const database = require(__dirname + "/../database.js")
database().then(() => { console.log("initialized new database") })
