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

const onKeyPress = function(event){
  for(var i in classes) if(classes.hasOwnProperty(i)){
    if(event.key === classes[i].key){
      const opts = {className: i, image: image};
      history.push(opts)
      ipcRenderer.send('categorize', opts);
      return;
    }
  }
  if(event.charCode === 37 && history.length > 0){// left arrow is previous
    const canceled = history[history.length - 1];
    ipcRenderer.send('uncategorize', opts);
    history = history.slice(0, history.length - 2);
    return
  }
  if(event.charCode === 39){// left arrow is previous
    ipcRenderer.send('get-all-info');
    return;
  }
};

// Listen for main message
ipcRenderer.on('all-info', (event, arg) => {
  changeImage(arg.source.randomFilename);
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

document.onkeypress = onKeyPress;
