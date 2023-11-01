const shipsSizes = [
    [1, 4],
    [2, 3],
    [3, 2], 
    [4, 1],
]

const r = (max, min = 0)=>{
    return Math.floor(Math.random()*(max-min)+min);
}


class Ships{
    constructor(selector, N){
        //wypełnienie tablicy z parametrem N zerami
        this.N = N + 2;
        this.board = new Array(this.N).fill(new Array(this.N).fill(0));
        this.object = document.querySelector(selector);
        //deep copy, refaktoryzacja shipsSizes
        this.ships  = [...shipsSizes];
        console.log(this.ships);
        console.log(this.board);
    }
    placeShips(){
        this.ships.forEach((ship, index) =>{
            while(ship[0]){
                //miejsce wstawienia statku
                const [x, y] = [r(this.N - ship[1] + 1, 1), r(this.N - ship[1] + 1, 1)];
                const rot = r(1);
                let flag = true;
                for(let i = 0; i < ship[1]; i += 1){
                    //curr means curry, lokalizacja konkretnego masztu
                    let currX = x, currY = y;
                    if(rot == 0) currX += i;
                    else currY += i;

                    if(!(this.correctShipPlacing(currX, currY))){
                        flag = false;
                        break;      //break 
                    }
                }
                if(flag){
                    for(let i = 0; i < ship[1]; i += 1){
                        let currX = x
                        let currY = y;
                        if(rot == 0){
                            currX += i

                        }
                        else{
                            currY += i;
                        }
                        this.board[currX][currY] = 1;
                    }
                }
                this.ships[index][0]--;
                
            }
        })
    };
    //x, y do sprawdzenia czy można narysować w tym miejscu statek
    correctShipPlacing(x, y){
        //nie chce wyjść poza planszę
        if(x < 0 || y < 0 || x >= this.N || y >= this.N){
            return false;
        }
        //jeżeli nie wychodzi poza planszę i jeżeli bloczek sąsiadujący nie jest ,,1"
        if(!(y - 1 < 0) && this.board[x][y - 1] == 1){
            return false;
        }
        if(!(y + 1 >= this.N) && this.board[x][y + 1] == 1){
            return false;
        }
        if(!(x - 1 < 0) && this.board[x - 1][y] == 1){
            return false;
        }
        if(!(x + 1 >= this.N) && this.board[x + 1][y] == 1){
            return false;
        }
        if(this.board[x][y] == 1){
            return false;
        }
        return true;
    }
};


