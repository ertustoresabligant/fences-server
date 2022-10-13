module.exports = function() {
  var result = {}
  if(process.argv.length < 3) return result

  for(var i = 2; i<process.argv.length; i++) {
    const arg = process.argv[i]

    if(arg.startsWith("-") && arg.length > 1) {
      for(var j = 1; j<arg.length; j++) {
        switch(arg.charAt(j)) {
          case "t": result.tournament = true; break
        }
      }
    }
  }

  if(process.env.tournament) result.tournament = true

  return result
}
