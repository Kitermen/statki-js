const shipsSizes = [
    [1, 4],
    [2, 3],
    [3, 2],
    [4, 1],
];

const r = (max, min) => {
    return Math.round(Math.random() * (max - min) + min);
}

const navalbase = document.createElement('div');
navalbase.classList.add('navalbase');
const modalsBin = document.querySelector('.modals');
const playerBoard = document.getElementById('my_game_field');
//
//
let gameStartFlag = false;
//
//
class Ships {
    constructor(selector, N) {
        //wypełnienie tablicy z parametrem N zerami
        this.N = N;
        document.querySelector(':root').style.setProperty('--N', this.N);
        this.board = new Array(this.N).fill(0).map(() => {
            return new Array(this.N).fill(0);
        });
        document.querySelector(':root').style.setProperty('--N', this.N);
        this.my_board = new Array(this.N).fill(0).map(() => {
            return new Array(this.N).fill(0);
        });

        //selector to tag html w którym będzie trzymana plansza
        this.object = document.querySelector(selector);
        //deep copy, refaktoryzacja shipsSizes
        this.ships = structuredClone(shipsSizes);
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

        this.playerTurnFlag = true;

        this.shootedByBot = [];
        this.shootedByPlayer = [];

        this.boardContextSwitch = undefined;

        this.computerCounter = 0;
        this.playerCounter = 0;

        this.constBotCoor;
        //constBotCoor - cleverBotCoords (x, y w którym odpala się bot)
        this.beSmartBot = false;
        this.cleverBotDir = 0;
    }

    gameRestart() {
        document.getElementById('opponent_game_field').remove()
        document.getElementById('my_game_field').remove()
        const opponent_game_field = document.createElement('div');
        opponent_game_field.classList.add('field');
        opponent_game_field.id = "opponent_game_field";
        document.getElementsByClassName('boards')[0].appendChild(opponent_game_field);
        const my_game_field = document.createElement('div');
        my_game_field.classList.add('field');
        my_game_field.id = "my_game_field";
        document.getElementsByClassName('boards')[0].appendChild(my_game_field);

        if(document.getElementsByClassName('loss-div')[0].style.display != "none"){
            document.getElementsByClassName('loss-div')[0].remove()
        }
        else if(document.getElementsByClassName('win-div')[0].style.display != "none"){
            document.getElementsByClassName('win-div')[0].remove()
        }

        const board  = new Ships('#opponent_game_field', 10);
        const my_board  = new Ships('#my_game_field', 10);
        board.placeShips()
        board.drawTableWithShips()
        board.boardContextSwitch = my_board;
        my_board.drawTableForPlayer()
        console.log(this.computerCounter);
    }


