let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

canvas.width = 300;
canvas.height = 300;

let positions = [];
let currentWord = "";
let selected = [];

let level = 0;
let coins = 0;
let hintUsed = 0;
let levels = [];

// LOAD LEVELS
fetch("levels.json")
.then(res => res.json())
.then(data => {
  levels = data;
  loadProgress();
  loadLevel();
});

// SAVE / LOAD
function loadProgress() {
  level = parseInt(localStorage.getItem("level")) || 0;
  coins = parseInt(localStorage.getItem("coins")) || 0;
  updateUI();
}

function saveProgress() {
  localStorage.setItem("level", level);
  localStorage.setItem("coins", coins);
}

// LOAD LEVEL
function loadLevel() {
  currentWord = "";
  selected = [];
  hintUsed = 0;

  let word = levels[level].word;

  document.getElementById("level").innerText = "Level " + (level + 1);
  document.getElementById("word-box").innerText = "";

  drawLetters(word);
}

// DRAW LETTERS IN CIRCLE
function drawLetters(word) {
  ctx.clearRect(0, 0, 300, 300);
  positions = [];

  let letters = word.split('').sort(() => 0.5 - Math.random());

  let centerX = 150;
  let centerY = 150;
  let radius = 100;

  letters.forEach((letter, i) => {
    let angle = (i / letters.length) * Math.PI * 2;
    let x = centerX + radius * Math.cos(angle);
    let y = centerY + radius * Math.sin(angle);

    positions.push({x, y, letter});

    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fillStyle = "#00c3ff";
    ctx.fill();

    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.fillText(letter, x - 5, y + 5);
  });
}

// SWIPE START
canvas.addEventListener("touchstart", () => {
  currentWord = "";
  selected = [];
});

// SWIPE MOVE
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
      updateWord();
    }
  });

  drawLines();
});

// DRAW LINE BETWEEN LETTERS
function drawLines() {
  ctx.clearRect(0, 0, 300, 300);

  // redraw letters
  drawLetters(levels[level].word);

  ctx.beginPath();
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 3;

  selected.forEach((p, i) => {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.stroke();
}

// UPDATE WORD
function updateWord() {
  document.getElementById("word-box").innerText = currentWord;
}

// SUBMIT
function submitWord() {
  let correct = levels[level].word;

  if (currentWord === correct) {
    coins += 20;
    level++;
    saveProgress();
    alert("🎉 Correct!");
    loadLevel();
  } else {
    alert("❌ Wrong!");
  }
}

// CLEAR
function clearWord() {
  currentWord = "";
  selected = [];
  updateWord();
  drawLetters(levels[level].word);
}

// HINT (AD STYLE)
function showHint() {
  let word = levels[level].word;

  alert("Ad Playing 🎥");
  hintUsed++;

  currentWord = word.substring(0, hintUsed);
  updateWord();
}

// UI UPDATE
function updateUI() {
  document.getElementById("coins").innerText = "Coins: " + coins;
}
