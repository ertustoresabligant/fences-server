module.exports.Error = class {
  constructor(domain, name, message) {
    this.domain = domain
    this.name = name
    this.message = message
  }
}
