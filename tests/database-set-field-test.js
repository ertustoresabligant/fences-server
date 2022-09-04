require(__dirname + "/../database.js")().then(async db => {
  const gameID = await db.createGame()
  console.log(gameID)
  if(!gameID) return

  const player1ID = await db.createPlayer("test1")
  console.log(player1ID)
  if(!player1ID) return

  const player2ID = await db.createPlayer("test2")
  console.log(player2ID)
  if(!player2ID) return

  const join1 = await db.joinGame(gameID, player1ID)
  console.log(join1)
  if(!join1) return

  const join2 = await db.joinGame(gameID, player2ID)
  console.log(join2)
  if(!join2) return



  const game1 = await db.getGame(gameID)

  const setField = await db.setField(gameID, 1, 1)
  console.log(setField)
  if(!setField) return

  const game2 = await db.getGame(gameID)

  console.log(game1)
  console.log(game2)



  const setField2 = await db.setField(gameID, 1, 1)
  console.log(setField2)
  if(!setField2) return

  const game3 = await db.getGame(gameID)

  console.log(game2)
  console.log(game3)
})
