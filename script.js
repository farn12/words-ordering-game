function Timer(timeDisplay) {
	var secondsLasted = 0;
	var intervalHandle;

	function displayTime() {
		// turn the seconds into mm:ss
		var min = Math.floor(secondsLasted / 60);
		var sec = secondsLasted - (min * 60);

		//add a leading zero (as a string value) if seconds less than 10
		if (sec < 10) {
			sec = "0" + sec;
		}

		// concatenate with colon
		var message = min.toString() + ":" + sec;

		// now change the display
		timeDisplay.innerHTML = message;
	}

	function tick() {
		secondsLasted++;
		displayTime();
	}

	return {
		start: function () {
			this.reset();
			intervalHandle = setInterval(tick, 1000);
		},
		stop: function () {
			clearInterval(intervalHandle);
		},
		reset: function () {
			this.stop();
			secondsLasted = 0;
			displayTime();
		},
		getCurrentValue: function () {
			return secondsLasted;
		}
	}
}

function WordsGame() {
	var words = ["It's", "all", "about", "the", "flow"];
	var arrangedWords = [];
	var freeFloatZone = document.getElementById('free-float-zone');
	var finishLine = document.getElementById('finish-line');
	var timerEl = document.getElementById('timer');
	var timer = new Timer(timerEl);

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	function handleDragStart(e) {
		e.dataTransfer.setData("text", e.target.id);
	}

	function handleDragEnterLeave(e) {
		var draggedId = e.dataTransfer.getData("text");
		var draggedEl = document.getElementById(draggedId);
		var text = draggedEl.innerHTML;

		if (e.type == "dragenter") {
			if(checkNextWord(text)){
				this.className = "drag-enter-correct";
			}else{
				this.className = "drag-enter-incorrect";
			}
		} else {
			this.className = "";
		}
	}

	function handleOverDrop(e) {
		e.preventDefault();

		if (e.type != "drop") {
			return;
		}
		var draggedId = e.dataTransfer.getData("text");
		var draggedEl = document.getElementById(draggedId);
		var text = draggedEl.innerHTML;

		this.className = "";

		if (checkNextWord(text)) {
			arrangedWords.push(text);
			draggedEl.parentNode.removeChild(draggedEl);
			// this.appendChild(draggedEl);
			finishLine.innerHTML += text + " ";

			if (arrangedWords.length == words.length) {
				stopGame();
				var name = prompt("Please enter your name");
				alert('Congratulation ' + name + '! Your time is ' + timer.getCurrentValue() + ' seconds.')
			}
		} else {
			return;
		}
	}

	function checkNextWord(word){
		var index = arrangedWords.length;
		return words[index] == word;
	}

	function stopGame() {
		timer.stop();
	}

	return {
		start: function () {
			this.reset();
			timer.start();
			for (var i = 0; i < words.length; i++) {
				var word = words[i];
				var el = document.createElement("div");
				var textContent = document.createTextNode(word);
				el.appendChild(textContent);

				el.setAttribute("id", "box" + i);
				el.setAttribute("draggable", "true");

				el.classList.add("box");

				el.style.top = getRandomInt(150, 350) + "px";
				el.style.left = getRandomInt(150, 350) + "px";
				// el.style.cursor = "pointer";

				freeFloatZone.appendChild(el);
			}

			var draggable = document.querySelectorAll('[draggable]');

			for (var i = 0; i < draggable.length; i++) {
				draggable[i].addEventListener("dragstart", handleDragStart);
			}

			finishLine.addEventListener("dragover", handleOverDrop);
			finishLine.addEventListener("drop", handleOverDrop);
			finishLine.addEventListener("dragenter", handleDragEnterLeave);
			finishLine.addEventListener("dragleave", handleDragEnterLeave);
		},
		stop: function(){
			stopGame();
		},
		reset: function () {
			this.stop();
			arrangedWords = [];
			freeFloatZone.innerHTML = '';
			finishLine.innerHTML = '';
			timer.reset();
		}
	}
}

function LeaderBoard(){
	var scores = [{
		rank: 1,
		player: "Dao",
		time: 5
	},{
		rank: 2,
		player: "Thi",
		time: 7
	},{
		rank: 3,
		player: "Vu",
		time: 8
	},{
		rank: 4,
		player: "Hoa",
		time: 8
	},{
		rank: 5,
		player: "Bang",
		time: 10
	},];

	var highscoreTable = document.getElementById('s-tbl');
	var highscoreTableBody = document.getElementById('hs-tbl-body');

	for (var i = 0; i < scores.length; i++) {
		var score = scores[i];
		var tr = document.createElement('tr');
		var rankTd = document.createElement('td');
		var playerTd = document.createElement('td');
		var timeTd = document.createElement('td');

		rankTd.innerHTML = score.rank;
		playerTd.innerHTML = score.player;
		timeTd.innerHTML = score.time;

		tr.appendChild(rankTd);
		tr.appendChild(playerTd);
		tr.appendChild(timeTd);

		highscoreTableBody.appendChild(tr);
	}
}

var game = new WordsGame();
var leaderBoard = new LeaderBoard();

var startBtn = document.getElementById('start-btn');
startBtn.onclick = function () {
	game.start();
}