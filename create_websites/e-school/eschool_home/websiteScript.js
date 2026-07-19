 const swiper = new Swiper('.swiper', {
      direction: 'horizontal',
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });

    const signBox = document.getElementById("sWrapper");
    const logBox = document.getElementById("lWrapper");
    const chatBot = document.getElementById("chatBot");
    const addWrapper = document.getElementById("addWrapper");
    const home = document.getElementById("home");
    const about = document.getElementById("about");
    const service = document.getElementById("service");
    const test = document.getElementById("test");
    const gallery = document.getElementById("gallery");
    const contact = document.getElementById("contact");
    const button = document.getElementsByTagName("btn");
    const service1 = document.getElementById('service1');
    const service2 = document.getElementById('service2');
    const service3 = document.getElementById('service3');
    const service4 = document.getElementById('service4');


    function signIn() {
      signBox.classList.toggle("movement");
      logBox.classList.remove("movement");
      chatBot.classList.remove("invisibility");
    }

    function logIn() {
      logBox.classList.toggle("movement");
      signBox.classList.remove("movement");
      chatBot.classList.remove("invisibility");

      window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  document.querySelectorAll("ul li").forEach(li => li.classList.remove("active"));


  document.getElementById("home").classList.add("active");

    }

    function openChat() {
      chatBot.classList.toggle("invisibility");
      logBox.classList.remove("movement");
      signBox.classList.remove("movement");
    }

    function addfun() {
      addWrapper.classList.toggle("invisibility");
    }

    function scrollToSection(id, scrollTop) {
  window.scrollTo({
    top: scrollTop,
    behavior: "smooth"
  });

  document.querySelectorAll("ul li").forEach(li => li.classList.remove("active"));

  document.getElementById(id).classList.add("active");
}

window.addEventListener('scroll', () => {

  let screen = window.scrollY;

  if(screen > 0 && screen < 630) {

  home.classList.add("active");
  about.classList.remove("active");
  service.classList.remove("active");
  test.classList.remove("active");
  gallery.classList.remove("active");
  contact.classList.remove("active");
}

else if(screen > 630 && screen < 1200) {

  home.classList.remove("active");
  about.classList.add("active");
  service.classList.remove("active");
  test.classList.remove("active");
  gallery.classList.remove("active");
  contact.classList.remove("active");
}

else if(screen > 1200 && screen < 2000) {

  home.classList.remove("active");
  about.classList.remove("active");
  service.classList.add("active");
  test.classList.remove("active");
  gallery.classList.remove("active");
  contact.classList.remove("active");
}

else if(screen > 2000 && screen < 2600) {

  home.classList.remove("active");
  about.classList.remove("active");
  service.classList.remove("active");
  test.classList.add("active");
  gallery.classList.remove("active");
  contact.classList.remove("active");
}

else if(screen > 2600 && screen < 3700) {

  home.classList.remove("active");
  about.classList.remove("active");
  service.classList.remove("active");
  test.classList.remove("active");
  gallery.classList.add("active");
  contact.classList.remove("active");
}

else if(screen > 3700) {

  home.classList.remove("active");
  about.classList.remove("active");
  service.classList.remove("active");
  test.classList.remove("active");
  gallery.classList.remove("active");
  contact.classList.add("active");
}

});

window.onscroll = function () {
      const btn = document.getElementById("btn");
      if (document.body.scrollTop > 360 || document.documentElement.scrollTop > 360) {
        btn.style.display = "block";
      } else {
        btn.style.display = "none";
      }
    };

    const switchContainer = document.getElementById("switchContainer");
    const slideBoxDiv = document.getElementById("slideBox");
    const body = document.getElementById("submitSignUp");

    // Add a state variable or use a class check (using class check is generally cleaner)
    
    switchContainer.addEventListener('click', function() {
        // Toggle the 'on-state' class on the container
        switchContainer.classList.toggle('on-state');
        
        // Optional: Toggle dark mode on the body

        // Change the icon based on the current state
        const icon = slideBoxDiv.querySelector('i');
        
        if (switchContainer.classList.contains('on-state')) {
            // If it's 'on', set it to the moon icon (dark mode)
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        } else {
            // If it's 'off', set it back to the sun icon (light mode)
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            body.classList.add("color");
        }
    });

