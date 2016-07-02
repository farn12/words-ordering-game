var words = ["It's", "all", "about", "the", "flow"];
var arrangedWords = [];

var freeFloatZone = document.getElementById('free-float-zone');

function initialize(){
	for(var i = 0; i < words.length; i++) {
		var word = words[i];
		var el = document.createElement("div");
		var textContent = document.createTextNode(word);
		el.appendChild(textContent);

		el.setAttribute("id", "box" + i);
		el.setAttribute("draggable", "true");

		el.classList.add("box");

		el.style.top = getRandomInt(200, 400) + "px";
		el.style.left = getRandomInt(200, 400) + "px";

		freeFloatZone.appendChild(el);
	}

	var boxes = document.querySelectorAll('#free-float-zone > .box ');
	for(var i = 0; i < boxes.length; i++) {
		var e = boxes[i];
		e.style.top = getRandomInt(200, 400) + "px";
		e.style.left = getRandomInt(200, 400) + "px";
	}


	var draggable = document.querySelectorAll('[draggable]');

	for(var i = 0; i < draggable.length; i++) {
		draggable[i].addEventListener("dragstart", handleDragStart);
	}

	var finishLine = document.getElementById('finish-line');

	finishLine.addEventListener("dragover", handleOverDrop);
	finishLine.addEventListener("drop", handleOverDrop);
	finishLine.addEventListener("dragenter", handleDragEnterLeave);
	finishLine.addEventListener("dragleave", handleDragEnterLeave);

}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function handleDragStart(e) {
	e.dataTransfer.setData("text", e.target.id);
}

function handleDragEnterLeave(e) {
	if(e.type == "dragenter") {
		this.className = "drag-enter";
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

	var index = arrangedWords.length;

	this.className = "";

	if(words[index] == text){
		arrangedWords.push(text);
		draggedEl.parentNode.removeChild(draggedEl);
		this.appendChild(draggedEl);

		if(arrangedWords.length == words.length){
			alert('Bingo! Congratulation!');
		}
	} else {
		return;
	}

}

initialize();