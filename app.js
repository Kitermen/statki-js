const board  = new Ships('#opponent_game_field', 10)


board.placeShips()
board.drawTableWithShips()

console.table(board.board)