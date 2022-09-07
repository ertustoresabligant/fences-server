module.exports.Error = class {
  constructor(domain, name, message) {
    this.domain = domain
    this.name = name
    this.message = message
  }
}

module.exports.validateID = (id) => {
  if((!id && id !== 0) || id.isNaN) return false
  if(typeof id == "number") return id
  if(typeof id == "string") {
    const num = parseInt(id)
    if((!num && num !== 0) || num.isNaN) return false
    return num
  }
  return false
}

module.exports.exportGameContent = (game) => {
  if(!game) return false
  if(!game.width) return false
  if(!game.height) return false
  if(!game.content) return false
  if(typeof game.content != "string") return false
  if(game.content.length < game.width*game.height + (game.width-1)*(game.height-1)) return false

  const content = [...game.content].map(char => parseInt(char))

  var array = []
  for(var y = 0; y<game.height; y++) {
    for(var x = 0; x<(y===game.height-1 ? game.width : 2*game.width-1); x++) {
      if(content[y*(2*game.width-1) + x]) array.push({ y: y, x: x, value: content[y*(2*game.width-1) + x]-1 })
    }
  }

  return array
}

module.exports.importGameContent = (game) => {
  if(!game) return false
  if(!game.width) return false
  if(!game.height) return false
  if(!game.content) return false

  const content = "[]"
  for(var i = 0; i < game.width*game.height + (game.width-1)*(game.height-1); i++) {
    content += "0"
  }

  for(const entry of game.content) {
    if(!entry) continue

    const y = module.exports.validateID(entry.y)
    if(!y && y !== 0) continue
    if(y < 0) continue
    if(y >= game.height) continue

    const x = module.exports.validateID(entry.x)
    if(!x && x !== 0) continue
    if(x < 0) continue
    if(x >= (y===game.height-1 ? game.width : 2*game.width-1)) continue

    const val = module.exports.validateID(entry.value)
    if(!val && val !== 0) continue

    content[y*(2*game.width-1) + x] = val
  }

  for(var y = 0; y<game.height; y++) {
    for(var x = 0; x<(y===game.height-1 ? game.width : 2*game.width-1); x++) {
      if(content[y*(2*game.width-1) + x]) array.push({ y: y, x: x, value: content[y*(2*game.width-1) + x]-1 })
    }
  }

  return array
}
