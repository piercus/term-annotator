var {ipcRenderer, remote} = require('electron');

const annotate = function(opts){
  ipcRenderer.send('categorize', opts);
};

const onReady = function(){
  console.log('client, ready')
  ipcRenderer.send('get-all-info');
};

let classes, media, status = 'pending', splitKey, mediaType;

let history = [];
let currentQuestion;
let currentClass;

const changeStatus = function(newStatus, lastCategory){
  status = newStatus;
  console.log('status is now', status);
  document.getElementById('status').className = status;
  if(status === 'pending' && typeof(lastCategory) === 'string'){
    document.getElementById('last-category').innerHTML = lastCategory;
  }
  
}

const answerQuestion = function(choice){
  currentClass.answers[currentQuestion.name] = choice.value;
  const index = currentQuestion.index + 1;
  nextQuestion(index);
};

const nextQuestion = function(index = 0){
  if(index >= currentClass.params.length){
    const opts = Object.assign({}, {className: currentClass.name, media: media},{answers : currentClass.answers});
    history.push(opts)
    ipcRenderer.send('categorize', opts);
    changeStatus('pending', currentClass.name);
    quitQuestion();
    return;
  } else {
    currentQuestion = currentClass.params[index];
    currentQuestion.index = index;
    renderQuestion(currentQuestion);
    return;
  }
}
const unrenderQuestion = function(question){
  document.getElementById("question").innerHTML = "";
};
const renderQuestion = function(question){
  let html = "<div id='popup'><h2>"+question.label+"<h2><ul>";
  question.choices.forEach(function({label, key, value}){
    html+="<li>Press "+key+" : "+label+"</li>"
  })
  html+="<li>Press 'Escape' to quit</li></ul></div>";

  document.getElementById("question").innerHTML = html;
};

const quitQuestion = function(){
  unrenderQuestion();
  currentQuestion = null;
  currentClass = null;
}

const onKeyDownQuestion  = function(event){
  if(status !== 'question'){
    return;
  }
  const choices = currentQuestion.choices;
  for(var choice of choices) {
    if(event.key === choice.key){
      answerQuestion(choice)
      return;
    }
  }
  if(event.key === "Escape"){
    changeStatus('annotation');
    quitQuestion();
    return
  }
}

const onKeyDown = function(event){
  if(status === 'pending'){
    return;
  }
  if(status === 'question'){
    return onKeyDownQuestion(event);
  }
  if(event.ctrKey || event.altKey || event.shiftKey){
    console.log('not triggering cause alt/ctrl or shift is pressed')
    return;
  }
  for(var i in classes) if(classes.hasOwnProperty(i)){
    if(event.key === classes[i].key){
      if(Array.isArray(classes[i].params)){
        currentClass = classes[i];
        currentClass.answers = {};
        currentClass.name = i;
        changeStatus('question');
        nextQuestion();
        return;
      } else {
        const opts = {className: i, media: media};
        history.push(opts)
        ipcRenderer.send('categorize', opts);
        changeStatus('pending', i);
        return;
      }

    }
  }
  if(event.code === "ArrowLeft" && history.length > 0){// left arrow is previous
    const canceled = history[history.length - 1];
    ipcRenderer.send('uncategorize', canceled);
    history = history.slice(0, history.length - 2);
    changeStatus('pending', "PREVIOUS");
    return
  }
  if(event.code === "ArrowRight"){// right arrow is next
    ipcRenderer.send('get-all-info');
    history.push({media: media});
    changeStatus('pending', "NEXT");
    return;
  }
  if(typeof(splitKey) === 'string' && event.key === splitKey){// right arrow is next
    if(mediaType !== 'video'){
      throw(new Error('cannot use splitKey with none video'))
    }
    const splitPosition = document.getElementById("player").currentTime;
    const opts = {
      splitPosition,
      media: media
    }
    const answer = confirm(`Are you sure you want to split the video at ${splitPosition} ?\n This is not reversible !`);
    if(answer){
      ipcRenderer.send('split-video', opts);
      changeStatus('pending', "SPLIT");
      return;
    }
  }  
};

// Listen for main message
ipcRenderer.on('all-info', (event, arg) => {
  mediaType = arg.source.mediaType
  changeMedia(arg.source.nextFilename, mediaType);
  let firstRow = `<td>Source medias</td>`;
  let secondRow = `<td>${arg.source.numFiles}</td>`;
  let thirdRow = `<td></td>`
  const classNames = Object.keys(arg.classes);
  
  classNames.forEach(cN =>{
    firstRow+=`<td>${cN}</td>`;
    secondRow+=`<td>${arg.classes[cN].numFiles}</td>`;
    thirdRow+=`<td>press ${arg.classes[cN].key}</td>`
  });
  const message = `<table id='categories'><tr>${firstRow}</tr><tr>${secondRow}</tr><tr>${thirdRow}</tr></table>`;
  changeMessage(message);
  classes = arg.classes;
  splitKey = arg.source.splitKey;
  changeStatus('annotation');
});
// Listen for main message
ipcRenderer.on('error', (event, arg) => {
  console.log('error '+event, arg);
});
const changeMedia = function(newMedia, mediaType){
  if(!mediaType){
    mediaType = 'image'
  }
  media = newMedia;
  if(mediaType === 'video'){
    
    document.getElementById('img').style.display = 'none';
    document.getElementById('player').style.display = 'block';
    
    const video = document.getElementById('player');
    video.pause();
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }
    var source = document.createElement('source');
    source.setAttribute('src', media);
    video.appendChild(source);
    video.load();
    video.play();
    
  } else if(mediaType === 'media'){
    document.getElementById('img').attributes.src.value = media;
    document.getElementById('player').style.display = 'none';
    document.getElementById('img').style.display = 'block';
  }
};
const changeMessage = function(message){
  document.getElementById('message').innerHTML = message;
};
document.onkeydown = onKeyDown;
