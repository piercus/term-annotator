const Ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

var { ipcRenderer, remote } = require('electron');

const annotate = function (opts) {
  ipcRenderer.send('categorize', opts);
};

const onReady = function () {
  console.log('client, ready')
  ipcRenderer.send('get-all-info');
};

let classes, media, status = 'pending', splitKey, mediaType;
let history = [];
let currentQuestion;
let currentClass;

const changeStatus = function (newStatus, lastCategory) {
  status = newStatus;
  console.log('status is now', status);
  document.getElementById('status').className = status;
  if (status === 'pending' && typeof (lastCategory) === 'string') {
    document.getElementById('last-category').innerHTML = lastCategory;
  }

}

const answerQuestion = function (choice) {
  currentClass.answers[currentQuestion.name] = choice.value;
  const index = currentQuestion.index + 1;
  nextQuestion(index);
};

const nextQuestion = function (index = 0) {
  if (index >= currentClass.params.length) {
    const opts = Object.assign({}, { className: currentClass.name, media: media }, { answers: currentClass.answers });
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
const unrenderQuestion = function (question) {
  document.getElementById("question").innerHTML = "";
};
const renderQuestion = function (question) {
  let html = "<div id='popup'><h2>" + question.label + "<h2><ul>";
  question.choices.forEach(function ({ label, key, value }) {
    html += "<li>Press " + key + " : " + label + "</li>"
  })
  html += "<li>Press 'Escape' to quit</li></ul></div>";

  document.getElementById("question").innerHTML = html;
};

const quitQuestion = function () {
  unrenderQuestion();
  currentQuestion = null;
  currentClass = null;
}

const onKeyDownQuestion = function (event) {
  if (status !== 'question') {
    return;
  }
  const choices = currentQuestion.choices;
  for (var choice of choices) {
    if (event.key === choice.key) {
      answerQuestion(choice)
      return;
    }
  }
  if (event.key === "Escape") {
    changeStatus('annotation');
    quitQuestion();
    return
  }
}

const onKeyDown = function (event) {
  if (status === 'pending') {
    return;
  }
  if (status === 'question') {
    return onKeyDownQuestion(event);
  }
  if (event.ctrKey || event.altKey || event.shiftKey) {
    console.log('not triggering cause alt/ctrl or shift is pressed')
    return;
  }
  for (var i in classes) if (classes.hasOwnProperty(i)) {
    if (event.key === classes[i].key) {
      if (Array.isArray(classes[i].params)) {
        currentClass = classes[i];
        currentClass.answers = {};
        currentClass.name = i;
        changeStatus('question');
        nextQuestion();
        return;
      } else {
        const opts = { className: i, media: media };
        history.push(opts)
        ipcRenderer.send('categorize', opts);
        changeStatus('pending', i);
        return;
      }

    }
  }
  if (event.code === "ArrowLeft" && history.length > 0) {// left arrow is previous
    const canceled = history[history.length - 1];
    ipcRenderer.send('uncategorize', canceled);
    history = history.slice(0, history.length - 2);
    changeStatus('pending', "PREVIOUS");
    return
  }
  if (event.code === "ArrowRight") {// right arrow is next
    ipcRenderer.send('get-all-info');
    history.push({ media: media });
    changeStatus('pending', "NEXT");
    return;
  }
  if (typeof (splitKey) === 'string' && event.key === splitKey) {// right arrow is next
    if (mediaType !== 'video') {
      throw (new Error('cannot use splitKey with none video'))
    }
    const splitPosition = document.getElementById("player").currentTime;
    const opts = {
      splitPosition,
      media: media
    }
    const answer = confirm(`Are you sure you want to split the video at ${splitPosition} ?\n This is not reversible !`);
    if (answer) {
      ipcRenderer.send('split-video', opts);
      changeStatus('pending', "SPLIT");
      return;
    }
  }
};

const nextThumbnail = function (classDir, id) {
  const dest = `${classDir}/thumbnails`;
  const gifs = fs.readdirSync(classDir).filter(gif => gif.match(/.gif$/));
  const gif = classDir + '/' + gifs[Math.floor(Math.random() * gifs.length)];
  const gifName = gif.match(/([-._a-z0-9]*).gif$/)[1];
  return new Promise((resolve, reject) => {
    let stream = new Ffmpeg();
    stream = stream.input(gif);
    stream.videoFilters('fps=0.1')
      .save(dest + `/${gifName}-%d.png`)
      .on('start', cmd => console.log(cmd))
      .on('error', reject)
      .on('end', () => {
        return resolve();
      }).run();
  }).then(() => {
    const thumbnails = fs.readdirSync(dest);
    const thumbnail = dest + '/' + thumbnails[Math.floor(Math.random() * thumbnails.length)];
    document.getElementById(id).src = '../../' + thumbnail;
  })
}

const changeSpeed = function (speed) {
  const gif = document.getElementById('img').attributes.src.value;
  const match = gif.match(/([-._a-z0-9]*)\/([-._a-z0-9]*)$/);
  if (!match) {
    throw new Error(`didn't match name pattern`);
  }
  return new Promise((resolve, reject) => {
    let ffmpeg = new Ffmpeg();
    ffmpeg = ffmpeg.input(gif)
      .ffprobe(function (err, data) {
        if (err) reject(err);
        const fps = eval(data.streams['0'].r_frame_rate)
        resolve(fps)
      });
  }).then((fps) => {
    const newFps = fps / speed;
    const gifName = match[2];
    let output;
    const match2 = gifName.match(/([-0-9a-z]*)?-([.0-9]*).gif$/);
    if (!match2) {
      output = gif.replace(/.gif$/, '-' + newFps + '.gif');
    } else {
      output = gif.replace(/([.0-9]*).gif$/, newFps + '.gif');
    }
    return new Promise((resolve, reject) => {
      const frameRate = fps / Number(speed);
      let stream = new Ffmpeg();
      stream = stream.input(gif)
      stream.videoFilters(`setpts=${speed}*PTS`).outputOptions([`-r ${frameRate}`])
        .output(output)
        .on('start', cmd => console.log(cmd))
        .on('error', reject)
        .on('end', () => {
          resolve(output);
        }).run();
    })
  }).then((output) => {
    document.getElementById('img').attributes.src.value = "";
    fs.unlinkSync(gif);
    changeMedia(output, "image")
    document.getElementById('img').attributes.src.value = output;
  })
}

// Listen for main message
ipcRenderer.on('all-info', (event, arg) => {
  mediaType = arg.source.mediaType
  changeMedia(arg.source.nextFilename, mediaType);
  let firstRow = `<td>Source medias</td>`;
  let secondRow = `<td>${arg.source.numFiles}</td>`;
  let thirdRow = `<td></td>`
  let forthRow = `<td></td>`
  let fifthRow = `<td></td>`
  let sixthRow = `<td></td>`
  let seventhRow = `<td></td>`
  const classNames = Object.keys(arg.classes);

  classNames.forEach(cN => {
    firstRow += `<td>${cN}</td>`;
    secondRow += `<td>${arg.classes[cN].numFiles}</td>`;
    thirdRow += `<td>press ${arg.classes[cN].key}</td>`
  });
  const paramsNames = Object.keys(arg.params);
  paramsNames.forEach(pN => {
    if (arg.params[pN].main) {
      const sharedChoisesNum = arg.params[pN].sub[0].choices.length / arg.params[pN].main.choices.length
      arg.params[pN].main.choices.forEach((ch) => {
        forthRow += `<td colspan="${sharedChoisesNum}">&nbsp;${arg.params[pN].main.name}-${ch.label}</td>`
      })
      arg.params[pN].sub[0].choices.forEach((choice, index) => {
        fifthRow += `<td>${choice.label}</td>`
        sixthRow += `<td>${choice.numFiles}</td>`
        if (choice.thumbnail) {
          const classDir = choice.thumbnail.replace(/thumbnails\/[-_.0-9a-z]*$/, "")
          seventhRow += `<td > \
            <img id=${index} src='../../${choice.thumbnail}' style="width:250px;height:300px !important;"> \
            <a href="#"  id=${classDir} onclick="nextThumbnail(id, ${index})" class="next">Next Image &raquo;</a> \
            </td>`
        } else {
          seventhRow += `<td><img src='./dist/No_Image_Available.png' style="width:70px;height:70px !important;"></td>`
        }

      })
    }
  })
  const message = `<table id='categories'><tr>${firstRow}</tr><tr>${secondRow}</tr><tr>${thirdRow}</tr></table>`;
  const message2 = `<table id='categories'><tr>${forthRow}</tr><tr>${fifthRow}</tr><tr>${sixthRow}</tr><tr>${seventhRow}</tr></table>`;

  changeMessage(message);
  changeMessage2(message2);
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
    document.getElementById('player').style.display = 'none';
    document.getElementById('img').attributes.src.value = newMedia;
  }
  if (mediaType === 'video') {

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

  } else if (mediaType === 'media') {

    document.getElementById('img').attributes.src.value = media;
    document.getElementById('player').style.display = 'none';
    document.getElementById('img').style.display = 'block';
  }
};
const changeMessage = function (message) {
  document.getElementById('message').innerHTML = message;
};
const changeMessage2 = function (message2) {
  document.getElementById('message2').innerHTML = message2;
};
document.onkeydown = onKeyDown;
