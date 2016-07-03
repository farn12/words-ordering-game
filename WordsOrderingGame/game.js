function Timer(timeDisplay) {
	var secondsLasted = 0;
	var intervalHandle;

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

	function displayTime() {
	    timeDisplay.innerHTML = convertSecondsToTime(secondsLasted);
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
		},
		convertSecondsToTime: convertSecondsToTime
	}
}

function LeaderBoard() {
    var scores = [];
    var timer = new Timer();
    var xhr = new Xhr();

    var highscoreTable = document.getElementById('s-tbl');
    var highscoreTableBody = document.getElementById('hs-tbl-body');

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
        refresh: function () {
            xhr.get('/api/scores', function (xhr) {
                scores = JSON.parse(xhr.response);
                console.log(scores);
                displayScores();
            });
        }
    };
}

function WordsGame() {
	var words = ["It's", "all", "about", "the", "flow"];
	var arrangedWords = [];
	var freeFloatZone = document.getElementById('free-float-zone');
	var finishLine = document.getElementById('finish-line');
	var timerEl = document.getElementById('timer');
	var timer = new Timer(timerEl);
	var leaderBoard = new LeaderBoard();
	var beingDraggedEl = null;
	var xhr = new Xhr();

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	function handleDragStart(e) {
	    beingDraggedEl = e.target;
	}

	function handleDragEnterLeave(e) {
	    var text = beingDraggedEl.innerHTML;

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

		var text = beingDraggedEl.innerHTML;

		this.className = "";

		if (checkNextWord(text)) {
			arrangedWords.push(text);
			beingDraggedEl.parentNode.removeChild(beingDraggedEl);
			finishLine.innerHTML += text + " ";

			if (arrangedWords.length == words.length) {
				stopGame();
				var name;
				while (!name) {
				    name = prompt("Please enter your name");
				}
			    //alert('Congratulation ' + name + '! Your time is ' + timer.getCurrentValue() + ' seconds.')
				xhr.post('/api/scores', {
				    name: name,
				    timeInSecond: timer.getCurrentValue()
				}, function (result) {
				    var score = JSON.parse(result.response);
				    console.log("submitted", score);
				    stopGame();
				    leaderBoard.refresh();
				});
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
			var displayedObjects = [];

			function getRandomCoordinate() {
			    return {
			        x: getRandomInt(150, 350),
			        y: getRandomInt(150, 350)
			    }
			}

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
			finishLine.className = '';
			timer.reset();
		},
		leaderBoard: leaderBoard
	}
}
