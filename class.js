const shipsSizes = [
    [1, 4],
    [2, 3],
    [3, 2], 
    [4, 1],
];

const r = (max, min)=>{
    return Math.round(Math.random() * (max - min) + min);
}


class Ships{
    constructor(selector, N){
        //wypełnienie tablicy z parametrem N zerami
        this.N = N;
        document.querySelector(':root').style.setProperty('--N', this.N);
        this.board = new Array(this.N).fill(0).map(()=>{
            return new Array(this.N).fill(0);
        });
        document.querySelector(':root').style.setProperty('--N', this.N);
        this.my_board = new Array(this.N).fill(0).map(()=>{
            return new Array(this.N).fill(0);
        });
        //selector to tag html w którym będzie trzymana plansza
        this.object = document.querySelector(selector);
        //deep copy, refaktoryzacja shipsSizes
        this.ships  = structuredClone(shipsSizes);
        //shipsArray przechowuje dane o wyświwtlonych na lewo statkach
        this.shipArray = [];
        //selected ship - zmienna pomocnicza to określania który selected a który nie
        this.selectedShip = 0;
        //wiadomo chyba co
        this.rotation = true;
        //
        this.marked = [];
        this.correctPlace = false;
        this.filledBoard = false;
       
    }
    placeShips(){
        this.ships.forEach((ship, index) =>{
            //po kolei każdy z 4 arrayów
            while(ship[0]){
                //miejsce wstawienia statku
                let x, y;
                do{
                    x = r(this.N - ship[1], 0);
                    y = r(this.N - ship[1], 0);
                }while(this.board[x][y] == 1);
                const rot = r(1, 0);
                let flag = true;
                for(let i = 0; i < ship[1]; i += 1){
                    //curr means curry, lokalizacja konkretnego masztu
                    let currX = x
                    let currY = y;
                    if(rot == 0){  
                        currX += i 
                    }
                    else{
                        currY += i;
                    } 
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
                    this.ships[index][0] -= 1;
                }
                
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
    drawTableWithShips(){
        for(let i = 0; i < this.N; i += 1){
            for(let j = 0; j < this.N; j += 1){
                const div = document.createElement('div');
                // console.log(j, i)
                // console.log(this.board[j][i])
                div.classList.add(this.board[j][i] ? 'ship' : 'noShip')
                this.object.appendChild(div);
            }
        }
    }
//4humanplayer:
    drawTableForPlayer(){
        this.object.addEventListener('contextmenu', (e) =>{
            e.preventDefault();
            this.rotation = !this.rotation; //GUTGUT
        })
        for(let i = 0; i < this.N; i += 1){
            for(let j = 0; j < this.N; j += 1){
                const div = document.createElement('div');
                // console.log(j, i)
                // console.log(this.board[j][i])
                div.classList.add(this.my_board[j][i], 'noShip')

                div.addEventListener('mouseenter', () =>{
                    this.markingMyBoard(j, i);
                })
                //zamiana 0 na div w my_board
                this.my_board[j][i] = div;
                //this.object to plansza
                this.object.appendChild(div);
            }
        }
        let shipsAmount = 0;
        let lastIndex = 9;
        this.object.addEventListener('click', () =>{
            if(this.correctPlace && (!this.filledBoard)){
                this.marked.forEach(markedTile =>{
                    markedTile.obj.classList.add('placed');
                    this.board[markedTile.x][markedTile.y] = 1;
                })
                shipsAmount += 1;
                this.shipArray[this.selectedShip].obj.style.display = "none";
                if(this.selectedShip < lastIndex){
                    this.selectedShip += 1;
                    this.shipArray[this.selectedShip].obj.classList.add('selected');
                }
                else{
                    if(shipsAmount < 10){
                        lastIndex -= 1;
                        console.log("here")
                        this.selectedShip = 0;
                        while(this.shipArray[this.selectedShip].obj.style.display == "none"){
                            this.selectedShip += 1;
                        }
                        this.shipArray[this.selectedShip].obj.classList.add('selected');
                    }
                }
                if(shipsAmount >= 10){
                    this.filledBoard = true;
                }
            }
        })
        this.generateMyFleet()
    }

    markingMyBoard(x, y){
        if(this.filledBoard){
            return;
        }
        // console.log(x, y)
        //usuwanie zielonego koloru
        this.marked.forEach(markedItem =>{
            markedItem.obj.classList.remove('marked');
            markedItem.obj.classList.remove('incorrect-placement');
        });
        let flag = this.correctShipPlacing(x, y);
        this.marked = [];
        const ship = this.shipArray[this.selectedShip];
        //obj to zaznaczone na zielono krateczki, a x i y będą potrzebne do odwoływania się przy wstawianiu
        this.marked.push({
            obj: this.my_board[x][y],
            x, 
            y,
        });
        let direction = 1;
        let currX = x;
        let currY = y;
        for(let i = 1; i < ship.size; i += 1){
            if(this.rotation){
                currX += direction;
                console.log(currX)
                if(currX >= this.N){
                    i -= 1;
                    direction = -1;
                    currX = x;
                    continue;
                }
            }
            else{
                currY += direction;
                if(currY >= this.N){
                    i -= 1;
                    direction = -1;
                    currY = y;
                    continue;
                }
            }
            this.marked.push({
                obj: this.my_board[currX][currY],
                x: currX,
                y: currY,
            });
            if(flag){
                flag = this.correctShipPlacing(currX, currY);
            }

        }
        this.correctPlace = flag;
        this.marked.forEach(markedItem =>{
            markedItem.obj.classList.add(flag ? 'marked' : 'incorrect-placement');
        });
    }

//groB
//mittel
//klein
//sehrKlein

//ship array ma długość 10, 9 indexów, selectedShip to po prostu index shipArray
    generateMyFleet(){
        let iter = 0;
        const navalbase = document.createElement('div');
        navalbase.classList.add('navalbase')
        document.querySelector('.boards').appendChild(navalbase)

        this.ships.forEach((ship)=>{
            
            for(let i = 0; i < ship[0]; i++){
                const masts = document.createElement('div');
                masts.classList.add('mast-parent');
                
                for(let j = 0; j < ship[1]; j++){
                    const shipEl =  document.createElement('div');
                    shipEl.classList.add(`mast-${ship[1]}`, 'mast')
                    masts.appendChild(shipEl)
                }
                const copyIter = iter;
                masts.addEventListener('click', () =>{
                    this.shipArray[this.selectedShip].obj.classList.remove('selected')
                    // console.log(this.selectedShip)
                    // console.log(iter)
                    // console.log(copyIter)
                    this.selectedShip = copyIter
                    
                    this.shipArray[this.selectedShip].obj.classList.add('selected')
                });
                this.shipArray.push({
                    obj: masts,
                    size: ship[1],
                });
                iter += 1;
                navalbase.appendChild(masts);
            }
        });
        console.log(this.shipArray);
        this.shipArray[0].obj.classList.add('selected')
        


        }
};


