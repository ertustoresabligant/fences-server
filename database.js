const Game = require(__dirname + "/game.js")

async function init() {
  try {
    const sqlite = (await import("sqlite-async")).Database

    const db = await sqlite.open("data/main.db")
    console.log("[db-setup] successfully connected to database")

    await db.run("CREATE TABLE IF NOT EXISTS Player (playerID INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT)")
    console.log("[db-setup] table Player exists")

    await db.run("CREATE TABLE IF NOT EXISTS Game (gameID INTEGER PRIMARY KEY AUTOINCREMENT, deleted BOOLEAN, status INTEGER, public BOOLEAN, width INTEGER, height INTEGER, player0 INTEGER, player1 INTEGER, currentPlayer BOOLEAN, content TEXT, FOREIGN KEY(player0) REFERENCES Player, FOREIGN KEY(player1) REFERENCES Player)")
    console.log("[db-setup] table Game exists")

    console.log("[db-setup] successfully created database")
    return new Database(db)
  } catch(err) {
    console.log("[db-setup] unable to create database")
    throw err
  }
}

class Database {
  constructor(db) {
    this.db = db
    this.Status = {
      WAITING: 1,
      RUNNING: 2,
      FINISHED: 3
    }
  }

  async getGame(gameID) {
    try {
      console.log("[db] get game ('" + gameID + "')")

      const id = validateID(gameID)
      if(!id) return false

      const game = await this.db.get("SELECT gameID, status, width, height, player0, player1, currentPlayer, content FROM Game WHERE gameID = ? AND deleted = ?", [id, false])
      if(!game) {
        console.log("[db] get game ('" + gameID + "'): unable to fetch game")
        return false
      }

      console.log("[db] get game ('" + gameID + "'): successfully fetched game")
      return game
    } catch(err) {
      console.log("[db] get game ('" + gameID + "'): error: " + err)
      return false
    }
  }

