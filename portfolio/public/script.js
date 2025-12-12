// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDoxfFAq8C0TmxBGDZV6HAmms2px-pWoQc",
  authDomain: "anonymous-confessions-18.firebaseapp.com",
  projectId: "anonymous-confessions-18",
  storageBucket: "anonymous-confessions-18.firebasestorage.app",
  messagingSenderId: "153740861501",
  appId: "1:153740861501:web:c09c7634618ad5feea4a54",
  measurementId: "G-3BY3W357LE"
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

// === Daily Verse Feature ===
(function() {
  const verses = [
    "\"Come to me, all who are weary and burdened, and I will give you rest.\" – Matthew 11:28",
    "\"Cast all your anxiety on Him because He cares for you.\" – 1 Peter 5:7",
    "\"The Lord is close to the brokenhearted and saves those who are crushed in spirit.\" – Psalm 34:18",
    "\"Peace I leave with you; my peace I give you.\" – John 14:27",
    "\"God is our refuge and strength, an ever-present help in trouble.\" – Psalm 46:1",
    "\"When you pass through the waters, I will be with you.\" – Isaiah 43:2",
    "\"The Lord will fight for you; you need only to be still.\" – Exodus 14:14",
    "\"He heals the brokenhearted and binds up their wounds.\" – Psalm 147:3",
    "\"Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.\" – Joshua 1:9",
    "\"My grace is sufficient for you, for my power is made perfect in weakness.\" – 2 Corinthians 12:9"
  ];
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  // Use a hash of the date to pick a verse, so it's random but consistent for the day
  let hash = 0;
  for (let i = 0; i < today.length; i++) hash = today.charCodeAt(i) + ((hash << 5) - hash);
  const index = Math.abs(hash) % verses.length;
  const verse = verses[index];
  const verseDiv = document.getElementById('daily-verse');
  if (verseDiv) {
    verseDiv.innerHTML = `<div style='background:#f0f4ff;padding:18px 20px;margin:0 auto 18px auto;border-radius:16px;max-width:600px;text-align:center;font-size:1.1rem;color:#4b3f72;box-shadow:0 2px 8px rgba(120,104,230,0.07);font-style:italic;'>${verse}</div>`;
  }
})();

// Submit confession
const submitBtn = document.getElementById('submitBtn');
if (submitBtn) {
  submitBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const message = document.getElementById('message').value.trim();
    if (!message) {
      showCustomAlert('Please write your confession first.');
      return;
    }

    try {
      const docRef = await db.collection('confessions').add({
        message: message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert('Confession submitted! Your code: ' + docRef.id);
      window.location.href = `success.html?code=${docRef.id}`;
    } catch (error) {
      console.error("Error adding document:", error);
      alert('Error submitting confession: ' + error.message);
    }
  });
}

// Admin respond logic (on admin.html)
function loadAdminConfessions() {
  db.collection("confessions").orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      const container = document.getElementById("adminConfessions");
      container.innerHTML = "";
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Create admin entry container
        const entryDiv = document.createElement("div");
        entryDiv.className = "admin-entry";
        
        // Create confession paragraph safely
        const confessionP = document.createElement("p");
        const strongElement = document.createElement("strong");
        strongElement.textContent = "Confession:";
        const confessionText = document.createElement("span");
        confessionText.textContent = data.message || "";
        
        confessionP.appendChild(strongElement);
        confessionP.appendChild(document.createTextNode(" "));
        confessionP.appendChild(confessionText);
        
        // Create textarea for response
        const textarea = document.createElement("textarea");
        textarea.id = `resp-${doc.id}`;
        textarea.rows = 3;
        textarea.cols = 40;
        textarea.placeholder = "Write a response";
        textarea.value = data.response || "";
        
        // Create save button
        const saveButton = document.createElement("button");
        saveButton.textContent = "Save Response";
        saveButton.onclick = () => saveResponse(doc.id);
        
        // Create line break
        const br = document.createElement("br");
        
        // Create horizontal rule
        const hr = document.createElement("hr");
        
        // Append all elements
        entryDiv.appendChild(confessionP);
        entryDiv.appendChild(textarea);
        entryDiv.appendChild(br);
        entryDiv.appendChild(saveButton);
        entryDiv.appendChild(hr);
        
        container.appendChild(entryDiv);
      });
    });
}

function saveResponse(docId) {
  const response = document.getElementById(`resp-${docId}`).value;
  db.collection("confessions").doc(docId).update({
    response: response
  });
}

