// main.js
const counterBox = document.getElementById("counter");
const racelaneBox = document.getElementById("racelane");
const racelaneBoxWidth = racelaneBox.getBoundingClientRect().width;

console.log(racelaneBoxWidth);


let counter = 0;

const increaseCounter = () => {
  counter += 10;
  counterBox.style.marginLeft = `${counter}px`;

  setTimeout(() => {
    if (counter > racelaneBoxWidth) {
      counter = 0;
      counterBox.style.marginLeft = `${counter}px`;
    }
  }, 0);
};

document.addEventListener("keydown", e => {
  if (e.keyCode === 32) {
    increaseCounter();
  }
});
