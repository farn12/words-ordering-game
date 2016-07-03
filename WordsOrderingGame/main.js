var game = new WordsGame();

var startBtn = document.getElementById('start-btn');
startBtn.onclick = function () {
    game.start();
}

game.leaderBoard.refresh();