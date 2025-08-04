// Additional Enhancements for the Sentence Puzzle Game

// Sound Effects Manager
class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = false; // Default to disabled
    this.audioContext = null;
    this.isInitialized = false;
    this.initSounds();
  }

  initSounds() {
    // Create audio contexts for different sounds
    this.sounds = {
      correct: this.createBeepSound(800, 200, 'sine'),
      incorrect: this.createBeepSound(400, 300, 'square'),
      click: this.createBeepSound(600, 100, 'sine'),
      complete: this.createSuccessSound()
    };
    
    // Try to initialize audio context on user interaction
    this.setupAudioContext();
  }

  setupAudioContext() {
    // Create a simple click handler to initialize audio context
    const initAudio = () => {
      if (!this.isInitialized) {
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.isInitialized = true;
          console.log('Audio context initialized successfully');
          
          // Remove the event listeners after initialization
          document.removeEventListener('click', initAudio);
          document.removeEventListener('touchstart', initAudio);
          document.removeEventListener('keydown', initAudio);
        } catch (error) {
          console.warn('Failed to initialize audio context:', error);
        }
      }
    };

    // Add event listeners for user interaction
    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
    document.addEventListener('keydown', initAudio);
  }

  createBeepSound(frequency, duration, type = 'sine') {
    return () => {
      if (!this.enabled) return;
      
      // Use existing audio context or create new one
      let audioContext = this.audioContext;
      if (!audioContext || audioContext.state === 'suspended') {
        try {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.audioContext = audioContext;
        } catch (error) {
          console.warn('Failed to create audio context:', error);
          return;
        }
      }
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(error => {
          console.warn('Failed to resume audio context:', error);
          return;
        });
      }
      
      try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
      } catch (error) {
        console.warn('Failed to play sound:', error);
      }
    };
  }

  createSuccessSound() {
    return () => {
      if (!this.enabled) return;
      
      // Use existing audio context or create new one
      let audioContext = this.audioContext;
      if (!audioContext || audioContext.state === 'suspended') {
        try {
          audioContext = new (window.AudioContext || window.webkitAudioContext)();
          this.audioContext = audioContext;
        } catch (error) {
          console.warn('Failed to create audio context:', error);
          return;
        }
      }
      
      // Resume audio context if suspended
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(error => {
          console.warn('Failed to resume audio context:', error);
          return;
        });
      }
      
      try {
        const frequencies = [523, 659, 784, 1047]; // C, E, G, C
        
        frequencies.forEach((freq, index) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          oscillator.type = 'sine';
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          
          oscillator.start(audioContext.currentTime + index * 0.1);
          oscillator.stop(audioContext.currentTime + index * 0.1 + 0.3);
        });
      } catch (error) {
        console.warn('Failed to play success sound:', error);
      }
    };
  }

  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Test sound function
  testSound() {
    console.log('Testing sound system...');
    console.log('Audio context state:', this.audioContext?.state);
    console.log('Sound enabled:', this.enabled);
    
    if (this.enabled) {
      this.play('click');
      console.log('Test sound played');
    } else {
      console.log('Sound is disabled');
    }
  }

  // Get sound status
  getStatus() {
    return {
      enabled: this.enabled,
      initialized: this.isInitialized,
      audioContextState: this.audioContext?.state || 'not created'
    };
  }
}

// Statistics Manager
class StatisticsManager {
  constructor() {
    this.stats = this.loadStats();
  }

  loadStats() {
    const saved = localStorage.getItem('gameStats');
    return saved ? JSON.parse(saved) : {
      totalGames: 0,
      totalSentences: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      averageTime: 0,
      bestTime: null,
      currentStreak: 0,
      bestStreak: 0,
      languageStats: {
        en: { played: 0, correct: 0 },
        ru: { played: 0, correct: 0 }
      }
    };
  }

  saveStats() {
    localStorage.setItem('gameStats', JSON.stringify(this.stats));
  }

  recordAnswer(isCorrect, language, timeSpent) {
    this.stats.totalSentences++;
    this.stats.languageStats[language].played++;
    
    if (isCorrect) {
      this.stats.correctAnswers++;
      this.stats.languageStats[language].correct++;
      this.stats.currentStreak++;
      this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak);
    } else {
      this.stats.incorrectAnswers++;
      this.stats.currentStreak = 0;
    }

    // Update average time
    const totalTime = this.stats.averageTime * (this.stats.totalSentences - 1) + timeSpent;
    this.stats.averageTime = totalTime / this.stats.totalSentences;

    // Update best time
    if (!this.stats.bestTime || timeSpent < this.stats.bestTime) {
      this.stats.bestTime = timeSpent;
    }

    this.saveStats();
  }

  recordGameComplete(language) {
    this.stats.totalGames++;
    this.saveStats();
  }

  getAccuracy() {
    if (this.stats.totalSentences === 0) return 0;
    return Math.round((this.stats.correctAnswers / this.stats.totalSentences) * 100);
  }

  getLanguageAccuracy(language) {
    const langStats = this.stats.languageStats[language];
    if (langStats.played === 0) return 0;
    return Math.round((langStats.correct / langStats.played) * 100);
  }

  resetStats() {
    this.stats = {
      totalGames: 0,
      totalSentences: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      averageTime: 0,
      bestTime: null,
      currentStreak: 0,
      bestStreak: 0,
      languageStats: {
        en: { played: 0, correct: 0 },
        ru: { played: 0, correct: 0 }
      }
    };
    this.saveStats();
  }
}

// Timer Manager
class TimerManager {
  constructor() {
    this.startTime = null;
    this.currentTime = 0;
    this.isRunning = false;
    this.interval = null;
  }

  start() {
    this.startTime = Date.now();
    this.isRunning = true;
    this.interval = setInterval(() => {
      this.currentTime = Date.now() - this.startTime;
    }, 100);
  }

  stop() {
    this.isRunning = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    return this.currentTime;
  }

  reset() {
    this.stop();
    this.currentTime = 0;
    this.startTime = null;
  }

  getFormattedTime() {
    const seconds = Math.floor(this.currentTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// Hints Manager
class HintsManager {
  constructor() {
    this.hintsUsed = 0;
    this.maxHints = 3;
  }

  canUseHint() {
    return this.hintsUsed < this.maxHints;
  }

  useHint(correctSentence, userAnswer) {
    if (!this.canUseHint()) return null;

    const correctWords = correctSentence.split(' ');
    const missingWords = correctWords.filter(word => !userAnswer.includes(word));
    
    if (missingWords.length > 0) {
      this.hintsUsed++;
      return missingWords[0]; // Return first missing word
    }
    
    return null;
  }

  reset() {
    this.hintsUsed = 0;
  }

  getHintsRemaining() {
    return this.maxHints - this.hintsUsed;
  }
}

// Export for use in main app
window.GameEnhancements = {
  SoundManager,
  StatisticsManager,
  TimerManager,
  HintsManager
}; 