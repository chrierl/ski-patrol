// firebase.js

// Import Firebase SDK functions
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyA6FN38SHcDWRCk8UYAkZT6nV5tFQuoLac",
    authDomain: "ski-patrol-62b94.firebaseapp.com",
    projectId: "ski-patrol-62b94",
    storageBucket: "ski-patrol-62b94.firebasestorage.app",
    messagingSenderId: "677092678107",
    appId: "1:677092678107:web:2c878b8395f27411e8affe"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Platform detection: desktop vs mobile
function isMobileDevice() {
  return /Mobi|Android/i.test(navigator.userAgent);
}

// Upload a score to Firestore
export async function uploadGlobalScore(category, name, value) {
  const platform = isMobileDevice() ? 'mobile' : 'desktop';
  const colRef = collection(db, 'highscores', platform, category);
  await addDoc(colRef, { name, value, timestamp: Date.now() });
}

// Get top 10 scores from Firestore
export async function fetchGlobalScores(category) {
  const platform = isMobileDevice() ? 'mobile' : 'desktop';
  const colRef = collection(db, 'highscores', platform, category);
  const q = query(colRef, orderBy('value', 'desc'), limit(10));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}
