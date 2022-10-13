var blacklist = []
var started = false

function playerLose(playerID) {
  blacklist.push(playerID)
}

function validatePlayer(playerID) {
  return !blacklist.includes(playerID)
}

function startTournament() {
  if(started) return false
  started = true
  return true
}

function tournamentStarted() {
  return started
}

module.exports.playerLose = playerLose
module.exports.validatePlayer = validatePlayer
module.exports.startTournament = startTournament
module.exports.tournamentStarted = tournamentStarted