// Generate a random code for the users
function generateCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function react(confessionId, type, event) {
  console.log('🎯 React function called:', { confessionId, type });
  
  // Check localStorage for previous reaction
  const userReactions = JSON.parse(localStorage.getItem('confessionReactions') || '{}');
  if (!userReactions[confessionId]) userReactions[confessionId] = {};
  if (userReactions[confessionId][type]) {
    alert('You have already reacted.');
    return;
  }

  const button = event.target.closest('.reaction-btn');
  if (!button) {
    console.error('❌ Button not found');
    return;
  }
  
  // Disable button temporarily to prevent spam
  button.disabled = true;
  button.style.opacity = '0.6';
  
  const ref = db.collection("confessions").doc(confessionId);
  const field = `reactions.${type}`;

  ref.update({
    [field]: firebase.firestore.FieldValue.increment(1)
  }).then(() => {
    console.log("Reaction saved:", type);
    // Mark as reacted in localStorage
    userReactions[confessionId][type] = true;
    localStorage.setItem('confessionReactions', JSON.stringify(userReactions));
    
    // Visual feedback
    button.style.transform = 'scale(1.1)';
    setTimeout(() => {
      button.style.transform = 'scale(1)';
      button.disabled = false;
      button.style.opacity = '1';
    }, 300);
    
  }).catch(error => {
    console.error("Error saving reaction:", error);
    button.disabled = false;
    button.style.opacity = '1';
    alert(`Unable to save reaction. Error: ${error.message}`);
  });
}
window.react = react;

