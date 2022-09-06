require(__dirname + "/../database.js")().then(async db => {
  console.log(await db.getActivePlayer(1))
})
