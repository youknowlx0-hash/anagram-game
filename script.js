let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

let positions = [];
let currentWord = "";
let selected = [];

let level = 0;
let coins = 0;
let levels = [];
let foundWords = [];
let dictionary = [];

// LOAD WORDS
fetch("words.json")
.then(res => res.json())
.then(data => {
  dictionary = data;
  levels = generateLevels(); // 🔥 1000 levels auto
  loadLevel();
});

// GENERATE LEVELS
function generateLevels() {
  let levels = [];

  while (levels.length < 1000) {
    let baseWord = getRandomWord(5, 7);
    let letters = baseWord.split('');

    let possible = findWordsFromLetters(letters);

    if (possible.length >= 3) {
      levels.push({
        letters: shuffle(letters).join(''),
        answers: possible.slice(0, 4)
      });
    }
  }

  return levels;
}

function getRandomWord(min, max) {
  let words = dictionary.filter(w => w.length >= min && w.length <= max);
  return words[Math.floor(Math.random() * words.length)];
}

function findWordsFromLetters(letters) {
  return dictionary.filter(word => {
    let temp = letters.slice();
    for (let l of word) {
      let index = temp.indexOf(l);
      if (index === -1) return false;
      temp.splice(index, 1);
    }
    return true;
  });
}

function shuffle(arr) {
  return arr.sort(() => 0.5 - Math.random());
}

// LOAD LEVEL
function loadLevel() {
  currentWord = "";
  selected = [];
  foundWords = [];

  let levelData = levels[level];

  document.getElementById("level").innerText = "Level " + (level + 1);
  document.getElementById("coins").innerText = "Coins: " + coins;

  drawLetters(levelData.letters);
  drawBlanks(levelData.answers);
}

// DRAW BLANKS
function drawBlanks(words) {
  let box = document.getElementById("word-box");
  box.innerHTML = "";

  words.forEach(w => {
    let div = document.createElement("div");
    div.innerText = "_ ".repeat(w.length);
    div.id = "word-" + w;
    box.appendChild(div);
  });
}

// DRAW LETTERS
function drawLetters(letters) {
  ctx.clearRect(0, 0, 300, 300);
  positions = [];

  let arr = letters.split('');

  let centerX = 150;
  let centerY = 150;
  let radius = 100;

  arr.forEach((letter, i) => {
    let angle = (i / arr.length) * Math.PI * 2;
    let x = centerX + radius * Math.cos(angle);
    let y = centerY + radius * Math.sin(angle);

    positions.push({x, y, letter});

    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#00c3ff";
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.fillText(letter, x - 5, y + 5);
  });
}

// TOUCH CONTROLS
canvas.addEventListener("touchstart", () => {
  currentWord = "";
  selected = [];
});

canvas.addEventListener("touchmove", (e) => {
  let rect = canvas.getBoundingClientRect();
  let touch = e.touches[0];

  let x = touch.clientX - rect.left;
  let y = touch.clientY - rect.top;

  positions.forEach(p => {
    let dist = Math.hypot(p.x - x, p.y - y);

    if (dist < 25 && !selected.includes(p)) {
      selected.push(p);
      currentWord += p.letter;
    }
  });
});

// BUTTONS
function submitWord() {
  let answers = levels[level].answers;

  if (answers.includes(currentWord) && !foundWords.includes(currentWord)) {
    foundWords.push(currentWord);

    document.getElementById("word-" + currentWord).innerText = currentWord;

    coins += 10;

    if (foundWords.length === answers.length) {
      alert("🎉 Level Complete!");
      level++;
      loadLevel();
    }

  } else {
    alert("❌ Wrong!");
  }

  currentWord = "";
  selected = [];
}

function clearWord() {
  currentWord = "";
  selected = [];
}

function showHint() {
  let answers = levels[level].answers;

  for (let w of answers) {
    if (!foundWords.includes(w)) {
      alert("Hint: " + w[0]);
      break;
    }
  }
                    }
