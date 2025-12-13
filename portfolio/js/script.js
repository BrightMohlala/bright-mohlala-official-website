// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBtmD9ZH_k6-Itvn6fXOYHydbY5jA-O9Sk",
  authDomain: "myportfolio-8950f.firebaseapp.com",
  projectId: "myportfolio-8950f",
  storageBucket: "myportfolio-8950f.firebasestorage.app",
  messagingSenderId: "22262828249",
  appId: "1:22262828249:web:406faf0bc6dfd711e382c8",
  measurementId: "G-J4MJXVZ57J"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Test Firebase connection
function testFirebaseConnection() {
  console.log('🔍 Testing Firebase connection...');
  db.collection('confessions').limit(1).get()
    .then(() => {
      console.log('✅ Firebase connection successful');
    })
    .catch(error => {
      console.error('❌ Firebase connection failed:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message
      });
    });
}

// Test connection on page load
document.addEventListener('DOMContentLoaded', function() {
  testFirebaseConnection();
});