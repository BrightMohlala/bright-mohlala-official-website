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

  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      nav.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !menuToggle.contains(e.target) && nav.classList.contains('open')) {
        menuToggle.classList.remove('open');
        nav.classList.remove('open');
      }
    });

    // Close menu when clicking a link
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        // Don't close if it's a dropdown toggle (if applicable), 
        // but existing CSS handles hover for dropdowns, so simple links should close it.
        // If the link has a sibling ul (dropdown), maybe we want to keep it open?
        // But the user just asked for the menu to be collapsed.
        if (!link.nextElementSibling || link.nextElementSibling.tagName !== 'UL') {
             menuToggle.classList.remove('open');
             nav.classList.remove('open');
        }
      });
    });
  }
});