    placeShips() {
        this.ships.forEach((ship, index) => {
            //po kolei każdy z 4 arrayów [ile sztuk, ile masztów]
            while (ship[0]) {
                //miejsce wstawienia statku
                let x, y;
                do {
                    x = r(this.N - ship[1], 0);
                    y = r(this.N - ship[1], 0);

                } while (this.board[x][y] == 1);
                const rot = r(1, 0);
                let flag = true;
                for (let i = 0; i < ship[1]; i += 1) {
                    //curr means curry, lokalizacja konkretnego masztu
                    let currX = x
                    let currY = y;
                    if (rot == 0) {
                        currX += i
                    }
                    else {
                        currY += i;
                    }
                    if (!(this.correctShipPlacing(currX, currY))) {
                        flag = false;
                        break;      //break
                    }
                }
                if (flag) {
                    for (let i = 0; i < ship[1]; i += 1) {
                        let currX = x
                        let currY = y;
                        if (rot == 0) {
                            currX += i
                        }
                        else {
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
    correctShipPlacing(x, y) {
        //nie chce wyjść poza planszę
        if (x < 0 || y < 0 || x >= this.N || y >= this.N) {
            return false;
        }
        //jeżeli nie wychodzi poza planszę i jeżeli bloczek sąsiadujący nie jest ,,1"
        if (!(y - 1 < 0) && this.board[x][y - 1] == 1) {
            return false;
        }
        if (!(y + 1 >= this.N) && this.board[x][y + 1] == 1) {
            return false;
        }
        if (!(x - 1 < 0) && this.board[x - 1][y] == 1) {
            return false;
        }
        if (!(x + 1 >= this.N) && this.board[x + 1][y] == 1) {
            return false;
        }

        //na ,,ukos"
        if (!(y + 1 >= this.N) && !(x + 1 >= this.N) && this.board[x + 1][y + 1] == 1) {
            return false;
        }
        if (!(y - 1 < 0) && !(x + 1 >= this.N) && this.board[x + 1][y - 1] == 1) {
            return false;
        }
        if (!(y - 1 < 0) && !(x - 1 < 0) && this.board[x - 1][y - 1] == 1) {
            return false;
        }
        if (!(y + 1 > this.N) && !(x - 1 < 0) && this.board[x - 1][y + 1] == 1) {
            return false;
        }

        if (this.board[x][y] == 1) {
            return false;
        }
        return true;
    }
    drawTableWithShips() {
        for (let i = 0; i < this.N; i += 1) {
            for (let j = 0; j < this.N; j += 1) {
                const div = document.createElement('div');
                div.addEventListener('click', (event) => this.playerShoots(event, div, this.board[j][i]))
                div.classList.add('semi-button')
                if (this.board[j][i] == 1) {
                    div.classList.add('ship')
                }
                else {
                    div.classList.add('noShip')
                }
                // div.classList.add(this.board[j][i] ? 'ship' : 'noShip')
                this.object.appendChild(div);
                this.my_board[j][i] = div
            }
        }
    }

    playerShoots(event, div, shotTarget) {
        if (gameStartFlag) {
            if (this.playerTurnFlag) {
                if (shotTarget == 1) {
                    document.getElementById('hood').style.display = "block";
                    setTimeout(() => {
                        document.getElementById('hood').style.display = "none";
                    }, 100)
                    div.classList.add('opponent-ship-damaged');
                    this.playerCounter += 1;
                    const img = document.createElement('img');
                    img.src = 'images/hit.png';
                    img.style.opacity = "0.6";
                    div.appendChild(img);
                    console.log(this.shootedByBot);
                    console.log(this.playerCounter);
                    if (this.playerCounter == 20) {
                        this.playerTurnFlag = false;
                        const winDiv = document.createElement('div');
                        winDiv.classList.add('win-div');
                        winDiv.innerText = "Gratulacje, wygrałeś!"
                        modalsBin.appendChild(winDiv);
                        this.gameRestart()
                    }
                }
                else if (shotTarget != 1) {
                    const img = document.createElement('img');
                    img.src = 'images/miss.png';
                    img.style.opacity = "0.6";
                    div.appendChild(img);
                    this.playerTurnFlag = false;
                    this.opponentShoots();
                }

                const replacedDiv = div.cloneNode(true)
                div.parentNode.replaceChild(replacedDiv, div)
                replacedDiv.addEventListener('click', () => {
                    alert("Tu już strzelałeś")
                })
            }
            else {
                alert("Poczekaj na swoją kolej!~!!*!!@#EFC")
            }
        }
        else {
            alert("Hola Hola gra się jeszcze nie zaczęła!")
        }
    }

    opponentShoots() {
        setTimeout(() => {
            if (!this.beSmartBot || this.computerCounter == 0 && !this.playerTurnFlag) {
                let x, y;
                do {
                    x = r(this.N - 1, 0)
                    y = r(this.N - 1, 0)
                } while (this.shootedByBot.includes(`${x}:${y}`));
                this.shootedByBot.push(`${x}:${y}`);
                const div = this.boardContextSwitch.my_board[x][y];
                if (this.boardContextSwitch.board[x][y] == 1) {
                    this.boardContextSwitch.my_board[x][y].classList.add("my-ship-damaged");
                    const img = document.createElement('img');
                    img.src = 'images/hit.png';
                    img.style.opacity = "0.6";
                    div.appendChild(img);

                    this.computerCounter += 1;
                    this.beSmartBot = true;

                    this.constBotCoor = {
                        lastX: x,
                        lastY: y,
                    }

                    if (this.computerCounter == 20) {
                        this.playerLoses()
                    }
                    else {
                        console.log(this.beSmartBot);
                        this.beSmartBotFunc();
                    }
                }
                else {
                    const img = document.createElement('img');
                    img.src = 'images/miss.png';
                    img.style.opacity = "0.6";
                    div.appendChild(img);
                    this.playerTurnFlag = true;
                }
            }
            else if (this.beSmartBot) {
                this.beSmartBotFunc()
            }
            else{
                console.log("cos dziwnego sie ten tego");
            }
        }, 10)
    }

    beSmartBotFunc(){
        if(this.beSmartBot){
            setTimeout(()=>{
                //x razy if >>>> switch
                if (this.cleverBotDir == 0 && this.verticalShooting) {
                    this.cleverBotDir_1()
                }
                if (this.cleverBotDir == 0 && !this.verticalShooting) {
                    this.cleverBotDir_2()
                }
                if (this.cleverBotDir == 1 && this.verticalShooting) {
                    this.cleverBotDir_3()
                }
                if (this.cleverBotDir == 1 && !this.verticalShooting) {
                    this.cleverBotDir_4()
                }
            }, 10)
        }
    }

    cleverBotDir_1(){
        this.botCoor = this.constBotCoor;
            this.botCoor.lastX = this.botCoor.lastX + 1;
            console.log("1. warunek 1 segment");
                if(this.shootedByBot.includes(`${this.botCoor.lastX + 1}:${this.botCoor.lastY}`) && this.shootedByBot.includes(`${this.botCoor.lastX - 1}:${this.botCoor.lastY}`) && this.shootedByBot.includes(`${this.botCoor.lastX}:${this.botCoor.lastY + 1}`) && this.shootedByBot.includes(`${this.botCoor.lastX}:${this.botCoor.lastY - 1}`)){
                    console.log("mniej ekskluzywny warunek");
                    this.beSmartBot = false;
                    console.log("ZAISTNIAL WARUNEK EKSKLUZYWMY");
                    this.opponentShoots()
                }
                else{
                    if (this.botCoor.lastX <= 9 && !this.shootedByBot.includes(`${this.botCoor.lastX}:${this.botCoor.lastY}`)) {  
                        console.log("1. warunek 2 segment");
                        this.shootedByBot.push(`${this.botCoor.lastX}:${this.botCoor.lastY}`);
                        const div = this.boardContextSwitch.my_board[this.botCoor.lastX][this.botCoor.lastY];
                        

                        if (this.boardContextSwitch.board[this.botCoor.lastX][this.botCoor.lastY] == 1) {
                            this.boardContextSwitch.my_board[this.botCoor.lastX][this.botCoor.lastY].classList.add("my-ship-damaged");
                            const img = document.createElement('img');
                            img.src = 'images/hit.png';
                            img.style.opacity = "0.6";
                            div.appendChild(img);
                            this.computerCounter += 1;
                            this.verticalShooting = true;
                            this.hitVertically = true;    
                            this.opponentShoots()
                        }
                        else {
                            this.cleverBotDir = 1;
                            const img = document.createElement('img');
                            img.src = 'images/miss.png';
                            img.style.opacity = "0.6";
                            div.appendChild(img);
                            this.playerTurnFlag = true;
                        }
                    }
                    else {
                        this.cleverBotDir = 1;
                    }
                }
    }




    cleverBotDir_2(){
        this.botCoor = this.constBotCoor;
            this.botCoor.lastY = this.botCoor.lastY - 1;
            console.log("1. warunek 1 segment");
                if(this.shootedByBot.includes(`${this.botCoor.lastX + 1}:${this.botCoor.lastY}`) && this.shootedByBot.includes(`${this.botCoor.lastX - 1}:${this.botCoor.lastY}`) && this.shootedByBot.includes(`${this.botCoor.lastX}:${this.botCoor.lastY + 1}`) && this.shootedByBot.includes(`${this.botCoor.lastX}:${this.botCoor.lastY - 1}`)){
                    console.log("mniej ekskluzywny warunek");
                    this.beSmartBot = false;
                    console.log("ZAISTNIAL WARUNEK EKSKLUZYWMY");
                    this.opponentShoots()
                }
                else{
                    if (this.botCoor.lastY >= 0 && !this.shootedByBot.includes(`${this.botCoor.lastX}:${this.botCoor.lastY}`)) {  
                        console.log("1. warunek 2 segment");
                        this.shootedByBot.push(`${this.botCoor.lastX}:${this.botCoor.lastY}`);
                        const div = this.boardContextSwitch.my_board[this.botCoor.lastX][this.botCoor.lastY];
                        this.verticalShooting = false;

                        if (this.boardContextSwitch.board[this.botCoor.lastX][this.botCoor.lastY] == 1) {
                            this.boardContextSwitch.my_board[this.botCoor.lastX][this.botCoor.lastY].classList.add("my-ship-damaged");
                            const img = document.createElement('img');
                            img.src = 'images/hit.png';
                            img.style.opacity = "0.6";
                            div.appendChild(img);
                            this.computerCounter += 1;
                            this.hitHorizontally = true;
                            this.opponentShoots()
                        }
                        else {
                            const img = document.createElement('img');
                            img.src = 'images/miss.png';
                            img.style.opacity = "0.6";
                            div.appendChild(img);
                            this.playerTurnFlag = true;
                            if(this.hitVertically){
                                this.beSmartBot = false;
                                this.hitVertically = false;
                            }
                        }
                    }
                    else {
                        if(this.hitVertically){
                            this.beSmartBot = false;
                            this.hitVertically = false;
                        }
                        else{
                            this.cleverBotDir = 0;
                            this.verticalShooting = false;
                        }
                    }
                }
    }




    cleverBotDir_3(){
        this.botCoor = this.constBotCoor;
            this.botCoor.lastX = this.botCoor.lastX - 1;
            console.log("1. warunek 1 segment");
                if(this.shootedByBot.includes(`${this.botCoor.lastX + 1}:${this.botCoor.lastY}`) && this.shootedByBot.includes(`${this.botCoor.lastX - 1}:${this.botCoor.lastY}`) && this.shootedByBot.includes(`${this.botCoor.lastX}:${this.botCoor.lastY + 1}`) && this.shootedByBot.includes(`${this.botCoor.lastX}:${this.botCoor.lastY - 1}`)){
                    console.log("mniej ekskluzywny warunek");
                    this.beSmartBot = false;
                    console.log("ZAISTNIAL WARUNEK EKSKLUZYWMY");
                    this.opponentShoots()
                }
                else{
                    if (this.botCoor.lastX >= 0 && !this.shootedByBot.includes(`${this.botCoor.lastX}:${this.botCoor.lastY}`)) {  
                        console.log("1. warunek 2 segment");
                        this.shootedByBot.push(`${this.botCoor.lastX}:${this.botCoor.lastY}`);
                        const div = this.boardContextSwitch.my_board[this.botCoor.lastX][this.botCoor.lastY];
                        this.verticalShooting = true;

                        if (this.boardContextSwitch.board[this.botCoor.lastX][this.botCoor.lastY] == 1) {
                            this.boardContextSwitch.my_board[this.botCoor.lastX][this.botCoor.lastY].classList.add("my-ship-damaged");
                            const img = document.createElement('img');
                            img.src = 'images/hit.png';
                            img.style.opacity = "0.6";
                            div.appendChild(img);
                            this.computerCounter += 1;
                            
                            this.opponentShoots()
                        }
                        else {
                            const img = document.createElement('img');
                            img.src = 'images/miss.png';
                            img.style.opacity = "0.6";
                            div.appendChild(img);
                            this.playerTurnFlag = true;
                            if(this.hitVertically){
                                this.beSmartBot = false;
                                this.hitVertically = false;
                                this.verticalShooting = true;
                            }
                        }
                    }
                    else {
                        if(this.hitVertically){
                            this.beSmartBot = false;
                            this.hitVertically = false;
                        }
                        else{
                            this.cleverBotDir = 0;
                            this.verticalShooting = false;
                        }
                    }
                }
    }
        
    playerLoses(){
        this.playerTurnFlag = false;
        const lossDiv = document.createElement('div');
        lossDiv.classList.add('loss-div');
        lossDiv.innerText = "1/10 :(((("
        modalsBin.appendChild(lossDiv);
        const revealEnemyShips = document.querySelectorAll('.ship')
        for (let i = 0; i < revealEnemyShips.length; i += 1) {
            revealEnemyShips[i].style.backgroundColor = "red";
        }
        setTimeout(() => {
            this.gameRestart();
        }, 5000);
    }

    //4humanplayer:
    drawTableForPlayer() {
        this.object.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.rotation = !this.rotation; //GUTGUT
        })
        for (let i = 0; i < this.N; i += 1) {
            for (let j = 0; j < this.N; j += 1) {
                const div = document.createElement('div');
                // console.log("j", j, "i", i)
                // console.log(this.board[j][i])
                div.classList.add('noShip')
                // div.classList.add(this.my_board[j][i], 'noShip')

                div.addEventListener('mouseenter', () => {
                    this.markingMyBoard(j, i);
                })
                //zamiana 0 na div w my_board
                this.my_board[j][i] = div;
                //this.object - plansza
                this.object.appendChild(div);
            }
        }

        let shipsAmount = 0;
        let lastIndex = 9;
        this.object.addEventListener('click', () => {
            if (this.correctPlace && (!this.filledBoard)) {
                this.marked.forEach(markedTile => {
                    markedTile.obj.classList.add('placed');
                    //placed - TU JEST MÓJ STATEK
                    this.board[markedTile.x][markedTile.y] = 1;
                })
                if (document.querySelectorAll('.placed').length == 20) {
                    const startButton = document.createElement('div');
                    startButton.innerText = "start";
                    startButton.classList.add('start-button');
                    modalsBin.appendChild(startButton);
                    startButton.addEventListener('click', () => {
                        startButton.style.display = "none";
                        gameStartFlag = true;
                        const oponentBoardTargets = document.querySelectorAll('.semi-button');
                        for (let i = 0; i < oponentBoardTargets.length; i += 1) {
                            oponentBoardTargets[i].style.cursor = "pointer";
                        }
                        if(this.playerTurnFlag){
                            playerBoard.addEventListener('click', ()=>{
                                alert('Twoja kolej jest to dlaczego klikasz SWOJĄ planszę ehhhh')
                            })
                        }
                    })
                }
                shipsAmount += 1;
                this.shipArray[this.selectedShip].obj.style.display = "none";
                if (this.selectedShip < lastIndex) {
                    this.selectedShip += 1;
                    this.shipArray[this.selectedShip].obj.classList.add('selected');
                }
                else {
                    if (shipsAmount < 10) {
                        lastIndex -= 1;
                        this.selectedShip = 0;
                        while (this.shipArray[this.selectedShip].obj.style.display == "none") {
                            this.selectedShip += 1;
                        }
                        this.shipArray[this.selectedShip].obj.classList.add('selected');
                    }
                }
                if (shipsAmount >= 10) {
                    this.filledBoard = true;
                }
            }
        })
        this.generateMyFleet()
    }

    markingMyBoard(x, y) {
        if (this.filledBoard) {
            return;
        } -
            // console.log(x, y)
            //usuwanie zielonego koloru
            this.marked.forEach(markedItem => {
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
        for (let i = 1; i < ship.size; i += 1) {
            if (this.rotation) {
                currX += direction;
                // console.log(currX)
                if (currX >= this.N) {
                    i -= 1;
                    direction = -1;
                    currX = x;
                    continue;
                }
            }
            else {
                currY += direction;
                if (currY >= this.N) {
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
            if (flag) {
                flag = this.correctShipPlacing(currX, currY);
            }

        }
        this.correctPlace = flag;
        this.marked.forEach(markedItem => {
            markedItem.obj.classList.add(flag ? 'marked' : 'incorrect-placement');
        });
    }

    //groB
    //mittel
    //klein
    //sehrKlein

    //ship array ma długość 10, 9 indexów, selectedShip to po prostu index shipArray
    generateMyFleet() {
        let iter = 0;
        document.querySelector('.boards').appendChild(navalbase)

        this.ships.forEach((ship) => {

            for (let i = 0; i < ship[0]; i++) {
                const masts = document.createElement('div');
                masts.classList.add('mast-parent');

                for (let j = 0; j < ship[1]; j++) {
                    const shipEl = document.createElement('div');
                    shipEl.classList.add(`mast-${ship[1]}`, 'mast')
                    masts.appendChild(shipEl)
                }
                const copyIter = iter;
                masts.addEventListener('click', () => {
                    this.shipArray[this.selectedShip].obj.classList.remove('selected')
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
        this.shipArray[0].obj.classList.add('selected')
    }
};


