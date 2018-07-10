var {ipcRenderer, remote} = require('electron');

const annotate = function(opts){
  ipcRenderer.send('categorize', opts);
};

const onReady = function(){
  console.log('client, ready')
  ipcRenderer.send('get-all-info');
};

let classes, image;

let history = [];

const onKeyDown = function(event){
  for(var i in classes) if(classes.hasOwnProperty(i)){
    if(event.key === classes[i].key){
      const opts = {className: i, image: image};
      history.push(opts)
      ipcRenderer.send('categorize', opts);
      return;
    }
  }
  if(event.code === "ArrowLeft" && history.length > 0){// left arrow is previous
    const canceled = history[history.length - 1];
    ipcRenderer.send('uncategorize', canceled);
    history = history.slice(0, history.length - 2);
    return
  }
  if(event.code === "ArrowRight"){// right arrow is next
    ipcRenderer.send('get-all-info');
    history.push({image: image});
    return;
  }
};

// Listen for main message
ipcRenderer.on('all-info', (event, arg) => {
  changeImage(arg.source.randomFilename);
  let message = `Source images : ${arg.source.numFiles}<br/>`;
  const classNames = Object.keys(arg.classes);
  classNames.forEach(cN =>{
    message+= `${cN} : ${arg.classes[cN].numFiles}, press ${arg.classes[cN].key}<br/>`;
  });
  changeMessage(message);
  classes = arg.classes;
});
// Listen for main message
ipcRenderer.on('error', (event, arg) => {
  console.log('error '+event, arg);
});
const changeImage = function(img){
  image = img;
  document.getElementById('img').attributes.src.value = img;
};
const changeMessage = function(message){
  document.getElementById('message').innerHTML = message;
};
document.onkeydown = onKeyDown;
