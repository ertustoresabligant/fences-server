var blacklist = []
var whitelist = []
var started = false
var playersFirstResponseDeadline = undefined

function playerLose(playerID) {
  blacklist.push(playerID)
}

function validatePlayer(playerID) {
  return whitelist.includes(playerID) && !blacklist.includes(playerID)
}

function activatePlayer(playerID) {
  if(!started) return undefined
  if(new Date().getTime() > playersFirstResponseDeadline) return null
  
}

function startTournament() {
  if(started) return false
  started = true
  playersFirstResponseDeadline = new Date().getTime() + 2000
  return true
}

function tournamentStarted() {
  return started
}

module.exports.playerLose = playerLose
module.exports.validatePlayer = validatePlayer
module.exports.startTournament = startTournament
module.exports.tournamentStarted = tournamentStarted
