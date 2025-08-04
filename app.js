// Game Configuration
const CONFIG = {
  ANIMATION_DURATION: 300,
  SUCCESS_COLOR: '#128c7e',
  ERROR_COLOR: '#e01d1d',
  PRIMARY_COLOR: '#2AABEE',
  HOVER_COLOR: '#1c7ed6'
};

// Localization
const TRANSLATIONS = {
  en: {
    'choose_language': 'Choose your language',
    'make_sentence': 'Make the sentence',
    'switch_language': 'Switch Language',
    'next': 'Next',
    'correct': '✅ Correct! Well done!',
    'incorrect': '❌ Incorrect. Try again! You can correct your answer below.',
    'congratulations': "🎉 Congratulations! You've finished all sentences!",
    'great_job': 'Great job!',
    'completed_sentences': 'You\'ve completed all {count} sentences.',
    'play_again': 'Play Again',
    'show_answer': 'Show Answer',
    'reset': 'Reset'
  },
  ru: {
    'choose_language': 'Выберите язык',
    'make_sentence': 'Составьте предложение',
    'switch_language': 'Сменить язык',
    'next': 'Следующее',
    'correct': '✅ Правильно! Отлично!',
    'incorrect': '❌ Неправильно. Попробуйте еще раз! Вы можете исправить ответ ниже.',
    'congratulations': '🎉 Поздравляем! Вы завершили все предложения!',
    'great_job': 'Отличная работа!',
    'completed_sentences': 'Вы завершили все {count} предложений.',
    'play_again': 'Играть снова',
    'show_answer': 'Показать ответ',
    'reset': 'Сбросить'
  }
};

// Game State Management
class GameState {
  constructor() {
    this.sentences = [];
    this.shuffledSentences = [];
    this.currentLanguage = 'en';
    this.currentIndex = 0;
    this.userAnswer = [];
    this.shuffledWords = [];
    this.isGameComplete = false;
  }

  reset() {
    this.currentIndex = 0;
    this.userAnswer = [];
    this.shuffledWords = [];
    this.isGameComplete = false;
  }

  getCurrentSentence() {
    return this.shuffledSentences[this.currentIndex];
  }



  isLastSentence() {
    return this.currentIndex >= this.shuffledSentences.length - 1;
  }
}

// UI Components
class UIComponents {
  constructor() {
    this.languageSelection = document.getElementById('language-selection');
    this.gameContainer = document.getElementById('game-container');
    this.sentenceDisplay = document.getElementById('sentence');
    this.wordsContainer = document.getElementById('words');
    this.resultDisplay = document.getElementById('result');
    this.nextButton = document.getElementById('next-btn');
    
    this.createAssembledDisplay();
    this.bindEvents();
  }

  createAssembledDisplay() {
    this.assembledDisplay = document.createElement('div');
    this.assembledDisplay.id = 'assembled';
    this.assembledDisplay.className = 'assembled-sentence';
    this.wordsContainer.parentNode.insertBefore(this.assembledDisplay, this.wordsContainer);
  }



  bindEvents() {
    this.nextButton.addEventListener('click', () => gameController.nextSentence());
  }

  showLanguageSelection() {
    this.languageSelection.style.display = 'block';
    this.gameContainer.style.display = 'none';
  }

  showGame() {
    this.languageSelection.style.display = 'none';
    this.gameContainer.style.display = 'block';
  }





