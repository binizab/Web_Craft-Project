import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
    import { 
        getAuth, signInWithEmailAndPassword,  
         onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup 
    } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

    const firebaseConfig = {
        apiKey: "AIzaSyA6lvXt1RVDbUYF1jL0yWj6OtU4Dd9-1ms",
        authDomain: "eb-academy-7f198.firebaseapp.com",
        projectId: "eb-academy-7f198",
        appId: "1:1056181453023:web:6604a142c9997045fee96a"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    
    window.navTo = (id) => {
        document.getElementById('modal-overlay').classList.add('active');
        document.querySelectorAll('.signContainer').forEach(c => c.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    };

    window.closeAll = () => {
        document.getElementById('modal-overlay').classList.remove('active');
    };

    window.showAlert = (msg, isError = false) => {
        const alertBox = document.getElementById('custom-alert');
        const alertText = document.getElementById('alert-text');
        alertText.innerText = msg;
        isError ? alertBox.classList.add('error') : alertBox.classList.remove('error');
        alertBox.classList.add('show');
        setTimeout(() => alertBox.classList.remove('show'), 4000);
    };

    document.getElementById('doSignIn').onclick = () => {
        const e = document.getElementById('logEmail').value;
        const p = document.getElementById('logPass').value;
        if(!e || !p) return window.showAlert("Please enter credentials", true);
        
        signInWithEmailAndPassword(auth, e, p)
            .then(() => {
                window.showAlert("Welcome back!");
                window.closeAll();
            })
            .catch(err => window.showAlert("Login Failed: " + err.message, true));
    };

    document.getElementById('doGoogle').onclick = () => {
        signInWithPopup(auth, provider)
            .then(() => {
                window.showAlert("Google Sign-in Successful");
                window.closeAll();
            })
            .catch(err => window.showAlert(err.message, true));
    };

    document.getElementById('doSignOut').onclick = () => {
        signOut(auth).then(() => {
            window.showAlert("Logged out");
            setTimeout(() => location.reload(), 1000);
        });
    };

    onAuthStateChanged(auth, (user) => {
        const gk = document.getElementById('gatekeeper');
        if(user) {
            gk.innerHTML = `<button class="btn-get-started" style="width: 50px; padding: 10px 10px; height: 50px; border-radius: 50%; background: var(--primary); outline: none; border: none; cursor: pointer;" onclick="navTo('viewProfile')"><i class="fas fa-user left-icon"></i></button>`;
            document.getElementById('userGreet').innerText = `Welcome, ${user.displayName || 'Explorer'}!`;
            document.getElementById('userMail').innerText = user.email;
        } else {
            gk.innerHTML = `<button class="btn-get-started" style="width: 130px; height: 40px; border-radius: 12px; background: var(--primary); outline: none; border: none; cursor: pointer; padding: 7px 10px;" onclick="navTo('viewSignIn')">Get Started</button>`;
        }
    });

    window.togglePass = (id, el) => {
    const input = document.getElementById(id);
    if (input.type === "password") {
        input.type = "text";
        el.classList.replace("fa-eye", "fa-eye-slash");
    } else {
        input.type = "password";
        el.classList.replace("fa-eye-slash", "fa-eye");
    }
};

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.signContainer.active');
  const overlay = document.getElementById('modal-overlay');
  const strength = 10;

  // 1. Verification Check
  if (cards.length === 0) {
    console.warn("Tilt Script: No cards found with class '.signContainer.active'");
  }
  if (!overlay) {
    console.error("Tilt Script: Element '#modal-overlay' not found");
  }

  if (overlay && cards.length > 0) {
    console.log(`Tilt Script: Initialized for ${cards.length} cards.`);

    overlay.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;

      // Use requestAnimationFrame for high performance
      requestAnimationFrame(() => {
        cards.forEach(card => {
          const rect = card.getBoundingClientRect();
          
          // Calculate center of the card
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Calculate rotation (relative to mouse distance from center)
          const rotateX = ((clientY - centerY) / (rect.height / 2)) * -strength;
          const rotateY = ((clientX - centerX) / (rect.width / 2)) * strength;

          // Apply transformation
          card.style.transform = `scale(1.03) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-16px)`;
        });
      });
    });

    overlay.addEventListener('mouseleave', () => {
      cards.forEach(card => {
        const isPopular = card.classList.contains('popular');
        // Reset to original state
        card.style.transform = isPopular 
          ? 'scale(1.03) rotateX(0) rotateY(0) translateY(0)' 
          : 'rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }
});