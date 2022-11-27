//Module for GameBoard(user interface)
const gameBoard = (function() {

    let mode;

    //cache DOM
    const cells = document.querySelectorAll('.cell');
    const restartBtn = document.querySelector('.restartBtn');
    const winningMessage = document.querySelector('.winningMessage');
    const message = document.querySelector('.message');
    const modeSelect = document.querySelector('.modeSelect');
    const pvpBtn = document.querySelector('.pvpBtn');
    const aiBtn = document.querySelector('.aiBtn');

    //DOM for AI mode
    const levelSelect = document.querySelector('.levelSelect')

    //DOM for PvP mode
    const playerAssign = document.querySelector('.playerAssign');
    const playerAssignForm = document.querySelector('#playerAssignForm')
    let xPlayer = document.querySelector('#xPlayer');
    let oPlayer = document.querySelector('#oPlayer');

    const selectGameMode = function () {
        pvpBtn.addEventListener('click', ()=> {
            this.mode = 'pvp';
            modeSelect.style.display = 'none';
            playerAssign.style.display = 'flex'
            assignPlayerMarks();
            initialiseBoard();
        })
        aiBtn.addEventListener('click', ()=> {
            this.mode = 'ai'
            modeSelect.style.display = 'none';
            levelSelect.style.display = 'flex';
            this.xPlayer = createPlayerFactory('Player', 'X');
            this.oPlayer = createPlayerFactory('Computer', 'O');
            initialiseBoard();
            displayTurn.setNames(this.xPlayer.name, this.oPlayer.name);
            AI.selectDifficulty();
        })
    }
     //initialise the board to be clickable and also reset button after game ends
    const initialiseBoard = function() {
        cells.forEach((cell) => {
            cell.addEventListener('click', gameLogic.applyGameLogic, {once: true})
        })
        restartBtn.addEventListener('click', resetBoard);
        displayTurn.setStartHighlight();
    };

    const assignPlayerMarks = function() {
        playerAssignForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (xPlayer.value === '') {xPlayer.value = 'Player 1'};
            if (oPlayer.value === '') {oPlayer.value = 'Player 2'};
            this.xPlayer = createPlayerFactory(xPlayer.value, 'X');
            this.oPlayer = createPlayerFactory(oPlayer.value, 'O');

            playerAssign.style.display = 'none'
            displayTurn.setNames(this.xPlayer.name, this.oPlayer.name);
            return xPlayer, oPlayer;
        })
    }

    const resetBoard = function() {
        winningMessage.style.display = 'none';
        cells.forEach((cell) => {
            cell.innerHTML = '';
        })
        displayTurn.resetHighlight();
        gameLogic.resetTurns();
        initialiseBoard();
    }

    return {selectGameMode, cells: cells, message: message, winningMessage: winningMessage, mode: mode, levelSelect, xPlayer: xPlayer, oPlayer: oPlayer}

})();    

//Module for all the logic for tic tac toe
const gameLogic = (function() {

    let _currentTurn = 'X';
    let _currentTurnPlayer;

    //game logic
    const _winningCombos = [
        //horizontals
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        //verticals
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        //diagonals
        [0, 4, 8],
        [2, 4, 6]
    ];

    const applyGameLogic = function(cell) {
        playerMove(cell);
        
        if (checkWinnerPlayer()) {
            if (gameBoard.mode === 'ai') {
                gameBoard.message.innerHTML = `${gameBoard.xPlayer.name} Wins!`;
            } else {
                gameBoard.message.innerHTML = `${_currentTurnPlayer} Wins!`;
            };
            gameBoard.winningMessage.style.display = 'flex';
            return; //stops the game so that computer cannot make next move
        } else if (checkDraw()) {
            gameBoard.message.innerHTML = `Draw!`;
            gameBoard.winningMessage.style.display = 'flex'; 
        }

        //logic for Player vs Computer
        if (gameBoard.mode === 'ai' && cell.target.innerHTML === 'X') { //checks to see if the player has made a legit move before AI takes turn
            displayTurn.switchHighlight();
            let randomTimer = Math.floor(Math.random() * 450) + 100;
            setTimeout(AI.makeMove, randomTimer); //gives illusion of AI thinking for 100 - 449 milliseconds
        }

        //logic for Player vs Player
        if (gameBoard.mode === 'pvp') {
            switchTurn();
            displayTurn.switchHighlight();
        }
    }

    const playerMove = (cell) => {
        if (cell.target.innerHTML !== '') return;
        cell.target.innerHTML = _currentTurn;
    }

    const switchTurn = () => {
        _currentTurn === xPlayer.mark ? _currentTurn = oPlayer.mark : _currentTurn = xPlayer.mark;
        _currentTurnPlayer === oPlayer.name ? _currentTurnPlayer = xPlayer.name : _currentTurnPlayer = oPlayer.name;
    }

    const checkWinnerPlayer = () => {
            return _winningCombos.some((combo) => {
                return combo.every((index)=> {
                    return [...gameBoard.cells][index].innerHTML === _currentTurn;
            })})
    };

    const checkWinnerAI = () => {
        return _winningCombos.some((combo) => {
            return combo.every((index)=> {
                return [...gameBoard.cells][index].innerHTML === 'O';
        })})
    };

    const checkDraw = () => {
        return [...gameBoard.cells].every((cell) => {
            return cell.innerHTML === 'X' || cell.innerHTML === 'O';
        })
    }

    const resetTurns = () => {
        _currentTurn = 'X';
        _currentTurnPlayer = '';
    }

    return {applyGameLogic, resetTurns, checkWinnerAI, checkDraw, checkWinnerPlayer}

})();

