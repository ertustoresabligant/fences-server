require(__dirname + "/../database.js")().then(async db => {
  console.log(await db.joinGame(1, 1))
})
