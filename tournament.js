var blacklist = []

function playerLose(playerID) {
  blacklist.push(playerID)
}

function validatePlayer(playerID) {
  return !blacklist.includes(playerID)
}

module.exports.playerLose = playerLose
module.epxorts.validatePlayer = validatePlayer
