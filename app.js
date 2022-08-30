const express = require("express")
const server = express()
server.use(require("body-parser").urlencoded({ extended: false }))
const http = require("http").Server(server)
const port = 3141

server.get("/test", (req, res) => {
  res.redirect("https://betterrickrollredirect.github.io/")
})

http.listen(port, () => { console.log("listening on port " + port) })
