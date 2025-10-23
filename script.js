// --- DOM Elements ---
const wordsDisplay = document.querySelector('#words-display');
const typingInput = document.querySelector('#typing-input');
const timerDisplay = document.querySelector('#timer span');
const scoreDisplay = document.querySelector('#score span');
const accuracyDisplay = document.querySelector('#accuracy span');
const timeButtons = document.querySelectorAll('.time-btn');
const startButton = document.querySelector('#start-btn');
const restartButton = document.querySelector('#restart-btn');
const loadingElement = document.querySelector('#loading');
const resultsElement = document.querySelector('#results');
const finalWpmElement = document.querySelector('#final-wpm');
const finalAccuracyElement = document.querySelector('#final-accuracy');
const bestWpmElement = document.querySelector('#best-wpm');

// --- State Variables ---
const API_URL = 'https://random-word-api.herokuapp.com/word?number=100';
const FALLBACK_WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog', 'a',
  'pack', 'my', 'box', 'with', 'five', 'dozen', 'liquor', 'jugs', 'how', 'vexingly',
  'quick', 'daft', 'zebras', 'jump', 'sphinx', 'of', 'black', 'quartz', 'judge', 'my', 'vow'
];
let paragraph = '';
let letterElements = [];
let gameStatus = 'waiting';
let timerInterval;
let timeLeft = 60;
let totalTime = 60;
let correctChars = 0;
let totalChars = 0;
let startTime;
let caret;

// --- Core Functions ---

async function getWords() {
  loadingElement.classList.remove('hidden');
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    paragraph = data.join(' ');
  } catch (error) {
    console.error('Failed to fetch words, using fallback.', error);
    paragraph = FALLBACK_WORDS.join(' ');
  }
  loadingElement.classList.add('hidden');
}

function displayParagraph() {
  wordsDisplay.innerHTML = '';
  if (caret) {
      wordsDisplay.appendChild(caret); 
  }
  letterElements = paragraph.split('').map(char => {
    const span = document.createElement('span');
    span.innerText = char;
    span.classList.add('letter');
    wordsDisplay.appendChild(span);
    return span;
  });
  highlightCurrentLetter(0);
}

function highlightCurrentLetter(index) {
  let targetElement;
  if (index < letterElements.length) {
    targetElement = letterElements[index];
  } else if (letterElements.length > 0) {
    targetElement = letterElements[letterElements.length - 1];
  } else {
    if (caret) caret.style.display = 'none';
    return;
  }
  if (caret) caret.style.display = 'block';

  let left = targetElement.offsetLeft;
  let top = targetElement.offsetTop;
  if (index >= letterElements.length) {
      left += targetElement.offsetWidth;
  }
  caret.style.left = `${left}px`;
  caret.style.top = `${top}px`;
  targetElement.scrollIntoView({ block: 'nearest' });
}

function triggerErrorShake() {
  if (!wordsDisplay.classList.contains('shake')) {
    wordsDisplay.classList.add('shake');
    setTimeout(() => {
      wordsDisplay.classList.remove('shake');
    }, 300);
  }
}

// --- Game Logic ---

function handleTyping(e) {
  if (gameStatus === 'running') {
    const typedValue = e.target.value;
    const typedLength = typedValue.length;
    updateCharacterStates(typedValue, typedLength);
    highlightCurrentLetter(typedLength);
    updateStats();
  } else if (gameStatus === 'waiting' && e.target.value.length > 0) {
    startGame();
    handleTyping(e); // Re-run to process the first character
  }
}


function updateCharacterStates(typedValue, typedLength) {
  let latestCharIsIncorrect = false;
  correctChars = 0;
  totalChars = typedLength;
  letterElements.forEach((letterSpan, index) => {
    if (index < typedLength) {
      if (letterSpan.innerText === typedValue[index]) {
        letterSpan.className = 'letter correct';
        correctChars++;
      } else {
        letterSpan.className = 'letter incorrect';
        if (index === typedLength - 1) {
          latestCharIsIncorrect = true;
        }
      }
    } else {
      letterSpan.className = 'letter';
    }
  });
  if (latestCharIsIncorrect) {
    triggerErrorShake();
  }
}

function updateStats() {
  if (gameStatus !== 'running' || !startTime) return;
  const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;
  if (elapsedTimeInSeconds === 0) return;
  const wpm = Math.round(((totalChars / 5) / elapsedTimeInSeconds) * 60);
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
  scoreDisplay.textContent = wpm;
  accuracyDisplay.textContent = accuracy;
}

function startTimer() {
  gameStatus = 'running';
  startTime = Date.now();
  startButton.disabled = true;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft === 0) {
      endGame();
    }
  }, 1000);
}

function endGame() {
  clearInterval(timerInterval);
  gameStatus = 'finished';
  typingInput.disabled = true;
  startButton.disabled = false;
  const elapsedTimeInMinutes = totalTime / 60;
  const wpm = Math.round((totalChars / 5) / elapsedTimeInMinutes) || 0;
  const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
  finalWpmElement.textContent = wpm;
  finalAccuracyElement.textContent = accuracy;
  const bestWpm = parseInt(localStorage.getItem('bestWpm')) || 0;
  if (wpm > bestWpm) {
    localStorage.setItem('bestWpm', wpm);
    localStorage.setItem('bestAccuracy', accuracy);
  }
  bestWpmElement.textContent = Math.max(wpm, bestWpm);
  resultsElement.classList.remove('hidden');
}

async function resetGame() {
    clearInterval(timerInterval);
    gameStatus = 'waiting';
    correctChars = 0;
    totalChars = 0;
    startTime = null; 
    timeLeft = totalTime;
    timerDisplay.textContent = timeLeft;
    scoreDisplay.textContent = '0';
    accuracyDisplay.textContent = '0';
    resultsElement.classList.add('hidden');
    typingInput.value = '';
    typingInput.disabled = true;
    startButton.disabled = false;
    if(caret) caret.style.display = 'none';
    await getWords();
    displayParagraph();
    typingInput.disabled = false;
    typingInput.focus();
}

function startGame() {
  if (gameStatus === 'waiting') {
    resetGameStats();
    startTimer();
    typingInput.focus();
  }
}

function resetGameStats() {
    correctChars = 0;
    totalChars = 0;
    scoreDisplay.textContent = '0';
    accuracyDisplay.textContent = '0';
    typingInput.value = '';
}

function setTimeDuration(seconds) {
  if (gameStatus !== 'running') {
    totalTime = seconds;
    timeLeft = seconds;
    timerDisplay.textContent = timeLeft;
    timeButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`.time-btn[data-time="${seconds}"]`).classList.add('active');
  }
}

// --- Initialization ---

async function initialize() {
  caret = document.createElement('div');
  caret.id = 'caret';
  wordsDisplay.appendChild(caret);
  
  wordsDisplay.addEventListener('click', () => typingInput.focus());
  
  timeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      setTimeDuration(parseInt(e.target.dataset.time));
    });
  });
  
  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', resetGame);
  typingInput.addEventListener('input', handleTyping);
  
  const savedBestWpm = localStorage.getItem('bestWpm');
  if (savedBestWpm) {
    bestWpmElement.textContent = savedBestWpm;
  }
  
  await resetGame();
}

initialize();