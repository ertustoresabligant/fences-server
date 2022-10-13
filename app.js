const args = require(__dirname + "/args.js")()
console.log("[app-setup] starting server in " + (args.tournament ? "tournament" : "normal") + " mode")

const express = require("express")
const server = express()
server.use(require("body-parser").urlencoded({ extended: false }))
const http = require("http").Server(server)
const port = process.env.PORT || 3141

const crypto = require(__dirname + "/crypto.js")

console.log("[app-setup] successfully imported modules, ready to start server")
console.log("[app-setup] connecting to database...")

const { validateID } = require(__dirname + "/lib.js")
const { playerLose, validatePlayer, startTournament, tournamentStarted } = require(__dirname + "/tournament.js")

require(__dirname + "/database.js")().then(db => {
  server.get("/test", (req, res) => {
    res.redirect("https://betterrickrollredirect.github.io/")
  })

  server.get("/fences-server-search", (req, res) => {
    res.send("v2.1.0");
  })

  server.get("/fences/get", async (req, res) => {
    console.log("[express] /fences/get")

    if(args.tournament) {
      console.log("[express] /fences/get: not allowed in tournament mode (403)")
      res.status(403).send("")
      return
    }

    var games = await db.getPublicGames()
    if(games) {
      console.log("[express] /fences/get: successfully fetched games")
      res.status(200).json(games)
    } else if(games === undefined) {
      console.log("[express] /fences/get: unable to fetch games (404)")
      res.status(404).send("")
    } else {
      console.log("[express] /fences/get: unable to fetch games (500)")
      res.status(500).send("")
    }
  })

  server.get("/fences/game/get", async (req, res) => {
    console.log("[express] /fences/game/get")

    if(args.tournament && !tournamentStarted()) {
      console.log("[express] /fences/game/get: tournament has not started (403)")
      res.status(403).send("")
      return
    }

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

    if(args.tournament) {
      console.log("[express] /fences/game/create: now allowed in tournament mode (403)")
      res.status(403).send("")
      return
    }

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

    var player = await db.getPlayer(id)
    if(player) {
      console.log("[express] /fences/player/get: successfully fetched player")
      if(!validatePlayer(id)) player.blacklisted = true
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

    if(args.tournament && tournamentStarted()) {
      console.log("[express] /fences/player/create: tournament has already started (403)")
      res.status(403).send("")
      return
    }

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

    if(args.tournament && !tournamentStarted()) {
      console.log("[express] /fences/game/set-field: tournament has not started (403)")
      res.status(403).send("")
      return
    }

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

    if(args.tournament && !validatePlayer(pID)) {
      console.log("[express] /fences/game/set-field: player was blacklisted (403)")
      res.status(403).send("blacklisted")
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
      console.log("[express] /fences/game/set-field: unable to fetch active player (403)")
      res.status(403).send("")
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

        const loser = result.winner == 1 ? game.player0 : result.winner == 2 ? game.player1 : 0
        if(loser) {
          console.log("[express] /fences/game/set-field: player '" + loser + "' lost")
          playerLose(loser)
        } else {
          console.log("[express] /fences/game/set-field: unable to identify the loser (winner: '" + result.winner + "', loser: '" + loser + "')")
        }

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

    if(args.tournament) {
      console.log("[express] /fences/game/join: not allowed in tournament mode (403)")
      res.status(403).send("")
      return
    }

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

    if(args.tournament && !validatePlayer(pID)) {
      console.log("[express] /fences/game/join: player was blacklisted (403)")
      res.status(403).send("blacklisted")
      return
    }

    const player = await db.joinGame(gID, pID)
    if(player) {
      console.log("[express] /fences/game/join: successfully joined game")
      res.status(200).json({ gameID: gID, playerID: pID, player: player-1 })
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

    if(args.tournament && !tournamentStarted()) {
      console.log("[express] /fences/game/find: tournament has not started (403)")
      res.status(403).send("")
      return
    }

    const id = validateID(req.query.playerID)
    if(id) {
      console.log("[express] /fences/game/find: validated id ('" + id + "')")
    } else {
      console.log("[express] /fences/game/find: invalid id ('" + req.query.playerID + "')")
      res.status(400).send("")
      return
    }

    if(args.tournament && !validatePlayer(id)) {
      console.log("[express] /fences/game/find: player was blacklisted (403)")
      res.status(403).send("blacklisted")
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

  server.get("/fences/key", async (req, res) => {
    console.log("[express] /fences/key")

    const session = crypto.generate()
    res.status(200).json({ sessionID: session.id, puk: session.export().toJSON().data.join("-") })
  })

  server.get("/fences/get-all", async (req, res) => {
    console.log("[express] /fences/get-all")

    const sessionID = req.query.sessionID
    if(sessionID && typeof sessionID == "string" && sessionID.length > 0) {
      console.log("[express] /fences/get-all: validated session id ('" + sessionID + "')")
    } else {
      console.log("[express] /fences/get-all: invalid session id ('" + sessionID + "')")
      res.status(401).send("")
      return
    }

    const key = req.query.key
    if(key && typeof key == "string" && key.length > 0) {
      console.log("[express] /fences/get-all: validated key ('" + key + "')")
    } else {
      console.log("[express] /fences/get-all: invalid key ('" + key + "')")
      res.status(401).send("")
      return
    }

    try {
      const array = key.split(",").map(str => parseInt(str))
      if(!array || array.length < 1) {
        console.log("[express] /fences/get-all: invalid key array")
        res.status(401).send("")
        return
      }

      const buffer = new Int8Array(array).buffer
      if(!buffer) {
        console.log("[express] /fences/get-all: unable to create buffer")
        res.status(500).send("")
        return
      }

      const valid = crypto.validate(sessionID, buffer)
      if(!valid) {
        console.log("[express] /fences/get-all: unauthorized")
        res.status(403).send("")
        return
      }
      const remove = crypto.remove(sessionID)
      if(remove) {
        console.log("[express] /fences/get-all: successfully removed key")
      } else {
        console.log("[express] /fences/get-all: unable to remove key")
        res.status(500).send("")
        return
      }

      console.log("[express] /fences/get-all: authorized")
      var games = await db.getAllGames()
      if(games) {
        console.log("[express] /fences/get-all: successfully fetched games")
        res.status(200).json(games)
      } else if(games === undefined) {
        console.log("[express] /fences/get-all: unable to fetch games (404)")
        res.status(404).send("")
      } else {
        console.log("[express] /fences/get-all: unable to fetch games (500)")
        res.status(500).send("")
      }
    } catch(err) {
      console.log("[express] /fences/get-all: error: " + err)
      res.status(500).send("")
    }
  })

  server.get("/fences/delete-all", async (req, res) => {
    console.log("[express] /fences/delete-all")

    const sessionID = req.query.sessionID
    if(sessionID && typeof sessionID == "string" && sessionID.length > 0) {
      console.log("[express] /fences/delete-all: validated session id ('" + sessionID + "')")
    } else {
      console.log("[express] /fences/delete-all: invalid session id ('" + sessionID + "')")
      res.status(401).send("")
      return
    }

    const key = req.query.key
    if(key && typeof key == "string" && key.length > 0) {
      console.log("[express] /fences/delete-all: validated key ('" + key + "')")
    } else {
      console.log("[express] /fences/delete-all: invalid key ('" + key + "')")
      res.status(401).send("")
      return
    }

    try {
      const array = key.split(",").map(str => parseInt(str))
      if(!array || array.length < 1) {
        console.log("[express] /fences/delete-all: invalid key array")
        res.status(401).send("")
        return
      }

      const buffer = new Int8Array(array).buffer
      if(!buffer) {
        console.log("[express] /fences/delete-all: unable to create buffer")
        res.status(500).send("")
        return
      }

      const valid = crypto.validate(sessionID, buffer)
      if(!valid) {
        console.log("[express] /fences/delete-all: unauthorized")
        res.status(403).send("")
        return
      }
      const remove = crypto.remove(sessionID)
      if(remove) {
        console.log("[express] /fences/delete-all: successfully removed key")
      } else {
        console.log("[express] /fences/delete-all: unable to remove key")
        res.status(500).send("")
        return
      }

      console.log("[express] /fences/delete-all: authorized")
      var result = await db.deleteAllGames()
      if(result) {
        console.log("[express] /fences/delete-all: successfully deleted games")
        res.status(200).send("")
      } else {
        console.log("[express] /fences/delete-all: unable to delete games (500)")
        res.status(500).send("")
      }
    } catch(err) {
      console.log("[express] /fences/delete-all: error: " + err)
      res.status(500).send("")
    }
  })

  server.get("/fences/game/delete", async (req, res) => {
    console.log("[express] /fences/game/delete")

    const sessionID = req.query.sessionID
    if(sessionID && typeof sessionID == "string" && sessionID.length > 0) {
      console.log("[express] /fences/game/delete: validated session id ('" + sessionID + "')")
    } else {
      console.log("[express] /fences/game/delete: invalid session id ('" + sessionID + "')")
      res.status(401).send("")
      return
    }

    const key = req.query.key
    if(key && typeof key == "string" && key.length > 0) {
      console.log("[express] /fences/game/delete: validated key ('" + key + "')")
    } else {
      console.log("[express] /fences/game/delete: invalid key ('" + key + "')")
      res.status(401).send("")
      return
    }

    const gameID = validateID(req.query.gameID)
    if(gameID) {
      console.log("[express] /fences/game/delete: validated game id ('" + gameID + "')")
    } else {
      console.log("[express] /fences/game/delete: invalid game id ('" + req.query.gameID + "')")
      res.status(400).send("")
      return
    }

    try {
      const array = key.split(",").map(str => parseInt(str))
      if(!array || array.length < 1) {
        console.log("[express] /fences/game/delete: invalid key array")
        res.status(401).send("")
        return
      }

      const buffer = new Int8Array(array).buffer
      if(!buffer) {
        console.log("[express] /fences/game/delete: unable to create buffer")
        res.status(500).send("")
        return
      }

      const valid = crypto.validate(sessionID, buffer)
      if(!valid) {
        console.log("[express] /fences/game/delete: unauthorized")
        res.status(403).send("")
        return
      }
      const remove = crypto.remove(sessionID)
      if(remove) {
        console.log("[express] /fences/game/delete: successfully removed key")
      } else {
        console.log("[express] /fences/game/delete: unable to remove key")
        res.status(500).send("")
        return
      }

      console.log("[express] /fences/game/delete: authorized")
      var result = await db.deleteGame(gameID)
      if(result) {
        console.log("[express] /fences/game/delete: successfully deleted game")
        res.status(200).json({ gameID: gameID })
      } else if(result === false) {
        console.log("[express] /fences/game/delete: unable to delete game (400)")
        res.status(400).send("")
      } else if(result === undefined) {
        console.log("[express] /fences/game/delete: unable to delete game (404)")
        res.status(404).send("")
      } else {
        console.log("[express] /fences/game/delete: unable to delete game (500)")
        res.status(500).send("")
      }
    } catch(err) {
      console.log("[express] /fences/game/delete: error: " + err)
      res.status(500).send("")
    }
  })

  server.get("/fences/tournament/start", async (req, res) => {
    console.log("[express] /fences/tournament/start")

    const sessionID = req.query.sessionID
    if(sessionID && typeof sessionID == "string" && sessionID.length > 0) {
      console.log("[express] /fences/tournament/start: validated session id ('" + sessionID + "')")
    } else {
      console.log("[express] /fences/tournament/start: invalid session id ('" + sessionID + "')")
      res.status(401).send("")
      return
    }

    const key = req.query.key
    if(key && typeof key == "string" && key.length > 0) {
      console.log("[express] /fences/tournament/start: validated key ('" + key + "')")
    } else {
      console.log("[express] /fences/tournament/start: invalid key ('" + key + "')")
      res.status(401).send("")
      return
    }

    try {
      const array = key.split(",").map(str => parseInt(str))
      if(!array || array.length < 1) {
        console.log("[express] /fences/tournament/start: invalid key array")
        res.status(401).send("")
        return
      }

      const buffer = new Int8Array(array).buffer
      if(!buffer) {
        console.log("[express] /fences/tournament/start: unable to create buffer")
        res.status(500).send("")
        return
      }

      const valid = crypto.validate(sessionID, buffer)
      if(!valid) {
        console.log("[express] /fences/tournament/start: unauthorized")
        res.status(403).send("")
        return
      }
      const remove = crypto.remove(sessionID)
      if(remove) {
        console.log("[express] /fences/tournament/start: successfully removed key")
      } else {
        console.log("[express] /fences/tournament/start: unable to remove key")
        res.status(500).send("")
        return
      }

      console.log("[express] /fences/tournament/start: authorized")
      startTournament()
      console.log("[express] /fences/tournament/start: successfully started tournament")
      res.status(200).send("")
    } catch(err) {
      console.log("[express] /fences/tournament/start: error: " + err)
      res.status(500).send("")
    }
  })

  http.listen(port, () => { console.log("[app] listening on port " + port) })
})
