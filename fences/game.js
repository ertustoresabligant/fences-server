function checkTurn(game, coordinates) {
  if(!game) return false
  if(!game.width) return false
  if(!game.height) return false
  if(!coordinates) return false
  if(coordinates.y < 0 || coordinates.y > game.height-1) return false
  if(coordinates.x < 0 || coordinates.x > (coordinates.y === game.height-1 ? game.width-1 : 2*game.width-2)) return false
  if(game.length < game.width*game.height + (game.width-1)*(game.height-1)) return false
  return !game[coordinates.y * (2*game.width-1) + coordinates.x]
}

function getWinner(game) {
  if(!game) return false
  if(!game.width) return false
  if(!game.height) return false
  if(game.length < game.width*game.height + (game.width-1)*(game.height-1)) return false

  const boardWidth = 2*game.width-1
  const boardHeight = 2*game.height-1
  var board = []
  for(var y = 0; y<boardHeight; y++) {
    board.push([])
    for(var x = 0; x<boardWidth; x++) {
      if(y%2 === 0) {
        if(x%2 === 0) board[y].push({ value: game[boardWidth*y/2 + x/2], checked1: false, checked2: false, x: x, y: y })
        else board[y].push({ value: 2, checked1: false, checked2: false, x: x, y: y })
      } else {
        if(x%2 === 1) board[y].push({ value: game[boardWidth*(y-1)/2 + game.width + (x-1)%2], checked1: false, checked2: false, x: x, y: y })
        else board[y].push({ value: 1, checked1: false, checked2: false, x: x, y: y })
      }
    }
  }

  var nodes = []
  for(var x = 0; x<boardWidth; x+=2) {
    if(board[0][x].value === 1) nodes.push(board[0][x])
  }
  while(nodes.length > 0) {
    const node = nodes.splice(nodes.length-1)[0]
    node.checked1 = true

    if(node.x > 0) {
      const n = board[node.y][node.x-1]
      if(n.value === 1 && !n.checked1) nodes.push(n)
    }
    if(node.y > 0) {
      const n = board[node.y-1][node.x]
      if(n.value === 1 && !n.checked1) nodes.push(n)
    }
    if(node.x < boardWidth-1) {
      const n = board[node.y][node.x+1]
      if(n.value === 1 && !n.checked1) nodes.push(n)
    }
    if(node.y < boardHeight-1) {
      const n = board[node.y+1][node.x]
      if(n.value === 1 && !n.checked1) nodes.push(n)
    }

    if(node.y == boardHeight-2 && board[node.y+1][node.x].value === 1) return 1;
  }

  nodes = []
  for(var y = 0; y<boardHeight; y+=2) {
    if(board[y][0].value === 2) nodes.push(board[y][0])
  }
  while(nodes.length > 0) {
    const node = nodes.splice(nodes.length-1)[0]
    node.checked2 = true

    if(node.x > 0) {
      const n = board[node.y][node.x-1]
      if(n.value === 2 && !n.checked2) nodes.push(n)
    }
    if(node.y > 0) {
      const n = board[node.y-1][node.x]
      if(n.value === 2 && !n.checked2) nodes.push(n)
    }
    if(node.x < boardWidth-1) {
      const n = board[node.y][node.x+1]
      if(n.value === 2 && !n.checked2) nodes.push(n)
    }
    if(node.y < boardHeight-1) {
      const n = board[node.y+1][node.x]
      if(n.value === 2 && !n.checked2) nodes.push(n)
    }

    if(node.x == boardWidth-2 && board[node.y][node.x+1].value === 2) return 2;
  }

  return 0;
}

module.exports.checkTurn = checkTurn
module.exports.getWinner = getWinner
