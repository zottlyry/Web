let score = 0;
const scoreDisplay = document.getElementById('score');

const resetButton = document.getElementById('reset');
resetButton.addEventListener('click', () => {
  score = 0;
  scoreDisplay.textContent = score;
});

function makeSelection(playerSelection) {
  const computerSelection = ['rock', 'paper', 'scissors'][Math.floor(Math.random() * 3)];

  switch (playerSelection + computerSelection) {
    case 'rockscissors':
    case 'paperrock':
    case 'scissorspaper':
      score++;
      break;
    case 'rockpaper':
    case 'paperscissors':
    case 'scissorsrock':
      score--;
      break;
  }
  scoreDisplay.textContent = score;
}