const btn = document.getElementById('dropdownBtn');
        const menu = document.getElementById('dropdownMenu');
        const h2 = document.getElementsByTagName("h2")[0];

        btn.addEventListener('click', () => {
            menu.classList.toggle('show');
        });

        window.onclick = function(event) {
            if (!event.target.matches('.main')) {
                if (menu.classList.contains('show')) {
                    menu.classList.remove('show');
                }
            }
        }

        function selectLang(lang, flagClass) {
            btn.innerHTML = `<span class="fi ${flagClass}"></span> ${lang}`;
            menu.classList.remove('show');
            
            if(lang === 'Amharic') {
                title.innerHTML = '🏫 ኢቢ አካዳሚ';
            } else if(lang === 'English') {
                title.innerHTML = '🏫 Eb academy';
            }
        }

        function handleKeyPress(event) {
                if (event.key === 'Enter') {
                    sendMessage();
                }
            }

            async function sendMessage() {
                const inputElement = document.getElementById('userInput');
                const chatHistoryDiv = document.getElementById('chat-history');
                const userMessageText = inputElement.value.trim();

                if (!userMessageText) {
                    return; // Do nothing if input is empty
                }

                // 1. Display User's Message
                const userMessageDiv = document.createElement('div');
                userMessageDiv.className = 'chat-message user-message';
                userMessageDiv.textContent = userMessageText;
                chatHistoryDiv.appendChild(userMessageDiv);

                // 2. Display Bot's Loading Message (Placeholder)
                const botMessageDiv = document.createElement('div');
                botMessageDiv.className = 'chat-message bot-message';
                botMessageDiv.innerHTML = 'Thinking...';
                chatHistoryDiv.appendChild(botMessageDiv);

                // Scroll to the bottom to show the latest message
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;

                // Clear the input field
                inputElement.value = '';

                // --- API Call ---
                try {
                    const response = await fetch(
                        'https://openrouter.ai/api/v1/chat/completions',
                        {
                            method: 'POST',
                            headers: {
                                Authorization:
                                    'Bearer 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',
                                'HTTP-Referer': 'https://www.sitename.com',
                                'X-Title': 'SiteName',
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                model: 'google/gemma-3n-e4b-it:free',
                                messages: [
                                    { role: 'user', content: userMessageText },
                                ],
                            }),
                        },
                    );
                    const data = await response.json();
                    const markdownText =
                        data.choices?.[0]?.message?.content ||
                        'Sorry, I could not get a response.';

                    // 3. Update Bot's Message with the actual response
                    botMessageDiv.innerHTML = marked.parse(markdownText);
                } catch (error) {
                    // 4. Update Bot's Message with error
                    console.error('API Error:', error);
                    botMessageDiv.innerHTML =
                        '**Error:** Could not connect to the API.';
                }

                // Scroll to the bottom again after the response is loaded
                chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
            }

const profileIcon = document.getElementById("profileIcon");
const profileBox = document.getElementById("profileBox");
const profileBtn = document.getElementById('profileShow');

const submitSignIn = document.getElementById("submitSignIn");
const submitSignUp = document.getElementById("submitSignUp");
const googleSignIn = document.getElementById("googleSignIn");
const googleSignUp = document.getElementById("googleSignUp");
const deleteBtn = document.getElementById("deleteBtn");
const title = document.getElementById('title');

// Toggle password
document.querySelectorAll(".toggle-password").forEach(btn=>{
btn.onclick=()=>{
const input=document.getElementById(btn.dataset.target);
const icon=btn.querySelector("i");
input.type=input.type==="password"?"text":"password";
icon.classList.toggle("fa-eye");
icon.classList.toggle("fa-eye-slash");
};
});

// Email auth
submitSignIn.onclick=e=>{
e.preventDefault();
signInWithEmail(email.value,password.value);

};

submitSignUp.onclick=e=>{
e.preventDefault();
signUpWithEmail(rEmail.value,rPassword.value,fName.value+" "+lName.value);
};

// Delete account
deleteBtn.onclick=()=>{
if(confirm("This will permanently delete your account. Continue?")){
deleteAccount();
}
};

// UI callbacks
window.handleAuthSuccess = (email, name) => {
  const signup = document.getElementById('signup');
  const profileBtn = document.getElementById('profileBtn');

  if (signup) signup.style.display = "none";
  if (profileBtn) profileBtn.classList.remove('hide');
  
  console.log(`User logged in: ${name} (${email})`);
};


window.handleAuthError=msg=>alert(msg);

function show() {
            const emailProfile = document.getElementById('displayUser');
            const userProfile = document.getElementById('displayUser');

            emailProfile.innerHTML = email.value || rEmail.value;
            userProfile.innerHTML = `${fName.value} ${lName.value}` || userName.value;
            var box = document.getElementById("profileBox");
            if (box.style.display === "block") {
                box.style.display = "none";
            } else {
                box.style.display = "block";
            }
        }

        const overlay = document.getElementById('overlay');
    const displayText = document.getElementById('displayText');
    const roleButtons = document.querySelectorAll('.service');
    const errorMessage = document.getElementById('errorMessage');
    let currentTargetUrl = "";

    roleButtons.forEach(button => {
      button.addEventListener('click', () => {
        errorMessage.textContent = "";
        overlay.style.display = 'block'; // Shows overlay (and the container inside)
        
        const greeting = button.getAttribute('data-lang');
        currentTargetUrl = button.getAttribute('data-url');
        displayText.textContent = greeting;
      });
    });

    // Close overlay if clicking outside the box
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });

    document.getElementById('enterBtn').addEventListener('click', () => {
      const name = document.getElementById('nameInput').value;
      const pass = document.getElementById('passkeyInput').value;

      if (name.toLowerCase() === 'zabloon' && pass === 'pass') {
        window.location.href = currentTargetUrl; 
      } else {
        errorMessage.textContent = 'Access Denied!';
      }
    });

    document.getElementById('guestBtn').addEventListener('click', () => {
      if (currentTargetUrl) {
        window.location.href = currentTargetUrl;
      }
    });