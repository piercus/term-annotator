const {ipcRenderer} = require('electron');

const annotate = function (opts) { // eslint-disable-line no-unused-vars
	ipcRenderer.send('categorize', opts);
};

const onReady = function () { // eslint-disable-line no-unused-vars
	console.log('client, ready');
	ipcRenderer.send('get-all-info');
};

let classes;
let media;
let status = 'pending';
let splitKey;
let mediaType;

let history = [];
let currentQuestion;
let currentClass;

const changeStatus = function (newStatus, lastCategory) {
	status = newStatus;
	console.log('status is now', status);
	document.querySelector('#status').className = status;
	if (status === 'pending' && typeof (lastCategory) === 'string') {
		document.querySelector('#last-category').innerHTML = lastCategory;
	}
};

const answerQuestion = function (choice) {
	currentClass.answers[currentQuestion.name] = choice.value;
	const index = currentQuestion.index + 1;
	nextQuestion(index);
};

const nextQuestion = function (index = 0) {
	if (index >= currentClass.params.length) {
		const opts = Object.assign({}, {className: currentClass.name, media}, {answers: currentClass.answers});
		history.push(opts);
		ipcRenderer.send('categorize', opts);
		changeStatus('pending', currentClass.name);
		quitQuestion();
	} else {
		currentQuestion = currentClass.params[index];
		currentQuestion.index = index;
		renderQuestion(currentQuestion);
	}
};

const unrenderQuestion = function () {
	document.querySelector('#question').innerHTML = '';
};

const renderQuestion = function (question) {
	let html = '<div id=\'popup\'><h2>' + question.label + '<h2><ul>';
	question.choices.forEach(({label, key}) => {
		html += '<li>Press ' + key + ' : ' + label + '</li>';
	});
	html += '<li>Press \'Escape\' to quit</li></ul></div>';

	document.querySelector('#question').innerHTML = html;
};

const quitQuestion = function () {
	unrenderQuestion();
	currentQuestion = null;
	currentClass = null;
};

const onKeyDownQuestion = function (event) {
	if (status !== 'question') {
		return;
	}

	const {choices} = currentQuestion;
	for (const choice of choices) {
		if (event.key === choice.key) {
			answerQuestion(choice);
			return;
		}
	}

	if (event.key === 'Escape') {
		changeStatus('annotation');
		quitQuestion();
	}
};

const onKeyDown = function (event) {
	if (status === 'pending') {
		return;
	}

	if (status === 'question') {
		return onKeyDownQuestion(event);
	}

	if (event.ctrKey || event.altKey || event.shiftKey) {
		console.log('not triggering cause alt/ctrl or shift is pressed');
		return;
	}

	for (const i in classes) {
		if (Object.prototype.hasOwnProperty.call(classes, i)) {
			if (event.key === classes[i].key) {
				if (Array.isArray(classes[i].params)) {
					currentClass = classes[i];
					currentClass.answers = {};
					currentClass.name = i;
					changeStatus('question');
					nextQuestion();
					return;
				}

				const opts = {className: i, media};
				history.push(opts);
				ipcRenderer.send('categorize', opts);
				changeStatus('pending', i);
				return;
			}
		}
	}

	if (event.code === 'ArrowLeft' && history.length > 0) {// Left arrow is previous
		const canceled = history[history.length - 1];
		ipcRenderer.send('uncategorize', canceled);
		history = history.slice(0, history.length - 2);
		changeStatus('pending', 'PREVIOUS');
		return;
	}

	if (event.code === 'ArrowRight') {// Right arrow is next
		ipcRenderer.send('get-all-info');
		history.push({media});
		changeStatus('pending', 'NEXT');
		return;
	}

	if (typeof (splitKey) === 'string' && event.key === splitKey) {// Right arrow is next
		if (mediaType !== 'video') {
			throw (new Error('cannot use splitKey with none video'));
		}

		const splitPosition = document.querySelector('#player').currentTime;
		const opts = {
			splitPosition,
			media
		};
		const answer = confirm(`Are you sure you want to split the video at ${splitPosition} ?\n This is not reversible !`); // eslint-disable-line no-alert
		if (answer) {
			ipcRenderer.send('split-video', opts);
			changeStatus('pending', 'SPLIT');
		}
	}
};

// Listen for main message
ipcRenderer.on('all-info', (event, arg) => {
	mediaType = arg.source.mediaType;
	changeMedia(arg.source.nextFilename, mediaType);
	let firstRow = '<td>Source medias</td>';
	let secondRow = `<td>${arg.source.numFiles}</td>`;
	let thirdRow = '<td></td>';
	const classNames = Object.keys(arg.classes);

	classNames.forEach(cN => {
		firstRow += `<td>${cN}</td>`;
		secondRow += `<td>${arg.classes[cN].numFiles}</td>`;
		thirdRow += `<td>press ${arg.classes[cN].key}</td>`;
	});
	const message = `<table id='categories'><tr>${firstRow}</tr><tr>${secondRow}</tr><tr>${thirdRow}</tr></table>`;
	changeMessage(message);
	classes = arg.classes;
	splitKey = arg.source.splitKey;
	changeStatus('annotation');
});
// Listen for main message
ipcRenderer.on('error', (event, arg) => {
	console.log('error ' + event, arg);
});
const changeMedia = function (newMedia, mediaType) {
	media = newMedia;
	if (!mediaType) {
		mediaType = 'image';
		document.querySelector('#player').style.display = 'none';
		document.querySelector('#img').attributes.src.value = newMedia;
	}

	if (mediaType === 'video') {
		document.querySelector('#img').style.display = 'none';
		document.querySelector('#player').style.display = 'block';

		const video = document.querySelector('#player');
		video.pause();
		while (video.firstChild) {
			video.removeChild(video.firstChild);
		}

		const source = document.createElement('source');
		source.setAttribute('src', media);
		video.append(source);
		video.load();
		video.play();
	} else if (mediaType === 'media') {
		document.querySelector('#img').attributes.src.value = media;
		document.querySelector('#player').style.display = 'none';
		document.querySelector('#img').style.display = 'block';
	}
};

const changeMessage = function (message) {
	document.querySelector('#message').innerHTML = message;
};

// Listen config window for main message
ipcRenderer.on('config', () => {
	ipcRenderer.send('src-dir');
});

document.addEventListener('keydown', onKeyDown);
