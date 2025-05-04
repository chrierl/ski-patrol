// HighScoreManager.js

// Import Firebase SDK functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { isMobile } from './helpers.js';

export default class HighScoreManager {
  constructor(firebaseConfig, options = {}) {
    // Init Firestore
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);

    // Options
    this.maxEntries = options.maxEntries || 10;
    this.localStoragePrefix = options.localStoragePrefix || 'highscores';
    this.globalStoragePrefix = options.globalStoragePrefix  || 'highscores'
  }

  async isLocalRecord(category, value) {
    const scores = this.getLocalHighScores(category);
    return scores.length < this.maxEntries || value > scores[scores.length - 1].value;
  }

  async isGlobalRecord(category, value) {
    const scores = await this.getGlobalHighScores(category);
    return scores.length < this.maxEntries || value > scores[scores.length - 1].value;
  }
  
  async saveScore({ category, name, value, skierBase, timestamp = Date.now() }) {
    const localScores = this.getLocalHighScores(category);
    const newScore = {
      name: name || '???',
      value,
      timestamp,
      ...(skierBase && { skierBase }) // lägg till bara om det finns
    };
  
    // Spara lokalt om det kvalificerar
    if (await this.isLocalRecord(category, value)) {
      const updated = [...localScores, newScore]
        .sort((a, b) => b.value - a.value)
        .slice(0, this.maxEntries);
  
      localStorage.setItem(this.localStoragePrefix + category, JSON.stringify(updated));
    }
  
    // Spara globalt om det kvalificerar
    if (await this.isGlobalRecord(category, value)) {
      if (!this.db) return;
  
      const platform = isMobile() ? 'mobile' : 'desktop';
      const colRef = collection(this.db, 'highscores', platform, category);
      await addDoc(colRef, newScore);
    }
  }
  
  getLocalHighScores(category) {
    const raw = localStorage.getItem(this.localStoragePrefix + category);
    return raw ? JSON.parse(raw) : [];
  }

  async getGlobalHighScores(category) {
    if (!this.db) return [];
  
    const platform = isMobile() ? 'mobile' : 'desktop';
    const colRef = collection(this.db, 'highscores', platform, category);
  
    const q = query(colRef, orderBy('value', 'desc'), limit(this.maxEntries));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }
}