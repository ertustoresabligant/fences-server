const express = require("express")
const server = express()
server.use(require("body-parser").urlencoded({ extended: false }))
const http = require("http").Server(server)
const port = process.env.PORT || 3141

console.log("[app-setup] successfully imported modules, ready to start server")
console.log("[app-setup] connecting to database...")

const { validateID } = require(__dirname + "/lib.js")

require(__dirname + "/database.js")().then(db => {
  //console.log("[app-setup] setup done")

  server.get("/test", (req, res) => {
    res.redirect("https://betterrickrollredirect.github.io/")
  })

  server.get("/fences/get", async (req, res) => {
    console.log("[express] /fences/get")

    var games = await db.getPublicGames()
    if(games) {
      console.log("[express] /fences/get: successfully fetched games")
      res.status(200).json(games)
    } else if(games === undefined) {
      console.log("[express] /fences/get: unable to fetch games (404)")
      res.status(404).send("")
    } else {
      console.log("[express] /fences/get: unable to fetch games (502)")
      res.status(502).send("")
    }
  })

  server.get("/fences/game/get", async (req, res) => {
    console.log("[express] /fences/game/get")

    const id = validateID(req.query.gameID)
    if(id) {
      console.log("[express] /fences/game/get: validated id ('" + id + "')")
    } else {
      console.log("[express] /fences/game/get: invalid id ('" + req.query.gameID + "')")
      res.status(400).send("")
      return
    }

    const game = await db.getGame(id)
    if(game) {
      console.log("[express] /fences/game/get: successfully fetched game")
      res.status(200).json(game)
    } else if(game === false) {
      console.log("[express] /fences/game/get: unable to fetch game (400)")
      res.status(400).send("")
    } else if(game === undefined) {
      console.log("[express] /fences/game/get: unable to fetch game (404)")
      res.status(404).send("")
    } else {
      console.log("[express] /fences/game/get: unable to fetch game (500)")
      res.status(500).send("")
    }
  })

  server.get("/fences/game/create", async (req, res) => {
    console.log("[express] /fences/game/create")

    const visible = req.query["public"]
    console.log("[express] /fences/game/create: " + (visible ? "visible" : "invisible"))

    const gameID = await db.createGame(visible ? true : false)
    if(gameID) {
      console.log("[express] /fences/game/create: successfully created game")
      res.status(200).json({ gameID: gameID })
    } else {
      console.log("[express] /fences/game/create: unable to create game (500)")
      res.status(500).send("")
    }
  })

  server.get("/fences/player/get", async (req, res) => {
    console.log("[express] /fences/player/get")

    const id = validateID(req.query.playerID)
    if(id) {
      console.log("[express] /fences/player/get: validated id ('" + id + "')")
    } else {
      console.log("[express] /fences/player/get: invalid id ('" + req.query.playerID + "')")
      res.status(400).send("")
      return
    }

    const player = await db.getPlayer(id)
    if(player) {
      console.log("[express] /fences/player/get: successfully fetched player")
      res.status(200).json(player)
    } else if(player === false) {
      console.log("[express] /fences/player/get: unable to fetch player (400)")
      res.status(400).send("")
    } else if(player === undefined) {
      console.log("[express] /fences/player/get: unable to fetch player (404)")
      res.status(404).send("")
    } else {
      console.log("[express] /fences/player/get: unable to fetch player (500)")
      res.status(500).send("")
    }
  })

  server.get("/fences/player/create", async (req, res) => {
    console.log("[express] /fences/player/create")

    const name = req.query.name
    if(name && typeof name == "string" && name.length > 0) {
      console.log("[express] /fences/player/create: validated name ('" + name + "')")
    } else {
      console.log("[express] /fences/player/create: invalid name ('" + name + "')")
      res.status(400).send("")
      return
    }

    const playerID = await db.createPlayer(name)
    if(playerID) {
      console.log("[express] /fences/player/create: successfully created player")
      res.status(200).json({ playerID: playerID })
    } else if(playerID === false) {
      console.log("[express] /fences/player/create: unable to create player (400)")
      res.status(400).send("")
    } else {
      console.log("[express] /fences/player/create: unable to create player (500)")
      res.status(500).send("")
    }
  })

  server.get("/fences/game/set-field", async (req, res) => {
    console.log("[express] /fences/game/set-field")

    const gID = validateID(req.query.gameID)
    if(gID) {
      console.log("[express] /fences/game/set-field: validated game id ('" + gID + "')")
    } else {
      console.log("[express] /fences/game/set-field: invalid game id ('" + req.query.gameID + "')")
      res.status(400).send("")
      return
    }

    const pID = validateID(req.query.playerID)
    if(pID) {
      console.log("[express] /fences/game/set-field: validated player id ('" + pID + "')")
    } else {
      console.log("[express] /fences/game/set-field: invalid player id ('" + req.query.playerID + "')")
      res.status(400).send("")
      return
    }

    const x = validateID(req.query.x)
    if(x || x === 0) {
      console.log("[express] /fences/game/set-field: validated x ('" + x + "')")
    } else {
      console.log("[express] /fences/game/set-field: invalid x ('" + req.query.x + "')")
      res.status(400).send("")
      return
    }

    const y = validateID(req.query.y)
    if(y || y === 0) {
      console.log("[express] /fences/game/set-field: validated y ('" + y + "')")
    } else {
      console.log("[express] /fences/game/set-field: invalid y ('" + req.query.y + "')")
      res.status(400).send("")
      return
    }

    const player = await db.getActivePlayer(gID)
    if(player === false) {
      console.log("[express] /fences/game/set-field: unable to fetch active player (400)")
      res.status(400).send("")
      return
    } else if(player === undefined) {
      console.log("[express] /fences/game/set-field: unable to fetch active player (404)")
      res.status(404).send("")
      return
    } else if(!player) {
      console.log("[express] /fences/game/set-field: unable to fetch active player (500)")
      res.status(500).send("")
      return
    }
    if(player !== pID) {
      console.log("[express] /fences/game/set-field: player is not the active player")
      res.status(403).send("")
      return
    }

    const result = await db.setField(gID, x, y)
    if(result) {
      console.log("[express] /fences/game/set-field: successfully set field")

      if(result.winner) {
        console.log("[express] /fences/game/set-field: game was won: '" + result.winner + "'")
        res.status(200).json({ gameID: gID, winner: result.winner })
      } else {
        res.status(200).json({ gameID: gID })
      }
    } else if(result === undefined) {
      console.log("[express] /fences/game/set-field: unable to set field (400)")
      res.status(400).send("")
    } else if(result === false) {
      console.log("[express] /fences/game/set-field: unable to set field (403)")
      res.status(403).send("")
    } else {
      console.log("[express] /fences/game/set-field: unable to set field (500)")
      res.status(500).send("")
    }
  })

  server.get("/fences/game/join", async (req, res) => {
    console.log("[express] /fences/game/join")

    const gID = validateID(req.query.gameID)
    if(gID) {
      console.log("[express] /fences/game/join: validated game id ('" + gID + "')")
    } else {
      console.log("[express] /fences/game/join: invalid game id ('" + req.query.gameID + "')")
      res.status(400).send("")
      return
    }

    const pID = validateID(req.query.playerID)
    if(pID) {
      console.log("[express] /fences/game/join: validated player id ('" + pID + "')")
    } else {
      console.log("[express] /fences/game/join: invalid player id ('" + req.query.playerID + "')")
      res.status(400).send("")
      return
    }

    const player = await db.joinGame(gID, pID)
    if(player) {
      console.log("[express] /fences/game/join: successfully joined game")
      res.status(200).json({ gameID: gID, playerID: pID, player: player })
    } else if(player === undefined) {
      console.log("[express] /fences/game/join: unable to join (400)")
      res.status(400).send("")
    } else if(player === false) {
      console.log("[express] /fences/game/join: unable to join (403)")
      res.status(403).send("")
    } else {
      console.log("[express] /fences/game/join: unable to join (500)")
      res.status(500).send("")
    }
  })

  server.get("/fences/game/find", async (req, res) => {
    console.log("[express] /fences/game/find")

    const id = validateID(req.query.playerID)
    if(id) {
      console.log("[express] /fences/game/find: validated id ('" + id + "')")
    } else {
      console.log("[express] /fences/game/find: invalid id ('" + req.query.playerID + "')")
      res.status(400).send("")
      return
    }

    const game = await db.findGame(id)
    if(game) {
      console.log("[express] /fences/game/find: successfully found game")
      res.status(200).json({ gameID: game.gameID, playerID: id, player: game.player })
    } else if(game === false) {
      console.log("[express] /fences/game/find: unable to find (400)")
      res.status(400).send("")
    } else {
      console.log("[express] /fences/game/find: unable to find (500)")
      res.status(500).send("")
    }
  })

  http.listen(port, () => { console.log("[app] listening on port " + port) })
})
