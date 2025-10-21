// --- DOM Elements ---
const wordsDisplay = document.querySelector('#words-display');
const typingInput = document.querySelector('#typing-input');

// --- API and Word Handling ---
const API_URL = 'https://random-word-api.herokuapp.com/word?number=100';
const FALLBACK_WORDS = [
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog', 'a',
  'pack', 'my', 'box', 'with', 'five', 'dozen', 'liquor', 'jugs', 'how', 'vexingly',
  'quick', 'daft', 'zebras', 'jump', 'sphinx', 'of', 'black', 'quartz', 'judge', 'my', 'vow'
];

let paragraph = '';
let letterElements = [];

// --- Main Functions ---

async function getWords() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    paragraph = data.join(' ');
  } catch (error) {
    console.error('Failed to fetch words, using fallback.', error);
    paragraph = FALLBACK_WORDS.join(' ');
  }
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

// --- Event Handlers & Logic ---

function handleTyping(e) {
  const typedValue = e.target.value;
  const typedLength = typedValue.length;

  letterElements.forEach((letterSpan, index) => {
    if (index < typedLength) {
      if (letterSpan.innerText === typedValue[index]) {
        letterSpan.className = 'letter correct';
      } else {
        letterSpan.className = 'letter incorrect';
      }
    } else {
      letterSpan.className = 'letter';
    }
  });

  highlightCurrentLetter(typedLength);
}

function highlightCurrentLetter(index) {
  document.querySelectorAll('.letter.active').forEach(el => el.classList.remove('active'));
  
  if (index < letterElements.length) {
    const activeLetter = letterElements[index];
    activeLetter.classList.add('active');
    activeLetter.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

// --- Initialization ---

async function initialize() {
  // Focus input on click
  wordsDisplay.addEventListener('click', () => typingInput.focus());

  await getWords();
  displayParagraph();
  
  typingInput.addEventListener('input', handleTyping);
}

initialize();