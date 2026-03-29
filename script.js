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

let correctSound = document.getElementById("correctSound");
let wrongSound = document.getElementById("wrongSound");

// LOAD WORDS
fetch("words.json")
.then(res => res.json())
.then(data => {
  dictionary = data;
  levels = generateLevels();
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
      let i = temp.indexOf(l);
      if (i === -1) return false;
      temp.splice(i, 1);
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

  let data = levels[level];

  document.getElementById("level").innerText = "Level " + (level + 1);
  document.getElementById("coins").innerText = "Coins: " + coins;

  drawLetters(data.letters);
  drawBlanks(data.answers);
}

// DRAW BLANKS
function drawBlanks(words) {
  let box = document.getElementById("word-box");
  box.innerHTML = "";

  words.forEach(w => {
    let d = document.createElement("div");
    d.innerText = "_ ".repeat(w.length);
    d.id = "word-" + w;
    box.appendChild(d);
  });
}

// DRAW LETTERS
function drawLetters(letters) {
  ctx.clearRect(0, 0, 300, 300);
  positions = [];

  let arr = letters.split('');
  let cx = 150, cy = 150, r = 100;

  arr.forEach((l, i) => {
    let a = (i / arr.length) * Math.PI * 2;
    let x = cx + r * Math.cos(a);
    let y = cy + r * Math.sin(a);

    positions.push({x, y, letter: l});

    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#00c3ff";
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.fillText(l, x - 5, y + 5);
  });
}

// TOUCH
canvas.addEventListener("touchstart", () => {
  currentWord = "";
  selected = [];
});

canvas.addEventListener("touchmove", (e) => {
  let rect = canvas.getBoundingClientRect();
  let t = e.touches[0];

  let x = t.clientX - rect.left;
  let y = t.clientY - rect.top;

  ctx.clearRect(0, 0, 300, 300);
  drawLetters(levels[level].letters);

  ctx.beginPath();

  positions.forEach(p => {
    let d = Math.hypot(p.x - x, p.y - y);

    if (d < 25 && !selected.includes(p)) {
      selected.push(p);
      currentWord += p.letter;
    }
  });

  selected.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.strokeStyle = "#00ffcc";
  ctx.lineWidth = 5;
  ctx.stroke();

  document.getElementById("currentWord").innerText = currentWord;
});

// SUBMIT
function submitWord() {
  let ans = levels[level].answers;

  if (ans.includes(currentWord) && !foundWords.includes(currentWord)) {
    correctSound.play();
    navigator.vibrate([50, 30, 50]);

    foundWords.push(currentWord);

    let el = document.getElementById("word-" + currentWord);
    el.innerText = currentWord;
    el.style.color = "#00ff99";
    el.style.transform = "scale(1.3)";
    setTimeout(() => el.style.transform = "scale(1)", 300);

    coins += 10;

    if (foundWords.length === ans.length) {
      setTimeout(() => {
        alert("🔥 Level Complete!");
        level++;
        loadLevel();
      }, 300);
    }

  } else {
    wrongSound.play();
    alert("❌ Wrong!");
  }

  currentWord = "";
  selected = [];
  document.getElementById("currentWord").innerText = "";
}

// BUTTONS
function clearWord() {
  currentWord = "";
  selected = [];
  document.getElementById("currentWord").innerText = "";
}

function showHint() {
  let ans = levels[level].answers;
  for (let w of ans) {
    if (!foundWords.includes(w)) {
      alert("Hint: " + w[0]);
      break;
    }
  }
}

function shuffleLetters() {
  drawLetters(levels[level].letters.split('').sort(() => 0.5 - Math.random()).join(''));
                     }
