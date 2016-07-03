// Timer stop watch
function Timer(timeDisplay) {
	var secondsLasted = 0;
	var intervalHandle;

	// convert seconds to m:ss format
	function convertSecondsToTime(seconds) {
	    // turn the seconds into mm:ss
	    var min = Math.floor(seconds / 60);
	    var sec = seconds - (min * 60);

	    //add a leading zero (as a string value) if seconds less than 10
	    if (sec < 10) {
	        sec = "0" + sec;
	    }

	    // concatenate with colon
	    var message = min.toString() + ":" + sec;
	    return message;
	}

	// show time on DOM
	function displayTime() {
	    timeDisplay.innerHTML = convertSecondsToTime(secondsLasted);
	}

	// clock tick
	function tick() {
		secondsLasted++;
		displayTime();
	}

	return {
		// start timer
		start: function () {
			this.reset();
			intervalHandle = setInterval(tick, 1000);
		},
		// stop timer
		stop: function () {
			clearInterval(intervalHandle);
		},
		// reset timer
		reset: function () {
			this.stop();
			secondsLasted = 0;
			displayTime();
		},
		// get current value of timer in second
		getCurrentValue: function () {
			return secondsLasted;
		},
		// convert seconds to m:ss format
		convertSecondsToTime: convertSecondsToTime
	}
}

// LeaderBoard to show high scores
function LeaderBoard() {
    var scores = [];

    var timer = new Timer();
    var xhr = new Xhr();

    var highscoreTable = document.getElementById('s-tbl');
    var highscoreTableBody = document.getElementById('hs-tbl-body');

	// display scores to the leader board
    function displayScores() {
        highscoreTableBody.innerHTML = '';
        for (var i = 0; i < scores.length; i++) {
            var score = scores[i];
            var tr = document.createElement('tr');
            var rankTd = document.createElement('td');
            var playerTd = document.createElement('td');
            var timeTd = document.createElement('td');

            rankTd.innerHTML = score.rank;
            rankTd.className = 'number';

            playerTd.innerHTML = score.name;
            playerTd.className = 'text';

            timeTd.innerHTML = timer.convertSecondsToTime(score.timeInSecond);
            timeTd.className = 'number';

            tr.appendChild(rankTd);
            tr.appendChild(playerTd);
            tr.appendChild(timeTd);

            highscoreTableBody.appendChild(tr);
        }
    }

    return {
		// reload data of high scores from server and display to screen
        refresh: function () {
            xhr.get('/api/scores', function (xhr) {
                scores = JSON.parse(xhr.response);
                console.log(scores);
                displayScores();
            });
        }
    };
}

// The game play
function WordsGame() {
	var words = ["It's", "all", "about", "the", "flow"]; // The list and order of words for the game

	var timer = new Timer(timerEl);
	var leaderBoard = new LeaderBoard();
	var xhr = new Xhr();
	
	var freeFloatZone = document.getElementById('free-float-zone');
	var finishLine = document.getElementById('finish-line');
	var timerEl = document.getElementById('timer');

	var arrangedWords = [];
	var beingDraggedEl = null;

	// Generate random integer within a range
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	function handleDragStart(e) {
	    beingDraggedEl = e.target;
	}

	function handleDragEnterLeave(e) {
	    var text = beingDraggedEl.innerHTML;

		if (e.type == "dragenter") {
			// check if correct word or not when dragging enter
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

		var text = beingDraggedEl.innerHTML;

		this.className = "";

		if (checkNextWord(text)) {
			arrangedWords.push(text);
			beingDraggedEl.parentNode.removeChild(beingDraggedEl);
			finishLine.innerHTML += text + " ";

			// finish game if all words are arranged correctly
			if (arrangedWords.length == words.length) {
				stopGame();
				var name;
				while (!name) {
				    name = prompt("Please enter your name"); // enter name to save
				}
			    
				// submit player and score to the server
				xhr.post('/api/scores', {
				    name: name,
				    timeInSecond: timer.getCurrentValue()
				}, function (result) {
				    var score = JSON.parse(result.response);
				    console.log("submitted", score);
				    leaderBoard.refresh(); // refresh leaderboard
				});
			}
		} else {
			return;
		}
	}

	// check if next word is correct
	function checkNextWord(word){
		var index = arrangedWords.length;
		return words[index] == word;
	}

	function stopGame() {
		timer.stop();
	}

	return {
		// start playing
		start: function () {
			this.reset();
			timer.start();
			var displayedObjects = [];

			function getRandomCoordinate() {
			    return {
			        x: getRandomInt(150, 350),
			        y: getRandomInt(150, 350)
			    }
			}

			// check if the new word display position is overlap with a current word
			function checkOverlap(coordinate) {
			    for (var i = 0; i < displayedObjects.length; i++) {
			        var displayedCoordinate = displayedObjects[i];
			        var xDiff = coordinate.x - displayedCoordinate.x;
			        var yDiff = coordinate.y - displayedCoordinate.y;
			        if ((xDiff * xDiff + yDiff * yDiff) < 50 * 50) {
			            return false;
			        }
			    }

			    return true;
			}

			for (var i = 0; i < words.length; i++) {
				var word = words[i];
				var el = document.createElement("div");
				var textContent = document.createTextNode(word);
				el.appendChild(textContent);

				el.setAttribute("id", "box" + i);
				el.setAttribute("draggable", "true");

				el.classList.add("box");

				var coordinate = getRandomCoordinate();
				while (!checkOverlap(coordinate)) {
				    coordinate = getRandomCoordinate();
				}

				displayedObjects.push(coordinate);

				el.style.top = coordinate.x + "px";
				el.style.left = coordinate.y + "px";

				el.addEventListener("dragstart", handleDragStart);

				freeFloatZone.appendChild(el);
			}

			finishLine.addEventListener("dragover", handleOverDrop);
			finishLine.addEventListener("drop", handleOverDrop);
			finishLine.addEventListener("dragenter", handleDragEnterLeave);
			finishLine.addEventListener("dragleave", handleDragEnterLeave);
		},
		// stop game
		stop: function(){
			stopGame();
		},
		// reset game
		reset: function () {
			this.stop();
			arrangedWords = [];
			freeFloatZone.innerHTML = '';
			finishLine.innerHTML = '';
			finishLine.className = '';
			timer.reset();
		},
		leaderBoard: leaderBoard
	}
}