  renderAssembledSentence(words) {
    this.assembledDisplay.innerHTML = '';
    
    words.forEach((word, index) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'assembled-word';
      wordSpan.textContent = word;
      wordSpan.dataset.index = index;
      
      wordSpan.addEventListener('click', () => {
        gameController.removeWord(index);
      });
      
      this.assembledDisplay.appendChild(wordSpan);
    });
  }

  renderWordButtons(words, usedWords) {
    this.wordsContainer.innerHTML = '';
    
    words.forEach((word, index) => {
      const button = document.createElement('button');
      button.className = 'word-btn';
      button.textContent = word;
      button.dataset.word = word;
      button.dataset.index = index;
      
      // Count how many times this word appears in original words
      const totalCount = words.filter(w => w === word).length;
      // Count how many times this word is already used
      const usedCount = usedWords.filter(w => w === word).length;
      
      const isUsed = usedCount >= totalCount;
      button.disabled = isUsed;
      
      if (!isUsed) {
        button.addEventListener('click', () => {
          gameController.addWord(word);
        });
      }
      
      this.wordsContainer.appendChild(button);
    });
  }

  showResult(isCorrect, message) {
    this.resultDisplay.textContent = message;
    
    // Clear className when there's no message or result
    if (isCorrect === null || message === '') {
      this.resultDisplay.className = '';
    } else {
      this.resultDisplay.className = isCorrect ? 'success' : 'fail';
    }
    
    // Show Next button only when answer is correct and not the last sentence
    if (isCorrect) {
      this.nextButton.style.display = gameState.isLastSentence() ? 'none' : 'inline-block';
    }
    // Don't hide Next button for other cases (like showing answer)
  }

  updateUIText() {
    const lang = gameState.currentLanguage;
    
    // Update HTML elements with data attributes
    document.querySelectorAll('[data-en][data-ru]').forEach(element => {
      element.textContent = element.getAttribute(`data-${lang}`);
    });
    
    // Next button uses icon only (➡️)
  }

  showGameComplete() {
    const lang = gameState.currentLanguage;
    this.sentenceDisplay.textContent = TRANSLATIONS[lang]['congratulations'];
    this.wordsContainer.innerHTML = '';
    this.assembledDisplay.innerHTML = '';
    this.nextButton.style.display = 'none';
    
    // Hide show answer button
    const showAnswerBtn = document.getElementById('show-answer-btn');
    if (showAnswerBtn) {
      showAnswerBtn.style.display = 'none';
    }
    
    this.resultDisplay.innerHTML = `
      <div class="completion-message">
        <h3>${TRANSLATIONS[lang]['great_job']}</h3>
        <p>${TRANSLATIONS[lang]['completed_sentences'].replace('{count}', gameState.shuffledSentences.length)}</p>
        <button onclick="gameController.restart()" class="restart-btn">${TRANSLATIONS[lang]['play_again']}</button>
      </div>
    `;
    
    // Play completion sound
    if (gameController.soundManager) {
      gameController.soundManager.play('complete');
    }
  }

  updateButtonStates(usedWords) {
    const buttons = this.wordsContainer.querySelectorAll('.word-btn');
    const allWords = Array.from(buttons).map(btn => btn.dataset.word);
    
    buttons.forEach(btn => {
      const word = btn.dataset.word;
      
      // Count how many times this word appears in original words
      const totalCount = allWords.filter(w => w === word).length;
      // Count how many times this word is already used
      const usedCount = usedWords.filter(w => w === word).length;
      
      const isUsed = usedCount >= totalCount;
      btn.disabled = isUsed;
      btn.style.opacity = isUsed ? '0.4' : '1';
      btn.style.cursor = isUsed ? 'not-allowed' : 'pointer';
    });
  }
}

// Game Controller
class GameController {
  constructor() {
    this.state = new GameState();
    this.ui = new UIComponents();
    this.soundManager = null;
    this.initSoundManager();
    this.loadSavedLanguage();
  }

  initSoundManager() {
    if (window.GameEnhancements && window.GameEnhancements.SoundManager) {
      this.soundManager = new window.GameEnhancements.SoundManager();
      
      // Load saved sound preference or default to disabled
      const savedSoundEnabled = localStorage.getItem('soundEnabled');
      if (savedSoundEnabled !== null) {
        const isEnabled = savedSoundEnabled === 'true';
        this.soundManager.enabled = isEnabled;
        updateSoundButton(isEnabled);
      } else {
        // Default to sound disabled
        this.soundManager.enabled = false;
        updateSoundButton(false);
      }
    }
  }

