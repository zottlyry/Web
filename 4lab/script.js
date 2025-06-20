document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.querySelector('.grid-container');
    const scoreValue = document.querySelector('.score-value');
    const newGameBtn = document.querySelector('.new-game-btn');
    const overlay = document.querySelector('.game-overlay');
    const overlayTitle = document.querySelector('.overlay-title');
    const overlayBtn = document.querySelector('.overlay-btn');
    
    let grid = [];
    let score = 0;
    let isGameOver = false;
    
    function initGame() {
        gridContainer.innerHTML = '';
        grid = Array(4).fill().map(() => Array(4).fill(0));
        score = 0;
        scoreValue.textContent = '0';
        isGameOver = false;
        overlay.classList.add('hidden');
        
        for (let i = 0; i < 4; i++) {
            const row = document.createElement('div');
            row.className = 'grid-row';
            
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                row.appendChild(cell);
            }
            
            gridContainer.appendChild(row);
        }
        
        addRandomTile();
        addRandomTile();
    }
    
    function addRandomTile() {
        const emptyCells = [];
        
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({i, j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const {i, j} = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            grid[i][j] = Math.random() < 0.9 ? 2 : 4;
            createTile(i, j, grid[i][j], true);
        }
    }
    
    function createTile(row, col, value, isNew = false, isMerged = false) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        if (value > 2048) tile.classList.add('tile-super');
        if (isNew) tile.classList.add('tile-new');
        if (isMerged) tile.classList.add('tile-merged');
        tile.textContent = value;
        tile.dataset.row = row;
        tile.dataset.col = col;
        
        tile.style.position = 'absolute';
        tile.style.top = `${15 + row * 115}px`;
        tile.style.left = `${15 + col * 115}px`;
        
        gridContainer.appendChild(tile);
    }
    
    function moveTiles(direction) {
        if (isGameOver) return false;
        
        let moved = false;
        const oldGrid = JSON.parse(JSON.stringify(grid));
        
        document.querySelectorAll('.tile').forEach(tile => tile.remove());
        
        if (direction === 'left') {
            for (let i = 0; i < 4; i++) {
                const {row, newScore} = moveRow(grid[i]);
                grid[i] = row;
                score += newScore;
                if (newScore > 0) moved = true;
            }
        } else if (direction === 'right') {
            for (let i = 0; i < 4; i++) {
                const reversedRow = [...grid[i]].reverse();
                const {row, newScore} = moveRow(reversedRow);
                grid[i] = row.reverse();
                score += newScore;
                if (newScore > 0) moved = true;
            }
        } else if (direction === 'up') {
            for (let j = 0; j < 4; j++) {
                let column = [grid[0][j], grid[1][j], grid[2][j], grid[3][j]];
                const {row, newScore} = moveRow(column);
                for (let i = 0; i < 4; i++) {
                    grid[i][j] = row[i];
                }
                score += newScore;
                if (newScore > 0) moved = true;
            }
        } else if (direction === 'down') {
            for (let j = 0; j < 4; j++) {
                let column = [grid[3][j], grid[2][j], grid[1][j], grid[0][j]];
                const {row, newScore} = moveRow(column);
                column = row.reverse();
                for (let i = 0; i < 4; i++) {
                    grid[i][j] = column[i];
                }
                score += newScore;
                if (newScore > 0) moved = true;
            }
        }
        
        if (JSON.stringify(oldGrid) !== JSON.stringify(grid)) {
            moved = true;
        }
        
        if (moved) {
            addRandomTile();
            scoreValue.textContent = score;
            
            if (checkWin()) {
                showGameOver(true);
                return true;
            }
            
            if (isGridFull() && !canMove()) {
                showGameOver(false);
                return true;
            }
        }
        
        recreateTiles(oldGrid);
        
        return moved;
    }
    
    function moveRow(row) {
        let newScore = 0;
        const newRow = [0, 0, 0, 0];
        let position = 0;
        
        for (let i = 0; i < 4; i++) {
            if (row[i] !== 0) {
                newRow[position] = row[i];
                position++;
            }
        }
        
        for (let i = 0; i < 3; i++) {
            if (newRow[i] !== 0 && newRow[i] === newRow[i + 1]) {
                newRow[i] *= 2;
                newRow[i + 1] = 0;
                newScore += newRow[i];
                i++;
            }
        }
        
        const finalRow = [0, 0, 0, 0];
        position = 0;
        for (let i = 0; i < 4; i++) {
            if (newRow[i] !== 0) {
                finalRow[position] = newRow[i];
                position++;
            }
        }
        
        return {row: finalRow, newScore};
    }
    
    function recreateTiles(oldGrid) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] !== 0) {
                    const isNew = oldGrid[i][j] !== grid[i][j];
                    const isMerged = oldGrid[i][j] !== grid[i][j] && oldGrid[i][j] !== 0;
                    createTile(i, j, grid[i][j], isNew, isMerged);
                }
            }
        }
    }
    
    function checkWin() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }
    
    function isGridFull() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    
    function canMove() {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i][j] === grid[i][j + 1]) {
                    return true;
                }
            }
        }
        
        for (let j = 0; j < 4; j++) {
            for (let i = 0; i < 3; i++) {
                if (grid[i][j] === grid[i + 1][j]) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    function showGameOver(isWin) {
        isGameOver = true;
        overlay.classList.remove('hidden');
        overlayTitle.textContent = isWin ? 'You Win!' : 'Game Over!';
    }
    
    function handleKeyDown(e) {
        if (isGameOver) return;
        
        let moved = false;
        switch (e.key) {
            case 'ArrowLeft':
                moved = moveTiles('left');
                break;
            case 'ArrowRight':
                moved = moveTiles('right');
                break;
            case 'ArrowUp':
                moved = moveTiles('up');
                break;
            case 'ArrowDown':
                moved = moveTiles('down');
                break;
            default:
                return;
        }
        
        if (moved) {
            e.preventDefault();
        }
    }
    
    let touchStartX = 0;
    let touchStartY = 0;
    
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
    
    function handleTouchEnd(e) {
        if (!touchStartX || !touchStartY) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (diffX > 0) {
                moveTiles('left');
            } else {
                moveTiles('right');
            }
        } else {
            if (diffY > 0) {
                moveTiles('up');
            } else {
                moveTiles('down');
            }
        }
        
        touchStartX = 0;
        touchStartY = 0;
    }
    
    document.addEventListener('keydown', handleKeyDown);
    gridContainer.addEventListener('touchstart', handleTouchStart, {passive: false});
    gridContainer.addEventListener('touchend', handleTouchEnd, {passive: false});
    
    newGameBtn.addEventListener('click', initGame);
    overlayBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        initGame();
    });
    
    initGame();
});