  async createGame(visible) {
    try {
      console.log("[db] create game ('" + visible + "')")

      const width = 5
      const height = 5
      var content = ""
      for(var i = 0; i < width*height + (width-1)*(height-1); i++) { content += "0" }

      const game = await this.db.run("INSERT INTO Game (deleted, status, public, width, height, player0, player1, currentPlayer, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [false, this.Status.WAITING, visible ? true : false, width, height, undefined, undefined, false, content])
      if(!game || !game.lastID) {
        console.log("[db] create game ('" + visible + "'): unable to create game")
        return false
      }
      console.log("[db] create game ('" + visible + "'): successfully created game")
      return game.lastID
    } catch(err) {
      console.log("[db] create game ('" + visible + "'): error: " + err)
      return false
    }
  }

  async deleteGame(gameID) {
    try {
      console.log("[db] delete game ('" + gameID + "')")

      const id = validateID(gameID)
      if(!id) return false

      const game = await this.db.get("SELECT gameID FROM Game WHERE gameID = ?", [id])
      if(!game) {
        console.log("[db] delete game ('" + gameID + "'): game does not exist")
        return false
      }

      await this.db.get("UPDATE Game SET deleted = ? WHERE gameID = ?", [true, id])
      console.log("[db] delete game ('" + gameID + "'): successfully deleted game")
      return true
    } catch(err) {
      console.log("[db] delete game ('" + gameID + "'): error: " + err)
      return false
    }
  }

  async getAllGames() {
    try {
      console.log("[db] get all games")

      const games = await this.db.all("SELECT gameID, status, width, height, player0, player1, currentPlayer, content FROM Game WHERE deleted = ?", [false])
      if(!games) {
        console.log("[db] get all games: unable to fetch games")
        return false
      }

      console.log("[db] get all games: successfully fetched games")
      return games
    } catch(err) {
      console.log("[db] get all games: error: " + err)
      return false
    }
  }

  async getPublicGames() {
    try {
      console.log("[db] get public games")

      const games = await this.db.all("SELECT gameID, status, width, height, player0, player1 FROM Game WHERE public = ? AND deleted = ?", [true, false])
      if(!games) {
        console.log("[db] get public games: unable to fetch games")
        return false
      }

      console.log("[db] get public games: successfully fetched games")
      return games
    } catch(err) {
      console.log("[db] get public games: error: " + err)
      return false
    }
  }

  async deleteAllGames() {
    try {
      console.log("[db] delete all games")

      const res = await this.db.all("UPDATE Game SET deleted = true")
      if(!res) {
        console.log("[db] delete all games: unable to delete games")
        return false
      }

      console.log("[db] delete all games: successfully deleted games")
      return true
    } catch(err) {
      console.log("[db] delete all games: error: " + err)
      return false
    }
  }

  async getPlayer(playerID) {
    try {
      console.log("[db] get player ('" + playerID + "')")

      const id = validateID(playerID)
      if(!id) return false

      const player = await this.db.get("SELECT playerID, name FROM Player WHERE playerID = ?", [id])
      if(!player) {
        console.log("[db] get player ('" + playerID + "'): unable to fetch player")
        return false
      }

      console.log("[db] get player ('" + playerID + "'): successfully fetched player")
      return player
    } catch(err) {
      console.log("[db] get player ('" + playerID + "'): error: " + err)
      return false
    }
  }

  async createPlayer(name) {
    try {
      console.log("[db] create player ('" + name + "')")

      if(!name || typeof name != "string" || name.isEmpty) {
        console.log("[db] create player ('" + name + "'): invalid or empty name")
        return false
      }

      const player = await this.db.run("INSERT INTO Player (name) VAlUES (?)", [name])
      if(!player || !player.lastID) {
        console.log("[db] create player ('" + name + "'): unable to create player")
        return false
      }
      console.log("[db] create player ('" + name + "'): successfully created player")
      return player.lastID
    } catch(err) {
      console.log("[db] create player ('" + name + "'): error: " + err)
      return false
    }
  }

  async joinGame(gameID, playerID) {
    try {
      console.log("[db] join game (game '" + gameID + "', player '" + playerID + "')")

      const gID = validateID(gameID)
      if(!gID) return false
      const pID = validateID(playerID)
      if(!pID) return false

      const player = await this.db.get("SELECT playerID FROM Player WHERE playerID = ?", [pID])
      if(!player) {
        console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): player does not exist")
        return false
      }

      const game = await this.db.get("SELECT status, player0, player1 FROM Game WHERE gameID = ? AND deleted = ?", [gID, false])
      if(!game) {
        console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): unable to fetch game")
        return false
      }
      if(game.status !== this.Status.WAITING) {
        console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): invalid game status: " + game.status)
        return false
      }
      if(!game.player0) {
        console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): setting player 0")
        const res = await this.db.run("UPDATE Game SET player0 = ? WHERE gameID = ?", [pID, gID])
        if(res) {
          console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): successfully set player 0")
          return true
        } else {
          console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): unable to set player 0")
          return false
        }
      } else if(!game.player1) {
        if(game.player0 == pID) {
          console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): player already joined this game")
          return false
        }

        console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): setting player 1")
        const res = await this.db.run("UPDATE Game SET player1 = ?, status = ? WHERE gameID = ?", [pID, this.Status.RUNNING, gID])
        if(res) {
          console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): successfully set player 1")
          return true
        } else {
          console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): unable to set player 1")
          return false
        }
      } else {
        console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): invalid data, game seems to be full")
        return false
      }
    } catch(err) {
      console.log("[db] join game (game '" + gameID + "', player '" + playerID + "'): error: " + err)
      return false
    }
  }

  async findGame(playerID) {
    try {
      console.log("[db] find game ('" + playerID + "')")

      const id = validateID(playerID)
      if(!id) return false

      var game = await this.db.get("SELECT gameID, player0, player1 FROM Game WHERE deleted = ? AND status = ? AND public = ? AND NOT player0 = ?", [false, this.Status.WAITING, true, id])
      if(game) {
        console.log("[db] find game ('" + playerID + "'): found game: '" + game.gameID + "'")
      } else {
        console.log("[db] find game ('" + playerID + "'): no suitable game found, creating new one")
        const gameID = await this.createGame(true)
        if(gameID) {
          console.log("[db] find game ('" + playerID + "'): created game: '" + gameID + "'")
          game = await this.getGame(gameID)
          if(!game) {
            console.log("[db] find game ('" + playerID + "'): unable to find newly created game")
            return false
          }
        } else {
          console.log("[db] find game ('" + playerID + "'): unable to create game")
          return false
        }
      }

      const join = await this.joinGame(game.gameID, id)
      if(!join) {
        console.log("[db] find game ('" + playerID + "'): unable to join game")
        return false
      }

      console.log("[db] find game ('" + playerID + "'): successfully joined game '" + game.gameID + "'")
      return game.gameID
    } catch(err) {
      console.log("[db] find game ('" + playerID + "'): error: " + err)
      return false
    }
  }

  async setField(gameID, X, Y) {
    try {
      console.log("[db] set field (game '" + gameID + "', x '" + X + "', y '" + Y + "')")

      const id = validateID(gameID)
      if(!id) return false
      const x = validateID(X)
      if(!x && x !== 0) return false
      const y = validateID(Y)
      if(!y && y !== 0) return false

      const game = await this.db.get("SELECT status, currentPlayer, width, height, content FROM Game WHERE gameID = ? AND deleted = ?", [id, false])
      if(!game) {
        console.log("[db] set field (game '" + gameID + "', x '" + X + "', y '" + Y + "'): unable to fetch game")
        return false
      }
      if(game.status !== this.Status.RUNNING) {
        console.log("[db] set field (game '" + gameID + "', x '" + X + "', y '" + Y + "'): invalid game status: " + game.status)
        return false
      }
      if(x < 0 || x >= (y==game.height-1 ? game.width : 2*game.width-1) || y < 0 || y >= game.height) {
        console.log("[db] set field (game '" + gameID + "', x '" + X + "', y '" + Y + "'): coordinates out of bounds")
        return false
      }

      var gameContent = [...game.content].map(char => parseInt(char))
      gameContent.width = game.width
      gameContent.height = game.height
      if(!Game.checkTurn(gameContent, { x: x, y: y })) {
        console.log("[db] set field (game '" + gameID + "', x '" + X + "', y '" + Y + "'): turn not allowed")
        return false
      }

      gameContent[y*(2*game.width-1) + x] = game.currentPlayer ? 2 : 1
      const newGameContent = gameContent.map(int => `${int}`.charAt(0)).join("")
      const res = await this.db.run("UPDATE Game SET content = ?, currentPlayer = ? WHERE gameID = ?", [newGameContent, !game.currentPlayer, id])
      if(res) {
        console.log("[db] set field (game '" + gameID + "', x '" + X + "', y '" + Y + "'): successfully updated game")

        var returnValue = true
        returnValue.winner = Game.getWinner(gameContent)

        if(returnValue.winner) {
          console.log("[db] set field (game '" + gameID + "', x '" + X + "', y '" + Y + "'): game is finished")
          const res2 = await this.db.run("UPDATE Game SET status = ? WHERE gameID = ?", [this.Status.FINISHED, id])
          if(!res2) {
            console.log("[db] set field (game '" + gameID + "', x '" + X + "', y '" + Y + "'): unable to mark game as finished")
          }
        }

        return returnValue
      } else {
        console.log("[db] set field (game '" + gameID + "', x '" + X + "', y '" + Y + "'): unable to update game")
        return false
      }
    } catch(err) {
      console.log("[db] set field (game '" + gameID + "', x '" + X + "', y '" + Y + "'): error: " + err)
      return false
    }
  }
}

function validateID(id) {
  if((!id && id !== 0) || id.isNaN) return false
  if(typeof id == "number") return id
  if(typeof id == "string") {
    const num = parseInt(id)
    if((!num && num !== 0) || num.isNaN) return false
    return num
  }
  return false
}

module.exports = init
