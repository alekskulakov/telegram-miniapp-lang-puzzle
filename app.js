let sentences = [];
let idx = 0;
let answer = [];
let shuffled = [];

const sentenceDiv = document.getElementById('sentence');
const wordsDiv = document.getElementById('words');
const resultDiv = document.getElementById('result');
const nextBtn = document.getElementById('next-btn');

function shuffle(arr) {
  return arr.map(v => [Math.random(), v])
            .sort((a, b) => a[0] - b[0])
            .map(i => i[1]);
}

async function loadSentences(lang = 'en') {
  const res = await fetch(`${lang}.json`);
  sentences = await res.json();
  idx = 0;
  renderSentence();
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

// Загрузка при старте:
loadSentences();
