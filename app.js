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

function shuffle(arr) {
  return arr.map(v => [Math.random(), v])
            .sort((a, b) => a[0] - b[0])
            .map(i => i[1]);
}

// Проверка сохраненного языка при загрузке
function checkSavedLanguage() {
  const savedLanguage = localStorage.getItem('userLanguage');
  if (savedLanguage) {
    // Если язык уже выбран - сразу загружаем игру
    currentLanguage = savedLanguage;
    languageSelectionDiv.style.display = 'none';
    gameContainerDiv.style.display = 'block';
    loadSentences(currentLanguage);
  } else {
    // Показываем экран выбора языка
    languageSelectionDiv.style.display = 'block';
    gameContainerDiv.style.display = 'none';
  }
}

// Выбор языка (вызывается один раз)
function selectLanguage(lang) {
  currentLanguage = lang;
  // Сохраняем выбор в localStorage
  localStorage.setItem('userLanguage', lang);
  
  // Переключаемся на игровой экран
  languageSelectionDiv.style.display = 'none';
  gameContainerDiv.style.display = 'block';
  
  // Загружаем игру
  loadSentences(lang);
}

// Смена языка (для кнопки в игре)
function changeLanguage() {
  // Очищаем сохраненный язык
  localStorage.removeItem('userLanguage');
  
  // Возвращаемся к выбору языка
  gameContainerDiv.style.display = 'none';
  languageSelectionDiv.style.display = 'block';
  
  // Сбрасываем состояние игры
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
    // Fallback на английский если файл не найден
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

  wordsDiv.innerHTML = '';
  shuffled.forEach((word, i) => {
    const btn = document.createElement('button');
    btn.className = 'word-btn';
    btn.textContent = word;
    btn.onclick = () => selectWord(i, btn);
    wordsDiv.appendChild(btn);
  });
}

function selectWord(i, btn) {
  if (btn.classList.contains('selected')) return;
  btn.classList.add('selected');
  answer.push(shuffled[i]);
  checkProgress();
}

function checkProgress() {
  if (answer.length === shuffled.length) {
    if (answer.join(' ') === sentences[idx]) {
      resultDiv.textContent = '✅ Correct!';
      resultDiv.className = 'success';
      nextBtn.style.display = idx < sentences.length - 1 ? 'inline-block' : 'none';
    } else {
      resultDiv.textContent = '❌ Incorrect. Try again!';
      resultDiv.className = 'fail';
      setTimeout(renderSentence, 1100);
    }
  }
}

nextBtn.onclick = () => {
  idx++;
  if (idx < sentences.length) {
    renderSentence();
  } else {
    sentenceDiv.textContent = "Congratulations! You've finished.";
    wordsDiv.innerHTML = '';
    nextBtn.style.display = 'none';
  }
};

// Запуск при загрузке страницы
checkSavedLanguage();