// === Show Confessions (only on confessions.html) ===
if (document.getElementById("confessions")) {
  db.collection("confessions")
    .orderBy("timestamp", "desc")
    .onSnapshot(snapshot => {
      const container = document.getElementById("confessions");
      
      if (snapshot.empty) {
        container.innerHTML = '<div class="no-confessions">No confessions yet. Be the first to share your heart. 💝</div>';
        return;
      }

      container.innerHTML = "";

      snapshot.forEach(doc => {
        const data = doc.data();
        // Only show approved confessions
        if (!data.approved) return;
        const message = data.message || "";
        const response = data.response || "Your response is on the way. Please check back later. 🕊️";
        const reactions = data.reactions || {};
        const helped = (Number.isFinite(reactions.helped) && reactions.helped >= 0) ? reactions.helped : 0;
        const prayed = (Number.isFinite(reactions.prayed) && reactions.prayed >= 0) ? reactions.prayed : 0;
        const notAlone = (Number.isFinite(reactions.notAlone) && reactions.notAlone >= 0) ? reactions.notAlone : 0;
        
        // Format timestamp
        const timestamp = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleDateString() : '';
        
        // Check if user already reacted (localStorage)
        const userReactions = JSON.parse(localStorage.getItem('confessionReactions') || '{}');
        const userReacted = userReactions[doc.id] || {};

        const card = document.createElement("div");
        card.className = "confession";
        
        // Create confession message element safely
        const messageDiv = document.createElement("div");
        messageDiv.className = "confession-message";
        messageDiv.innerHTML = '<strong>Anonymous said:</strong><br>';
        const messageText = document.createElement("span");
        messageText.textContent = message;
        messageDiv.appendChild(messageText);
        
        // Create response element safely
        const responseDiv = document.createElement("div");
        responseDiv.className = "confession-response";
        responseDiv.innerHTML = '<span class="response-label">Response:</span>';
        const responseText = document.createElement("span");
        responseText.textContent = response;
        responseDiv.appendChild(responseText);
        
        // Create reactions section with proper event listeners
        const reactionsDiv = document.createElement("div");
        reactionsDiv.className = "reactions";
        
        // Create helped button
        const helpedBtn = document.createElement("button");
        helpedBtn.className = "reaction-btn";
        helpedBtn.innerHTML = `🙏 This helped me <span class="reaction-count">${helped || 0}</span>`;
        if (userReacted.helped) {
          helpedBtn.disabled = true;
          helpedBtn.style.opacity = '0.6';
        }
        helpedBtn.addEventListener('click', (event) => react(doc.id, 'helped', event));
        
        // Create prayed button
        const prayedBtn = document.createElement("button");
        prayedBtn.className = "reaction-btn";
        prayedBtn.innerHTML = `💖 I prayed for you <span class="reaction-count">${prayed || 0}</span>`;
        if (userReacted.prayed) {
          prayedBtn.disabled = true;
          prayedBtn.style.opacity = '0.6';
        }
        prayedBtn.addEventListener('click', (event) => react(doc.id, 'prayed', event));
        
        // Create notAlone button
        const notAloneBtn = document.createElement("button");
        notAloneBtn.className = "reaction-btn";
        notAloneBtn.innerHTML = `🤍 You're not alone <span class="reaction-count">${notAlone || 0}</span>`;
        if (userReacted.notAlone) {
          notAloneBtn.disabled = true;
          notAloneBtn.style.opacity = '0.6';
        }
        notAloneBtn.addEventListener('click', (event) => react(doc.id, 'notAlone', event));
        
        // Create report button
        const reportBtn = document.createElement("button");
        reportBtn.className = "reaction-btn";
        reportBtn.style.cssText = 'background:#ffe0e0;color:#b91c1c;margin-left:10px;';
        reportBtn.innerHTML = '🚩 Report';
        if (localStorage.getItem('reported-' + doc.id)) {
          reportBtn.disabled = true;
          reportBtn.style.opacity = '0.6';
        }
        reportBtn.addEventListener('click', (event) => reportConfession(doc.id, event));
        
        // Append buttons to reactions div
        reactionsDiv.appendChild(helpedBtn);
        reactionsDiv.appendChild(prayedBtn);
        reactionsDiv.appendChild(notAloneBtn);
        reactionsDiv.appendChild(reportBtn);
        
        // Create comments section
        const commentsSection = document.createElement("div");
        commentsSection.className = "comments-section";
        commentsSection.id = `comments-${doc.id}`;
        commentsSection.innerHTML = `
          <div class="comments-list" id="comments-list-${doc.id}">Loading comments...</div>
          <form class="comment-form" onsubmit="return submitComment(event, '${doc.id}')">
            <input type="text" class="comment-input" id="comment-input-${doc.id}" maxlength="300" placeholder="Leave a supportive comment..." required style="width:80%;padding:8px;border-radius:8px;border:1px solid #ccc;">
            <button type="submit" style="margin-left:8px;padding:8px 16px;border-radius:8px;background:#7868e6;color:#fff;border:none;cursor:pointer;">Send</button>
          </form>
        `;
        
        // Create timestamp element safely
        if (timestamp) {
          const timestampDiv = document.createElement("div");
          timestampDiv.className = "timestamp";
          timestampDiv.textContent = `Shared on ${timestamp}`;
          card.appendChild(timestampDiv);
        }
        
        // Append all elements to card
        card.appendChild(messageDiv);
        card.appendChild(responseDiv);
        card.appendChild(reactionsDiv);
        card.appendChild(commentsSection);
        container.appendChild(card);

        // Real-time comments listener
        db.collection("confessions").doc(doc.id).collection("comments").orderBy("timestamp", "asc")
          .onSnapshot(commentSnap => {
            const listDiv = document.getElementById(`comments-list-${doc.id}`);
            if (!listDiv) return;
            if (commentSnap.empty) {
              listDiv.innerHTML = '<div style="color:#888;font-size:0.95em;">No comments yet. Be the first to encourage!</div>';
              return;
            }
            let commentsHtml = '';
            commentSnap.forEach(commentDoc => {
              const c = commentDoc.data();
              if (!c.approved) return; // Only show approved comments
              const text = c.text || '';
              const time = c.timestamp ? new Date(c.timestamp.toDate()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '';
              
              // Create comment element safely
              const commentDiv = document.createElement("div");
              commentDiv.style.cssText = 'margin-bottom:6px;padding:7px 12px;background:#f8f8ff;border-radius:8px;';
              
              const anonymousSpan = document.createElement("span");
              anonymousSpan.style.cssText = 'color:#4b3f72;font-weight:500;';
              anonymousSpan.textContent = 'Anonymous:';
              
              const textSpan = document.createElement("span");
              textSpan.textContent = text;
              
              const timeSpan = document.createElement("span");
              timeSpan.style.cssText = 'color:#aaa;font-size:0.85em;float:right;';
              timeSpan.textContent = time;
              
              commentDiv.appendChild(anonymousSpan);
              commentDiv.appendChild(document.createTextNode(' '));
              commentDiv.appendChild(textSpan);
              commentDiv.appendChild(document.createTextNode(' '));
              commentDiv.appendChild(timeSpan);
              
              commentsHtml += commentDiv.outerHTML;
            });
            listDiv.innerHTML = commentsHtml;
          });
      });
    }, (error) => {
      console.error("❌ Firestore load error:", error);
      document.getElementById("confessions").innerHTML = '<div class="no-confessions">Unable to load confessions. Please try again. 🙏</div>';
    });
}

// Handle comment submission
window.submitComment = async function(event, confessionId) {
  event.preventDefault();
  const input = document.getElementById(`comment-input-${confessionId}`);
  const text = input.value.trim();
  if (!text) return false;
  input.disabled = true;
  try {
    await db.collection("confessions").doc(confessionId).collection("comments").add({
      text,
      approved: false,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
    input.value = '';
  } catch (e) {
    alert('Could not send comment. Please try again.');
  }
  input.disabled = false;
  return false;
}

// Add reportConfession function
window.reportConfession = async function(confessionId, event) {
  console.log('🚩 Report function called:', { confessionId });
  
  if (localStorage.getItem('reported-' + confessionId)) {
    console.log('⚠️ Already reported this confession');
    return;
  }
  
  const button = event.target.closest('.reaction-btn');
  if (button) {
    button.disabled = true;
    button.style.opacity = '0.6';
  }
  
  try {
    await db.collection('confessions').doc(confessionId).update({
      flagCount: firebase.firestore.FieldValue.increment(1)
    });
    console.log("Report saved:", confessionId);
    localStorage.setItem('reported-' + confessionId, '1');
    alert('Thank you for reporting. Our team will review this confession.');
  } catch (error) {
    console.error("Error saving report:", error);
    alert(`Could not report. Error: ${error.message}`);
    if (button) {
      button.disabled = false;
      button.style.opacity = '1';
    }
  }
}

window.showCustomAlert = function(message) {
  var alertBox = document.getElementById('customAlert');
  var alertMsg = document.getElementById('customAlertMessage');
  if (alertBox && alertMsg) {
    alertMsg.textContent = message;
    alertBox.style.display = 'flex';
    // Hide all images while dialog is open
    document.querySelectorAll('img').forEach(img => img.style.visibility = 'hidden');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var link = document.getElementById('downloadAppLink');
  var isInApp = false;
  if (window.Capacitor && window.Capacitor.getPlatform) {
    window.Capacitor.getPlatform().then(function(platform) {
      if (platform !== 'web' && link) {
        link.style.display = 'none';
      }
    });
    isInApp = true;
  } else if (window.Capacitor && window.Capacitor.platform) {
    if (window.Capacitor.platform !== 'web' && link) {
      link.style.display = 'none';
    }
    isInApp = true;
  }
  // Fallback: check for Android WebView user agent
  if (!isInApp && link) {
    var ua = navigator.userAgent || navigator.vendor || window.opera;
    if (/wv/.test(ua) || /Android.*Version\/\d+\.\d+/.test(ua)) {
      link.style.display = 'none';
    }
  }
});

// Navbar active link highlighting and smooth scroll
function setActiveNavLink() {
  const links = document.querySelectorAll('.navbar-links a');
  const path = window.location.pathname.split('/').pop() || 'index.html';
  links.forEach(link => {
    // Remove all active classes
    link.classList.remove('active');
    // Home
    if (link.getAttribute('href') === 'index.html' && (path === '' || path === 'index.html')) {
      link.classList.add('active');
    }
    // Check
    if (link.getAttribute('href') === 'check.html' && path === 'check.html') {
      link.classList.add('active');
    }
    // About
    if (link.getAttribute('href') === 'about.html' && path === 'about.html') {
      link.classList.add('active');
    }
    // Privacy
    if (link.getAttribute('href') === 'privacy.html' && path === 'privacy.html') {
      link.classList.add('active');
    }
  });
}

function handleNavbarScroll() {
  const submitLink = document.querySelector('.nav-submit');
  if (!submitLink) return;
  submitLink.addEventListener('click', function(e) {
    // If already on home page, scroll to form
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '') {
      const form = document.getElementById('confession-form');
      if (form) {
        e.preventDefault();
        form.scrollIntoView({ behavior: 'smooth' });
        // Close mobile menu if open
        document.getElementById('navbar-toggle').checked = false;
      }
    } else {
      // If not on home, go to home with anchor
      submitLink.setAttribute('href', 'index.html#confession-form');
    }
  });
}

document.addEventListener('DOMContentLoaded', function() {
  setActiveNavLink();
  handleNavbarScroll();
});







