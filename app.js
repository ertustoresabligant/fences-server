const express = require("express")
const server = express()
server.use(require("body-parser").urlencoded({ extended: false }))
const http = require("http").Server(server)
const port = 3141

console.log("[app-setup] successfully imported modules, ready to start server")
console.log("[app-setup] connecting to database...")

require(__dirname + "/database.js")().then(db => {
  //console.log("[app-setup] setup done")

  server.get("/test", (req, res) => {
    res.redirect("https://betterrickrollredirect.github.io/")
  })

  http.listen(port, () => { console.log("[app] listening on port " + port) })
})
