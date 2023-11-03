const board  = new Ships('#opponent_game_field', 10);
const my_board  = new Ships('#my_game_field', 10);



board.placeShips()
board.drawTableWithShips()
my_board.drawTableForPlayer()
console.table(board.my_board)