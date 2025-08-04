let sentences = [];
let currentLanguage = 'en';
let idx = 0;
let answer = [];
let shuffled = [];

const languageSelectionDiv = document.getElementById('language-selection');
const gameContainerDiv = document.getElementById('game-container');
const sentenceDiv = document.getElementById('sentence');
const wordsDiv = document.getElementById('words');
const resultDiv = document.getElementById('result');
const nextBtn = document.getElementById('next-btn');

// Новый DIV для показа набираемого предложения:
let assembledDiv = document.createElement('div');
assembledDiv.id = 'assembled';
assembledDiv.style.marginBottom = '18px';
assembledDiv.style.minHeight = '28px';
assembledDiv.style.fontSize = '1.08em';
wordsDiv.parentNode.insertBefore(assembledDiv, wordsDiv);

function shuffle(arr) {
  return arr.map(v => [Math.random(), v])
            .sort((a, b) => a - b)
            .map(i => i);
}

function checkSavedLanguage() {
  const savedLanguage = localStorage.getItem('userLanguage');
  if (savedLanguage) {
    currentLanguage = savedLanguage;
    languageSelectionDiv.style.display = 'none';
    gameContainerDiv.style.display = 'block';
    loadSentences(currentLanguage);
  } else {
    languageSelectionDiv.style.display = 'block';
    gameContainerDiv.style.display = 'none';
  }
}

function selectLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem('userLanguage', lang);
  languageSelectionDiv.style.display = 'none';
  gameContainerDiv.style.display = 'block';
  loadSentences(lang);
}

function changeLanguage() {
  localStorage.removeItem('userLanguage');
  gameContainerDiv.style.display = 'none';
  languageSelectionDiv.style.display = 'block';
  idx = 0;
  answer = [];
  shuffled = [];
}

async function loadSentences(lang = 'en') {
  try {
    const res = await fetch(`${lang}.json`);
    sentences = await res.json();
    idx = 0;
    renderSentence();
  } catch (error) {
    console.error('Ошибка загрузки предложений:', error);
    if (lang !== 'en') {
      loadSentences('en');
    }
  }
}

function renderSentence() {
  answer = [];
  resultDiv.textContent = '';
  nextBtn.style.display = 'none';

  const sentence = sentences[idx];
  sentenceDiv.textContent = `Sentence #${idx + 1}`;
  shuffled = shuffle(sentence.split(' '));

  renderAssembled();
  renderWords();
}

function renderWords() {
  wordsDiv.innerHTML = '';
  // Для каждой кнопки слово показываем выбрано оно или нет
  shuffled.forEach((word, i) => {
    const btn = document.createElement('button');
    btn.className = 'word-btn';
    btn.textContent = word;
    // Если слово уже есть в answer, кнопка отключена
    btn.disabled = answer.includes(word);
    btn.onclick = () => {
      if (!answer.includes(word)) {
        answer.push(word);
        renderAssembled();
        renderWords();
        checkProgress();
      }
    };
    wordsDiv.appendChild(btn);
  });
}

function renderAssembled() {
  // Показываем собранное предложение с возможностью удалять слово
  assembledDiv.innerHTML = '';
  answer.forEach((word, idxAnswer) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.style.cursor = 'pointer';
    span.style.padding = '4px 8px';
    span.style.margin = '0 4px 6px 0';
    span.style.background = '#fff6be';
    span.style.borderRadius = '6px';
    span.style.border = '1px solid #e1c866';
    span.style.display = 'inline-block';
    span.onclick = () => {
      answer.splice(idxAnswer, 1);
      renderAssembled();
      renderWords();
      resultDiv.textContent = '';
    };
    assembledDiv.appendChild(span);
  });
}

function checkProgress() {
  if (answer.length === shuffled.length) {
    if (answer.join(' ') === sentences[idx]) {
      resultDiv.textContent = '✅ Correct!';
      resultDiv.className = 'success';
      nextBtn.style.display = idx < sentences.length - 1 ? 'inline-block' : 'none';
    } else {
      resultDiv.textContent = '❌ Incorrect. Try again! You can correct your answer below.';
      resultDiv.className = 'fail';
    }
  } else {
    resultDiv.textContent = '';
  }
}

nextBtn.onclick = () => {
  idx++;
  if (idx < sentences.length) {
    renderSentence();
  } else {
    sentenceDiv.textContent = "Congratulations! You've finished.";
    wordsDiv.innerHTML = '';
    assembledDiv.innerHTML = '';
    nextBtn.style.display = 'none';
  }
};

checkSavedLanguage();
