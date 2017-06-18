const countElem = document.querySelector("#count");
const timeElem = document.querySelector("#time");

let count = 0;

function render(time) {
  time *= 0.001;  // seconds
  ++count;

  countElem.textContent = count;
  timeElem.textContent = time.toFixed(2);

  requestAnimationFrame(render);
}
requestAnimationFrame(render);

