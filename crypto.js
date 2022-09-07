const crypto = require("crypto")
const fs = require("fs")

class Session {
  constructor() {
    const keys = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048
    })

    this.puk = keys.publicKey
    this.prk = keys.privateKey

    this.encryptionSettings = {
      key: this.puk,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256"
    }
    this.decryptionSettings = {
      key: this.prk,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256"
    }
  }

  export() {
    return this.puk.export({ type: "pkcs1", format: "der" })
  }

  decrypt(buffer) {
    return crypto.privateDecrypt(this.decryptionSettings, buffer)
  }

  decryptString(buffer) {
    return decrypt(buffer).toString()
  }

  checkDecrypt(buffer) {
    let keysFile
    try {
      keysFile = fs.readFileSync(__dirname + "/private/admin-keys.json", { encoding: "utf8" })
    } catch(err) {}

    const keys = JSON.parse(keysFile.length<1 ? '[]' : keysFile)
    const decrypt = decryptString(buffer)
    return keys.find(element => element && element.key && element.key === decrypt) && true
  }
}

var session
try {
  //session = JSON.parse(fs.readFileSync(__dirname + "/private/crypto-session.json", { encoding: "utf8" }))
} catch(err) {}

if(!session) {
  session = new Session()
  fs.writeFileSync(__dirname + "/private/crypto-session.json", JSON.stringify(session))
}

module.exports = session
