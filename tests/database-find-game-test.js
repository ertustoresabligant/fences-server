require(__dirname + "/../database.js")().then(async db => {
  const player1ID = await db.createPlayer("test1")
  console.log(player1ID)
  if(!player1ID) return

  const player2ID = await db.createPlayer("test2")
  console.log(player2ID)
  if(!player2ID) return



  const game1ID = await db.createGame()
  console.log(game1ID)
  if(!game1ID) return

  var find = await db.findGame(player1ID)
  console.log(find)
  if(!find) return

  var join1 = await db.joinGame(game1ID, player1ID)
  console.log(join1)
  if(!join1) return

  var join2 = await db.joinGame(game1ID, player1ID)
  console.log(join2)
  if(!join2) return



  const game2ID = await db.createGame()
  console.log(game2ID)
  if(!game2ID) return

  join1 = await db.joinGame(game2ID, player1ID)
  console.log(join1)
  if(!join1) return

  join2 = await db.joinGame(game2ID, player2ID)
  console.log(join2)
  if(!join2) return

  find = await db.findGame(player1ID)
  console.log(find)
})
