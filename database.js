const sqlite = require("sqlite-async")

async function init() {
  try {
    const db = await sqlite.open("data/main.db")
    console.log("[db-setup] successfully connected to database")

    await db.run("CREATE TABLE IF NOT EXISTS Player (id INTEGER PRIMARY KEY AUTOINCREMENT)")
    console.log("[db-setup] table Player exists")

    await db.run("CREATE TABLE IF NOT EXISTS Game (id INTEGER PRIMARY KEY AUTOINCREMENT, status INTEGER, public BOOLEAN, width INTEGER, height INTEGER, player0 INTEGER, player1 INTEGER, currentPlayer BOOLEAN, content TEXT, FOREIGN KEY(player0) REFERENCES Player, FOREIGN KEY(player1) REFERENCES Player)")
    console.log("[db-setup] table Game exists")

    console.log("[db-setup] successfully created database")
    return Database(db)
  } catch(err) {
    console.log("[db-setup] unable to create database")
    throw err
  }
}

class Database {
  constructor(db) {
    this.db = db
  }
}

module.exports = init
