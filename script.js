//Module for GameBoard(user interface)
const gameBoard = (function() {

    //cache DOM
    const cells = document.querySelectorAll('.cell')
    const restartBtn = document.querySelector('.restartBtn')
    const winningMessage = document.querySelector('.winningMessage')
    const message = document.querySelector('.message')

     //initialise buttons
     const initialiseBoard = function() {
        cells.forEach((cell) => {
            cell.addEventListener('click', gameLogic.applyGameLogic, {once: true})
        })
        restartBtn.addEventListener('click', resetBoard);
    };

    const resetBoard = function() {
        winningMessage.style.display = 'none';
        cells.forEach((cell) => {
            cell.innerHTML = '';
        })
        initialiseBoard();
        player = 'X'
    }

    return {initialiseBoard, cells: cells, message: message, winningMessage: winningMessage}

})();    

//Module for all the logic for tic tac toe
const gameLogic = (function() {

    let _player = 'X'
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
        if (checkWinner(cell)) {
            gameBoard.message.innerHTML = `${_player} Wins!`;
            gameBoard.winningMessage.style.display = 'flex';
        } else if (checkDraw()) {
            gameBoard.message.innerHTML = `Draw!`;
            gameBoard.winningMessage.style.display = 'flex'; 
        }
        switchTurn();
    }

    const applyMark = function(cell) {
        cell.target.innerHTML = _player;
    }

    const switchTurn = function() {
        _player === 'X' ? _player = 'O' : _player = 'X';
    }

    const checkWinner = function() {
        return _winningCombos.some((combo) => {
            return combo.every((index)=> {
                return [...gameBoard.cells][index].innerHTML === _player;
            })
        })
    }

    const checkDraw = function() {
        return [...gameBoard.cells].every((cell) => {
            return cell.innerHTML === 'X' || cell.innerHTML === 'O';
        })
    }

    return {applyGameLogic}

})();

gameBoard.initialiseBoard();
    