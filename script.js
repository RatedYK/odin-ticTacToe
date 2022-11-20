    //cache DOM
    const board = document.querySelector('#board')
    const cells = document.querySelectorAll('.cell')
    const winningMessage = document.querySelector('.winningMessage')
    const message = document.querySelector('.message')
    const restartBtn = document.querySelector('.restartBtn')

    //game logic
    const winningCombos = [
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

    let player = 'X'

    //initialise buttons
    cells.forEach((cell) => {
        cell.addEventListener('click', applyGameLogic, {once: true})
    })
    
    restartBtn.addEventListener('click', resetBoard)


    
    function applyGameLogic(cell) {
        applyMark(cell);
        if (checkWinner(cell)) {
            message.innerHTML = `${player} Wins!`;
            winningMessage.style.display = 'flex';
        } else if (checkDraw()) {
            message.innerHTML = `Draw!`;
            winningMessage.style.display = 'flex'; 
        }

        switchTurn();
    }

    function applyMark(cell) {
        cell.target.innerHTML = player;
    }

    function switchTurn() {
        player === 'X' ? player = 'O' : player = 'X';
    }

    function checkWinner() {
        return winningCombos.some((combo) => {
            return combo.every((index)=> {
                return [...cells][index].innerHTML === player;
            })
        })
    }

    function checkDraw() {
        return [...cells].every((cell) => {
            return cell.innerHTML === 'X' || cell.innerHTML === 'O';
        })
    }
