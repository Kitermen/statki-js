const board  = new Ships('#opponent_game_field', 10);
const my_board  = new Ships('#my_game_field', 10);


// let btn = document.getElementById('btn').addEventListener('click', ()=>{
//     console.log(board)
//     console.log(my_board);
// })


board.placeShips()
board.drawTableWithShips()
board.boardContextSwitch = my_board;
my_board.drawTableForPlayer()
console.table(board.my_board)























