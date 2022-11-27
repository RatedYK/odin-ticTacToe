//Module for GameBoard(user interface)
const gameBoard = (function() {

    let mode;

    //cache DOM
    const cells = document.querySelectorAll('.cell')
    const restartBtn = document.querySelector('.restartBtn')
    const winningMessage = document.querySelector('.winningMessage')
    const message = document.querySelector('.message')
    const modeSelect = document.querySelector('.modeSelect')
    const pvpBtn = document.querySelector('.pvpBtn')
    const aiBtn = document.querySelector('.aiBtn')
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
        })
        aiBtn.addEventListener('click', ()=> {
            this.mode = 'ai'
            modeSelect.style.display = 'none';
            this.xPlayer = createPlayerFactory('Player', 'X');
            this.oPlayer = createPlayerFactory('Computer', 'O')
            initialiseBoard();
            displayTurn.setNames(this.xPlayer.name, this.oPlayer.name);
        })
    }
     //initialise buttons
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
            initialiseBoard();
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

    return {selectGameMode, cells: cells, message: message, winningMessage: winningMessage, mode: mode, xPlayer: xPlayer, oPlayer: oPlayer}

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
        applyMark(cell);
        
        if (checkWinnerPlayer()) {
            if (gameBoard.mode === 'ai') {
                gameBoard.message.innerHTML = `${gameBoard.xPlayer.name} Wins!`
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
            let randomTimer = Math.floor(Math.random() * 450) + 100
            setTimeout(AI.smartMove, randomTimer); //gives illusion of AI thinking for 100 - 449 milliseconds
        }

        //logic for Player vs Player
        if (gameBoard.mode === 'pvp') {
            switchTurn();
            displayTurn.switchHighlight();
        }
    }

    const applyMark = (cell) => {
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
                return [...gameBoard.cells][index].innerHTML === gameBoard.oPlayer.mark;
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

    const randomMove = () => {
        console.log('Random Move')
        let randomIndex = Math.floor(Math.random() * 9);
        if (cells[randomIndex].innerHTML === '') {
            cells[randomIndex].innerHTML = 'O';
            displayTurn.switchHighlight();
            if (gameLogic.checkWinnerAI()) { //checkWinnerAI is inside here because of setTimeout preventing the if statement from firing correctly
                gameBoard.message.innerHTML = `${gameBoard.oPlayer.name} Wins!`;
                gameBoard.winningMessage.style.display = 'flex';
            }
        } else if (cells.every((cell) => cell.innerHTML !== '')) {
            return;
        } else randomMove();
    }

    const smartMove = () => {
        const availableSpots = checkAvailableSpots();

        if (availableSpots > 6) {
            randomMove();
            console.log('Random move')
        } else if (availableSpots <= 6 && availableSpots !== 0) {
            if (winMove()) {
                console.log('Win Move')
                cells[_move].innerHTML = 'O';
                gameBoard.message.innerHTML = `${gameBoard.oPlayer.name} Wins!`;
                gameBoard.winningMessage.style.display = 'flex';
            } else if (stopMove()) {
                console.log('Stop Move')
                cells[_move].innerHTML = 'O'
            } else randomMove();
        }
        else console.log('Bad thing happend')

        displayTurn.switchHighlight();

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
                if (checkOWinner()) {
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
                if (checkXWinner()) {
                    _move = i;
                    cells[i].innerHTML = '';
                    return true;
                }
                cells[i].innerHTML = '';
            }
        }
    }

    const checkOWinner = () => {

        if ((cells[0].innerHTML === 'O') && (cells[1].innerHTML === 'O') && (cells[2].innerHTML === 'O')) {return true}
         else if (cells[3].innerHTML === 'O' && cells[4].innerHTML === 'O' && cells[5].innerHTML === 'O') {return true}
         else if (cells[6].innerHTML === 'O' && cells[7].innerHTML === 'O' && cells[8].innerHTML === 'O') {return true}
         else if (cells[0].innerHTML === 'O' && cells[3].innerHTML === 'O' && cells[6].innerHTML === 'O') {return true}
         else if (cells[1].innerHTML === 'O' && cells[4].innerHTML === 'O' && cells[7].innerHTML === 'O') {return true}
         else if (cells[2].innerHTML === 'O' && cells[5].innerHTML === 'O' && cells[8].innerHTML === 'O') {return true}
         else if (cells[0].innerHTML === 'O' && cells[4].innerHTML === 'O' && cells[8].innerHTML === 'O') {return true}
         else if (cells[2].innerHTML === 'O' && cells[4].innerHTML === 'O' && cells[6].innerHTML === 'O') {return true}
         else return false;
    };

    const checkXWinner = () => {

        if ((cells[0].innerHTML === 'X') && (cells[1].innerHTML === 'X') && (cells[2].innerHTML === 'X')) return true;
         else if (cells[3].innerHTML === 'X' && cells[4].innerHTML === 'X' && cells[5].innerHTML === 'X') return true;
         else if (cells[6].innerHTML === 'X' && cells[7].innerHTML === 'X' && cells[8].innerHTML === 'X') return true;
         else if (cells[0].innerHTML === 'X' && cells[3].innerHTML === 'X' && cells[6].innerHTML === 'X') return true;
         else if (cells[1].innerHTML === 'X' && cells[4].innerHTML === 'X' && cells[7].innerHTML === 'X') return true;
         else if (cells[2].innerHTML === 'X' && cells[5].innerHTML === 'X' && cells[8].innerHTML === 'X') return true;
         else if (cells[0].innerHTML === 'X' && cells[4].innerHTML === 'X' && cells[8].innerHTML === 'X') return true;
         else if (cells[2].innerHTML === 'X' && cells[4].innerHTML === 'X' && cells[6].innerHTML === 'X') return true;
         else return false;
    };

    const AIcheckDraw = (cells) => {
        cells.forEach((cell) => {
            if (cell.innerHTML === '') return false;
        })
        return true;
    }

    return {randomMove, AIcheckDraw, smartMove}

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