//Module for AI
const AI = (function() {
    const cells = [...gameBoard.cells];
    let _move;
    let _difficulty;

    //DOM for AI mode
    const levelSelect = gameBoard.levelSelect;
    const easyBtn = document.querySelector('#easyBtn');
    const normalBtn = document.querySelector('#normalBtn');
    const hardBtn = document.querySelector('#hardBtn');

    const makeMove = () => {
        if (_difficulty === 'easy') {
            randomMove();
        } else if (_difficulty === 'normal') {
            let randomNum = Math.floor(Math.random() * 2); //1 or 0
            randomNum === 0 ? randomMove() : smartMove();
        } else if (_difficulty === 'hard') {
            smartMove();
        } else console.log('something went wrong')

        displayTurn.switchHighlight();
        if (gameLogic.checkWinnerAI()) { //checkWinnerAI is inside here because of setTimeout preventing the if statement from firing correctly
                gameBoard.message.innerHTML = `${gameBoard.oPlayer.name} Wins!`;
                gameBoard.winningMessage.style.display = 'flex';
            }
    }

    const randomMove = () => {
        let randomIndex = Math.floor(Math.random() * 9);
        if (cells[randomIndex].innerHTML === '') {
            cells[randomIndex].innerHTML = 'O';
        } else if (cells.every((cell) => cell.innerHTML !== '')) {
            return;
        } else randomMove();
    }

    const smartMove = () => {

        const availableSpots = checkAvailableSpots();

        if (availableSpots > 6) {
            firstMove(); //always gets middle spot or one of the corners
            console.log('First Move')
        } else if (availableSpots <= 6 && availableSpots !== 0) {
            if (winMove()) {
                console.log('Win Move')
                cells[_move].innerHTML = 'O';
            } else if (stopMove()) {
                console.log('Stop Move')
                cells[_move].innerHTML = 'O'
            } else randomMove();
        }
        else console.log('DRAW or smartMove broke')

    }

    const checkAvailableSpots = () => {
        let counter = 0;

        for (let i = 0; i < 9; i++) {
            if (cells[i].innerHTML === '') {
                counter++
                //console.log(counter);
            }
        }
        return counter;
    }

    const winMove = () => {
        for (let i = 0; i < 9; i++) {
            if (cells[i].innerHTML === '') {
                cells[i].innerHTML = 'O';
                if (gameLogic.checkWinnerAI()) {
                    _move = i;
                    return true;
                }
                cells[i].innerHTML = '';
            }
        }
    }

    const stopMove = () => {
        for (let i = 0; i < 9; i++) {
            if (cells[i].innerHTML === '') {
                cells[i].innerHTML = 'X';
                if (gameLogic.checkWinnerPlayer()) {
                    _move = i;
                    cells[i].innerHTML = '';
                    return true;
                }
                cells[i].innerHTML = '';
            }
        }
    }

    const firstMove = () => {
        if (cells[4].innerHTML === '') {
            cells[4].innerHTML = 'O';
            return;
        } else {
            let randomNumber = Math.floor(Math.random() * 4); //0 to 3
            if (randomNumber === 0) return cells[0].innerHTML = 'O';
            else if (randomNumber === 1) return cells[2].innerHTML = 'O';
            else if (randomNumber === 2) return cells[6].innerHTML = 'O';
            else if (randomNumber === 3) return cells[8].innerHTML = 'O';
        }
    }

    const selectDifficulty = () => {
        easyBtn.addEventListener('click', setDifficulty)
        normalBtn.addEventListener('click', setDifficulty)
        hardBtn.addEventListener('click', setDifficulty)
    };

    const setDifficulty = (e) => {
        _difficulty = e.target.value;
        console.log(_difficulty);
        levelSelect.style.display = 'none';
    }

    return {makeMove, selectDifficulty}

})();

//Factory function, passing into the name and mark assigned.
const createPlayerFactory = (name, mark) => {

    return {name, mark} 
}


//Module for displaying current turn
const displayTurn = (function() {
    const p1Text = document.querySelector('.p1');
    const p2Text = document.querySelector('.p2');

    const setNames = (p1, p2) => {
        p1Text.innerHTML = `${p1}'s turn`;
        p2Text.innerHTML = `${p2}'s turn`;
    }
    const switchHighlight = () => {
        if (p1Text.classList.contains('highlight')) {
            p1Text.classList.remove('highlight');
            p2Text.classList.add('highlight');
        } else {
            p2Text.classList.remove('highlight');
            p1Text.classList.add('highlight');
        }
    }
    const setStartHighlight = () => {
        p1Text.classList.add('highlight');
    }

    const resetHighlight = () => {
        p1Text.classList.remove('highlight');
        p2Text.classList.remove('highlight');
    }
    

    return {setNames, switchHighlight, setStartHighlight, resetHighlight};
})();

gameBoard.selectGameMode(); //runs the game