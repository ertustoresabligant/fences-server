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
