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
let currentIndex = 0;

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
  letterElements = paragraph.split('').map(char => {
    const span = document.createElement('span');
    span.innerText = char;
    span.classList.add('letter');
    wordsDisplay.appendChild(span);
    return span;
  });
  highlightCurrentLetter(0);
}

function handleTyping(e) {
  if (gameStatus !== 'running') return;
  
  const typedValue = e.target.value;
  const typedLength = typedValue.length;

  updateCharacterStates(typedValue, typedLength);
  highlightCurrentLetter(typedLength);
  updateStats();
}

function updateCharacterStates(typedValue, typedLength) {
  correctChars = 0;
  totalChars = typedLength;
  
  letterElements.forEach((letterSpan, index) => {
    if (index < typedLength) {
      if (letterSpan.innerText === typedValue[index]) {
        letterSpan.className = 'letter correct';
        correctChars++;
      } else {
        letterSpan.className = 'letter incorrect';
      }
    } else {
      letterSpan.className = 'letter';
    }
  });
}

function highlightCurrentLetter(index) {
  document.querySelectorAll('.letter.active').forEach(el => el.classList.remove('active'));
  
  if (index < letterElements.length) {
    const activeLetter = letterElements[index];
    activeLetter.classList.add('active');
    
    const container = wordsDisplay;
    const letterRect = activeLetter.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    if (letterRect.bottom > containerRect.bottom || letterRect.top < containerRect.top) {
      activeLetter.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

function updateStats() {
  if (gameStatus !== 'running') return;
  
  const elapsedTimeInSeconds = (Date.now() - startTime) / 1000;
  if (elapsedTimeInSeconds === 0) return;
  
  // FIX: Changed correctChars to totalChars for Raw WPM
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
  // FIX: Changed correctChars to totalChars for Raw WPM
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
    timeLeft = totalTime;
    timerDisplay.textContent = timeLeft;
    correctChars = 0;
    totalChars = 0;
    currentIndex = 0;

    scoreDisplay.textContent = '0';
    accuracyDisplay.textContent = '0';

    typingInput.value = '';
    typingInput.disabled = true;
    startButton.disabled = false;
    resultsElement.classList.add('hidden');

    await getWords();
    displayParagraph();
    typingInput.disabled = false;
    typingInput.focus();
}

function startGame() {
  if (gameStatus === 'waiting') {
    startTimer();
    typingInput.focus();
  }
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

async function initialize() {
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
  
  await getWords();
  displayParagraph();
  typingInput.disabled = false;
}

initialize();