  async loadSentences(language) {
    try {
      const response = await fetch(`${language}.json`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      this.state.sentences = await response.json();
      this.state.shuffledSentences = this.shuffleArray([...this.state.sentences]);
      this.state.currentLanguage = language;
      this.state.reset();
      
      this.renderCurrentSentence();
    } catch (error) {
      console.error('Error loading sentences:', error);
      this.showError(`Failed to load ${language} sentences. Falling back to English.`);
      
      if (language !== 'en') {
        await this.loadSentences('en');
      }
    }
  }

  selectLanguage(language) {
    localStorage.setItem('userLanguage', language);
    this.ui.showGame();
    this.loadSentences(language);
  }

  changeLanguage() {
    localStorage.removeItem('userLanguage');
    this.ui.showLanguageSelection();
    this.state.reset();
  }

  loadSavedLanguage() {
    const savedLanguage = localStorage.getItem('userLanguage');
    if (savedLanguage) {
      this.selectLanguage(savedLanguage);
    } else {
      this.ui.showLanguageSelection();
    }
  }

  renderCurrentSentence() {
    const sentence = this.state.getCurrentSentence();
    if (!sentence) return;

    this.state.shuffledWords = this.shuffleArray(sentence.split(' '));
    this.state.userAnswer = [];

    this.ui.updateUIText();
    this.ui.renderAssembledSentence(this.state.userAnswer);
    this.ui.renderWordButtons(this.state.shuffledWords, this.state.userAnswer);
    this.ui.showResult(null, '');
  }

  addWord(word) {
    this.state.userAnswer.push(word);
    this.ui.renderAssembledSentence(this.state.userAnswer);
    this.ui.updateButtonStates(this.state.userAnswer);
    
    // Play click sound
    if (this.soundManager) {
      this.soundManager.play('click');
    }
    
    this.checkAnswer();
  }

  removeWord(index) {
    this.state.userAnswer.splice(index, 1);
    this.ui.renderAssembledSentence(this.state.userAnswer);
    this.ui.updateButtonStates(this.state.userAnswer);
    this.ui.showResult(null, '');
  }

  checkAnswer() {
    if (this.state.userAnswer.length === this.state.shuffledWords.length) {
      const userSentence = this.state.userAnswer.join(' ');
      const correctSentence = this.state.getCurrentSentence();
      
      const isCorrect = userSentence === correctSentence;
      const lang = this.state.currentLanguage;
      
      if (isCorrect) {
        this.ui.showResult(true, TRANSLATIONS[lang]['correct']);
        this.animateSuccess();
        
        // Play success sound
        if (this.soundManager) {
          this.soundManager.play('correct');
        }
      } else {
        this.ui.showResult(false, TRANSLATIONS[lang]['incorrect']);
        this.animateError();
        
        // Play error sound
        if (this.soundManager) {
          this.soundManager.play('incorrect');
        }
      }
    }
  }

  nextSentence() {
    this.state.currentIndex++;
    
    if (this.state.currentIndex < this.state.shuffledSentences.length) {
      this.renderCurrentSentence();
    } else {
      this.state.isGameComplete = true;
      this.ui.showGameComplete();
    }
  }

  restart() {
    this.state.reset();
    this.state.shuffledSentences = this.shuffleArray([...this.state.sentences]);
    
    // Show show answer button again
    const showAnswerBtn = document.getElementById('show-answer-btn');
    if (showAnswerBtn) {
      showAnswerBtn.style.display = 'inline-block';
    }
    
    this.renderCurrentSentence();
  }

  showAnswer() {
    const correctSentence = this.state.getCurrentSentence();
    if (!correctSentence) return;

    // Check if answer is already shown (toggle functionality)
    const isAnswerShown = this.ui.resultDisplay.textContent.includes(`"${correctSentence}"`);
    
    if (isAnswerShown) {
      // Hide the answer
      this.ui.resultDisplay.textContent = '';
      this.ui.resultDisplay.className = '';
    } else {
      // Show the correct answer
      this.ui.resultDisplay.textContent = `💡 "${correctSentence}"`;
      this.ui.resultDisplay.className = 'info';
    }
    
    // Play sound if enabled
    if (this.soundManager) {
      this.soundManager.play('click');
    }
  }

  resetCurrentSentence() {
    // Clear user answer
    this.state.userAnswer = [];
    
    // Re-render the current sentence
    this.ui.renderAssembledSentence(this.state.userAnswer);
    this.ui.renderWordButtons(this.state.shuffledWords, this.state.userAnswer);
    this.ui.showResult(null, '');
    
    // Play sound if enabled
    if (this.soundManager) {
      this.soundManager.play('click');
    }
  }

  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  animateSuccess() {
    this.ui.assembledDisplay.style.animation = 'successPulse 0.5s ease-in-out';
    setTimeout(() => {
      this.ui.assembledDisplay.style.animation = '';
    }, 500);
  }

  animateError() {
    this.ui.assembledDisplay.style.animation = 'errorShake 0.5s ease-in-out';
    setTimeout(() => {
      this.ui.assembledDisplay.style.animation = '';
    }, 500);
  }

  showError(message) {
    console.error(message);
    // Можно добавить toast уведомление
  }
}

// Global functions for HTML onclick handlers
function selectLanguage(lang) {
  gameController.selectLanguage(lang);
}

function changeLanguage() {
  gameController.changeLanguage();
}

function toggleSound() {
  if (gameController && gameController.soundManager) {
    const isEnabled = gameController.soundManager.toggle();
    updateSoundButton(isEnabled);
    
    // Save sound preference
    localStorage.setItem('soundEnabled', isEnabled);
  }
}

function updateSoundButton(isEnabled) {
  const soundBtn = document.querySelector('.sound-toggle-btn');
  if (soundBtn) {
    if (isEnabled) {
      soundBtn.textContent = '🔊';
      soundBtn.classList.remove('muted');
    } else {
      soundBtn.textContent = '🔇';
      soundBtn.classList.add('muted');
    }
  }
}

function showAnswer() {
  if (gameController) {
    gameController.showAnswer();
  }
}

function resetCurrentSentence() {
  if (gameController) {
    gameController.resetCurrentSentence();
  }
}

// Initialize sound button on page load
document.addEventListener('DOMContentLoaded', function() {
  // Set initial state to muted
  updateSoundButton(false);
});

// Initialize game
let gameController;
let gameState;

document.addEventListener('DOMContentLoaded', () => {
  gameController = new GameController();
  gameState = gameController.state;
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  .assembled-sentence {
    margin-bottom: 18px;
    min-height: 28px;
    font-size: 1.08em;
  }
  
  .assembled-word {
    cursor: pointer;
    padding: 4px 8px;
    margin: 0 4px 6px 0;
    background: #fff6be;
    border-radius: 6px;
    border: 1px solid #e1c866;
    display: inline-block;
    transition: all 0.2s ease;
  }
  
  .assembled-word:hover {
    background: #ffeb9c;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .completion-message {
    text-align: center;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-top: 20px;
  }
  
  .restart-btn {
    background: ${CONFIG.PRIMARY_COLOR};
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    font-size: 1em;
    cursor: pointer;
    transition: background 0.3s;
  }
  
  .restart-btn:hover {
    background: ${CONFIG.HOVER_COLOR};
  }
  
  @keyframes successPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
  
  @keyframes errorShake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .word-btn {
    transition: all 0.2s ease;
  }
  
  .word-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  .word-btn:active:not(:disabled) {
    transform: translateY(0);
  }
`;

document.head.appendChild(style);
