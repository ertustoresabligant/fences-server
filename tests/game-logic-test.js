const Game = require(__dirname + "/../game.js")

const game = [2, 2, 2, 1, 1, /**/ 1, 1, 1, 1, 1, /**/ 1, 1, 1]
game.width = 3
game.height = 3
console.log(Game.checkTurn(1, 1)) // false
console.log(Game.getWinner(game)) // 2
