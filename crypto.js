const crypto = require("crypto")
const fs = require("fs")

class Session {
  constructor() {
    const keys = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048
    })

    this.encryptionSettings = {
      key: keys.publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }
    this.decryptionSettings = {
      key: keys.privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING
    }
  }

  export() {
    return this.encryptionSettings.key.export({ type: "spki", format: "der" })
  }

  decrypt(buffer) {
    return crypto.privateDecrypt(this.decryptionSettings, buffer)
  }

  decryptString(buffer) {
    return this.decrypt(buffer).toString()
  }

  checkDecrypt(buffer) {
    let keysFile
    try {
      keysFile = fs.readFileSync(__dirname + "/data/private/admin-keys.json", { encoding: "utf8" })
    } catch(err) {}

    const keys = JSON.parse(keysFile.length<1 ? '[]' : keysFile)
    const decrypt = this.decryptString(buffer)
    return keys.find(element => element && element.key && element.key === decrypt) && true
  }
}

module.exports = {
  timeout: 30000,

  sessions: { },

  generate() {
    const id = crypto.randomUUID()
    var session = new Session()
    session.timestamp = new Date().getTime()
    session.id = id
    module.exports.sessions[id] = session
    return session
  },

  validate(id, data) {
    if(!id) return null
    if(typeof id !== "string") return null

    const session = module.exports.sessions[id]
    if(!session) return undefined

    return session.checkDecrypt(data)
  },

  remove(id) {
    if(!id) return null
    if(typeof id !== "string") return null
    delete module.exports.sessions[id]
    return true
  },

  checkAll() {
    Object.keys(module.exports.sessions).forEach(id => {
      const session = module.exports.sessions[id]
      if(session && session.timestamp && session.timestamp < new Date().getTime()-module.exports.timeout) delete module.exports.sessions[id]
    })
  }
}

setInterval(module.exports.checkAll, 1000)
