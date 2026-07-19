lucide.createIcons();
// ========== EMAILJS INITIALIZATION (Using your working keys) ==========
(function() {
    emailjs.init("vUYnQJyEb_HW8suO9"); // Your working public key
})();
document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Reveal Logic
  const observerOptions = { threshold: 0.2 };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // If content column, add a small delay like React's delay-300
        if (entry.target.classList.contains('content-column')) {
            entry.target.style.transitionDelay = '300ms';
        }
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal-left, .reveal-right').forEach(el => observer.observe(el));

  // 2. 3D Tilt Logic
  const tiltCard = document.getElementById('tilt-card');
  const inner = tiltCard.querySelector('.image-inner');
  const strength = 8; // Adjust tilt intensity

  tiltCard.addEventListener('mousemove', (e) => {
    const { left, top, width, height } = tiltCard.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    const moveX = (x - 0.5) * (strength * 2);
    const moveY = (y - 0.5) * (strength * 2);

    inner.style.transform = `rotateX(${-moveY}deg) rotateY(${moveX}deg)`;
  });

  tiltCard.addEventListener('mouseleave', () => {
    inner.style.transform = `rotateX(0deg) rotateY(0deg)`;
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Typed.js
  const options = {
    strings: [
      "School Websites", 
      "Business Portals", 
      "Portfolio Websites", 
      "E-Commerce Sites", 
      "Admin Dashboards"
    ],
    typeSpeed: 60,
    backSpeed: 35,
    backDelay: 1500,
    loop: true,
  };

  const typed = new Typed('#typed-text', options);

  // Optional: Simple Scroll Reveal Trigger
  // This mimics the 'animate-slide-in-left' classes if you want to trigger them on load
  const heroContent = document.querySelector('.hero-content');
  const heroImage = document.querySelector('.hero-image-wrapper');

  heroContent.style.opacity = '1';
  heroImage.style.opacity = '1';
});

document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('main-header');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // 1. Mobile Menu Toggle
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const isOpened = navMenu.classList.contains('open');
    menuToggle.querySelector('.icon-menu').style.display = isOpened ? 'none' : 'block';
    menuToggle.querySelector('.icon-close').style.display = isOpened ? 'block' : 'none';
  });

  // 2. Scroll Logic
  window.addEventListener('scroll', () => {
    // Header background change
    if (window.scrollY > 80) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll Spy (Active Link)
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      if (window.scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    // Check if at bottom for Contact
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
      current = "contact";
    }

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href').includes(current)) {
        link.classList.add('active');
      }
    });
  });

  // 3. Close menu on link click (Mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuToggle.querySelector('.icon-menu').style.display = 'block';
      menuToggle.querySelector('.icon-close').style.display = 'none';
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Reveal Logic
  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // 2. 3D Tilt Logic
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    const strength = card.getAttribute('data-tilt-strength') || 10;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -strength;
      const rotateY = ((x - centerX) / centerX) * strength;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `rotateX(0deg) rotateY(0deg) translateY(0)`;
    });
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // 1. 3D Tilt Logic
  const tiltCards = document.querySelectorAll('.tilt-card');

  tiltCards.forEach(card => {
    const strength = card.getAttribute('data-tilt-strength') || 12;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate rotation based on mouse position
      const rotateX = ((y - centerY) / centerY) * -strength;
      const rotateY = ((x - centerX) / centerX) * strength;

      card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-16px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `rotateX(0deg) rotateY(0deg) translateY(0)`;
    });
  });

  // 2. Scroll Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // 2. 3D Tilt Logic
  const cards = document.querySelectorAll('.tilt-card');

  cards.forEach(card => {
    const strength = 8;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -strength;
      const rotateY = ((x - centerX) / centerX) * strength;

      // Special case for Popular card: keep its natural scale
      const isPopular = card.classList.contains('popular');
      const baseScale = isPopular ? 'scale(1.03)' : '';

      card.style.transform = `${baseScale} rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-16px)`;
    });

    card.addEventListener('mouseleave', () => {
      const isPopular = card.classList.contains('popular');
      card.style.transform = isPopular ? 'scale(1.03) rotateX(0) rotateY(0)' : 'rotateX(0) rotateY(0)';
    });
  });
});


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
document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal');

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Once the animation is triggered, we can stop observing this element
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  revealElements.forEach(el => observer.observe(el));
});

document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-item');

  // 1. Accordion Toggle Logic
  faqItems.forEach(item => {
    item.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other items (Optional: remove this part if you want multiple open)
      faqItems.forEach(i => i.classList.remove('active'));

      // If the clicked item wasn't open, open it
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });

  // 2. Scroll Reveal Logic
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});

document.addEventListener('DOMContentLoaded', () => {
  const ctaReveal = document.querySelector('.cta-section .reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  if (ctaReveal) observer.observe(ctaReveal);
});

document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

// ========== COMMENT SECTION FUNCTION (Using your working EmailJS) ==========
window.sendComment = () => {
    const name = document.getElementById("commentName")?.value.trim();
    const email = document.getElementById("commentEmail")?.value.trim();
    const comment = document.getElementById("commentText")?.value.trim();
    const statusEl = document.getElementById("commentStatus");
    
    if (!name || !email || !comment) {
        if (statusEl) statusEl.innerText = "Please fill in all fields ❌";
        return;
    }
    
    if (!email.includes('@')) {
        if (statusEl) statusEl.innerText = "Valid email required ❌";
        return;
    }
    
    if (statusEl) statusEl.innerText = "Sending... 📧";
    
    const params = {
        from_name: name,
        from_email: email,
        comment: comment
    };
    
    emailjs.send(
        "service_k6ar6un",    // Your Service ID
        "template_jrs527p",    // Your Template ID
        params
    ).then(() => {
        if (statusEl) {
            statusEl.innerText = "Comment sent successfully ✅";
            statusEl.style.color = "#10b981";
        }
        document.getElementById("commentName").value = "";
        document.getElementById("commentEmail").value = "";
        document.getElementById("commentText").value = "";
        
        // Show toast alert
        window.showAlert?.("Thank you for your comment!", false);
    }).catch((error) => {
        console.error(error);
        if (statusEl) {
            statusEl.innerText = "Failed to send ❌";
            statusEl.style.color = "#ef4444";
        }
    });
};

const toggleTheme = (e) => {
    e.stopPropagation();
    const toggleThemeIcon = document.querySelector('#theme_toggle i');
    toggleThemeIcon.classList.toggle('fa-moon');
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    updateCheck(document.getElementById('theme_toggle'));
}

const themeToggle = document.getElementById('theme_toggle');

themeToggle.addEventListener('click', toggleTheme);

// school_website_home.js

function updateCheck(el) {
    // 1. Find the <ul> list that contains this specific item
    const parentList = el.closest('.list-group');
    
    // 2. Remove 'selected' from all items ONLY in this list
    parentList.querySelectorAll('.list-item').forEach(li => {
        li.classList.remove('selected');
    });
    
    // 3. Add 'selected' to the item you just clicked
    el.classList.add('selected');
}

// === BANK PAYMENT MODAL - Ethiopian Context ===
// Add this AFTER your existing pricing button click handlers

const paymentModal = document.getElementById('bankPaymentModal');
const closeBankModal = document.getElementById('closeBankModalBtn');
const bankForm = document.getElementById('bankPaymentForm');

// Function to open modal with plan details
window.openBankPaymentModal = (planName, price) => {
    if (!paymentModal) return;
    document.getElementById('selectedPlanName').value = planName;
    document.getElementById('selectedAmount').value = price;
    bankForm?.reset();
    const msgDiv = document.getElementById('paymentMsg');
    if (msgDiv) msgDiv.innerHTML = '';
    paymentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Close modal functions
if (closeBankModal) {
    closeBankModal.onclick = () => {
        paymentModal.classList.remove('active');
        document.body.style.overflow = '';
    };
}
if (paymentModal) {
    paymentModal.onclick = (e) => {
        if (e.target === paymentModal) {
            paymentModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };
}
// ESC key close
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && paymentModal?.classList.contains('active')) {
        paymentModal.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Handle bank form submission
if (bankForm) {
    bankForm.onsubmit = (e) => {
        e.preventDefault();
        const holder = document.getElementById('accountHolder')?.value.trim();
        const bank = document.getElementById('bankSelect')?.value;
        const accNum = document.getElementById('accountNumber')?.value.trim();
        const phone = document.getElementById('paymentRef')?.value.trim();
        const plan = document.getElementById('selectedPlanName')?.value;
        const amount = document.getElementById('selectedAmount')?.value;

        if (!holder) return window.showAlert?.("Enter account holder name", true);
        if (!bank) return window.showAlert?.("Select your bank", true);
        if (!accNum || accNum.length < 4) return window.showAlert?.("Valid account number required", true);

        const msgDiv = document.getElementById('paymentMsg');
        if (msgDiv) msgDiv.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Processing...';

        setTimeout(() => {
            // Store in localStorage for demo
            const paymentRecord = {
                timestamp: new Date().toISOString(),
                fullName: holder,
                bank: bank,
                accountNumber: accNum.slice(-4),
                phone: phone || "N/A",
                plan: plan,
                amount: amount + " ETB",
                status: "PENDING"
            };
            let all = JSON.parse(localStorage.getItem('ethiopian_bank_orders') || '[]');
            all.unshift(paymentRecord);
            localStorage.setItem('ethiopian_bank_orders', JSON.stringify(all));

            if (msgDiv) msgDiv.innerHTML = '<i class="fas fa-check-circle" style="color: #10b981;"></i> ✅ Request submitted! We\'ll contact you within 24h.';
            window.showAlert?.(`Payment request for ${plan} submitted!`, false);
            
            setTimeout(() => {
                paymentModal.classList.remove('active');
                document.body.style.overflow = '';
                bankForm.reset();
                if (msgDiv) msgDiv.innerHTML = '';
            }, 2500);
        }, 1000);
    };
}

// Hook into your existing price buttons (add data attributes if missing)
document.querySelectorAll('.btn-plan, .pricing-card .btn-get-started, [onclick*="pricing"]').forEach(btn => {
    if (!btn.hasAttribute('data-payment-attached')) {
        btn.setAttribute('data-payment-attached', 'true');
        btn.addEventListener('click', (e) => {
            // Find parent card with pricing info
            const card = btn.closest('.pricing-card');
            if (card) {
                let planName = card.querySelector('.plan-name')?.innerText || 'Website Package';
                let priceElem = card.querySelector('.amount');
                let price = priceElem ? priceElem.innerText.replace(/[^0-9]/g, '') : '500';
                e.preventDefault();
                window.openBankPaymentModal(planName, price);
            }
        });
    }
});

// === LEGAL MODALS: Terms, Privacy, Cookies with Steps & Video ===
const legalModal = document.getElementById('legalModal');
const legalModalTitle = document.getElementById('legalModalTitle');
const legalContent = document.getElementById('legalContent');
let closeLegalBtn;

// Content for each legal page
const legalData = {
    'terms': {
        title: '📜 Terms of Service',
        content: `
            <h4>1. Acceptance of Terms</h4>
            <p>By accessing and using WebCraft websites and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
            
            <h4>2. Description of Services</h4>
            <p>WebCraft provides web development services including custom websites, e-school platforms, e-commerce solutions, and portfolio websites for individuals, schools, and businesses in Ethiopia and beyond.</p>
            
            <h4>3. Payment Terms</h4>
            <p>All payments are processed via Ethiopian banks (CBE, Dashen, Awash, etc.). 50% deposit may be required for custom projects. Final payment due upon completion and delivery.</p>
            
            <h4>4. Refund Policy</h4>
            <p>We strive for 100% satisfaction. If we fail to deliver according to specifications, partial refunds may be discussed. No refunds after final delivery and acceptance.</p>
            
            <h4>5. Intellectual Property</h4>
            <p>All custom code and designs remain property of WebCraft until full payment. Upon completion, you own the final product. Third-party libraries retain their licenses.</p>
            
            <h4>6. Limitation of Liability</h4>
            <p>WebCraft is not liable for indirect damages, loss of profits, or data breaches caused by third-party hosting or user errors.</p>
        `
    },
    'privacy': {
        title: '🔒 Privacy Policy',
        content: `
            <h4>Information We Collect</h4>
            <p>We collect personal information you provide: name, email, phone, bank account details (for payment verification). We also collect usage data via cookies.</p>
            
            <h4>How We Use Your Information</h4>
            <p>• Process payments and verify bank transfers<br>
            • Communicate about your project<br>
            • Improve our services and website experience<br>
            • Legal compliance and fraud prevention</p>
            
            <h4>Data Security</h4>
            <p>Your bank details are encrypted and stored securely. We never share your information with third parties except for payment processing or legal requirements.</p>
            
            <h4>Your Rights (Ethiopia Context)</h4>
            <p>You have the right to access, correct, or delete your data. Contact us at biniamzabloon@gmail.com for data requests.</p>
            
            <h4>Children's Privacy</h4>
            <p>Our services are not directed to children under 13. We do not knowingly collect data from minors.</p>
        `
    },
    'cookies': {
        title: '🍪 Cookie Policy',
        content: `
            <h4>What Are Cookies</h4>
            <p>Cookies are small text files stored on your device that help us remember your preferences and improve your browsing experience.</p>
            
            <h4>How We Use Cookies</h4>
            <p>• Essential cookies: required for login, forms, and payment features<br>
            • Preference cookies: remember theme (dark/light mode)<br>
            • Analytics cookies: understand how visitors use our site (anonymous)<br>
            • Third-party cookies: from embedded YouTube videos and Lottie animations</p>
            
            <h4>Managing Cookies</h4>
            <p>You can disable cookies in your browser settings. However, some features (like login and payments) may not work properly.</p>
            
            <div class="steps-container">
                <h4 style="margin-top:0;">📋 Steps to Manage Cookies</h4>
                <div class="step-item"><div class="step-number">1</div><span>Open browser settings (Chrome → Settings → Privacy & Security)</span></div>
                <div class="step-item"><div class="step-number">2</div><span>Click "Cookies and other site data"</span></div>
                <div class="step-item"><div class="step-number">3</div><span>Toggle off "Allow all cookies" or block third-party cookies</span></div>
                <div class="step-item"><div class="step-number">4</div><span>Clear existing cookies if desired</span></div>
            </div>
            
            <h4>Third-Party Cookies</h4>
            <p>We embed YouTube videos for tutorials. YouTube may set their own cookies. Please review <a href="https://policies.google.com/technologies/cookies" target="_blank" style="color:var(--primary);">Google's Cookie Policy</a>.</p>
        `
    }
};

// Function to open legal modal
window.openLegalModal = (type) => {
    if (!legalModal || !legalData[type]) return;
    
    const data = legalData[type];
    legalModalTitle.innerHTML = `<i class="fas ${type === 'terms' ? 'fa-file-contract' : type === 'privacy' ? 'fa-shield-alt' : 'fa-cookie-bite'}"></i> ${data.title}`;
    
    let contentHtml = data.content;
    
    // Add video section for Terms or Cookies (educational)
    if (type === 'terms') {
        contentHtml += `
            <h4>📺 How to Use WebCraft - Video Tutorial</h4>
            <div class="video-wrapper">
                <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" 
                        title="How to use WebCraft" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            </div>
            <p><strong>Note:</strong> Replace this YouTube URL with your actual tutorial video. Steps to use our website:</p>
            <div class="steps-container">
                <h4>🚀 Quick Start Guide</h4>
                <div class="step-item"><div class="step-number">1</div><span>Browse our pricing plans and click "Get Started"</span></div>
                <div class="step-item"><div class="step-number">2</div><span>Fill bank payment overlay with your Ethiopian bank details</span></div>
                <div class="step-item"><div class="step-number">3</div><span>Submit payment request - we verify within 24 hours</span></div>
                <div class="step-item"><div class="step-number">4</div><span>Our team contacts you to start your website project</span></div>
                <div class="step-item"><div class="step-number">5</div><span>Get your custom website delivered in 5-15 business days</span></div>
            </div>
        `;
    } else if (type === 'privacy') {
        contentHtml += `
            <h4>📺 Privacy Practices Explained</h4>
            <div class="video-wrapper">
                <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" 
                        title="Privacy Policy Overview" 
                        frameborder="0" 
                        allowfullscreen>
                </iframe>
            </div>
            <p><em>Replace with your actual privacy tutorial video URL.</em></p>
        `;
    } else if (type === 'cookies') {
        contentHtml += `
            <h4>🍪 Understanding Cookies - Video Guide</h4>
            <div class="video-wrapper">
                <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0" 
                        title="Cookie Policy Explained" 
                        frameborder="0" 
                        allowfullscreen>
                </iframe>
            </div>
            <p><em>Replace with your actual cookie management tutorial video.</em></p>
        `;
    }
    
    legalContent.innerHTML = contentHtml;
    legalModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Close modal function
function closeLegalModal() {
    if (legalModal) {
        legalModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Attach close button listener (runs after modal is in DOM)
setTimeout(() => {
    closeLegalBtn = document.querySelector('.close-legal-modal');
    if (closeLegalBtn) {
        closeLegalBtn.onclick = closeLegalModal;
    }
    if (legalModal) {
        legalModal.onclick = (e) => {
            if (e.target === legalModal) closeLegalModal();
        };
    }
    // ESC key close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && legalModal?.classList.contains('active')) {
            closeLegalModal();
        }
    });
}, 100);

// ========== WORKING CONTACT FORM - NO PAGE REFRESH ==========
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        // Remove any existing submit listeners to avoid duplicates
        contactForm.removeEventListener('submit', handleContactSubmit);
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

function handleContactSubmit(e) {
    e.preventDefault();  // This prevents page refresh
    e.stopPropagation(); // Extra safety
    
    const contactForm = document.getElementById('contact-form');
    
    // Get form values
    const name = document.querySelector('#contact-form input[name="name"]')?.value.trim();
    const email = document.querySelector('#contact-form input[name="email"]')?.value.trim();
    const subject = document.querySelector('#contact-form input[name="subject"]')?.value.trim();
    const message = document.querySelector('#contact-form textarea[name="message"]')?.value.trim();
    
    // Validation
    if (!name || !email || !message) {
        window.showAlert?.("Please fill in Name, Email, and Message", true);
        return false;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        window.showAlert?.("Please enter a valid email address", true);
        return false;
    }
    
    // Show loading state
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalHTML = submitBtn?.innerHTML;
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Sending...';
        submitBtn.disabled = true;
    }
    
    // Prepare params for EmailJS
    const params = {
        from_name: name,
        from_email: email,
        subject: subject || "Contact Form Message",
        comment: message
    };
    
    // Send email
    emailjs.send(
        "service_k6ar6un",
        "template_jrs527p",
        params
    ).then(() => {
        window.showAlert?.("✅ Message sent successfully! We'll respond within 24 hours.", false);
        contactForm.reset();
    }).catch((error) => {
        console.error("EmailJS Error:", error);
        window.showAlert?.("❌ Failed to send. Please try again or call +251 906 980 382", true);
    }).finally(() => {
        if (submitBtn) {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
        }
    });
    
    return false; // Extra safeguard against refresh
}

// ========== SERVICE DETAILS MODAL ==========
const serviceModal = document.getElementById('serviceModal');
const serviceModalTitle = document.getElementById('serviceModalTitle');
const serviceModalContent = document.getElementById('serviceModalContent');

// Service data for each card
const serviceData = {
    'ecommerce': {
        title: '🛒 E-commerce Websites',
        content: `
            <p>Custom-built e-commerce websites designed to help you sell products online with ease.</p>
            
            <h4>Features Included:</h4>
            <ul class="service-feature-list">
                <li><i class="fas fa-check-circle"></i> Product Catalog Management</li>
                <li><i class="fas fa-check-circle"></i> Shopping Cart & Checkout</li>
                <li><i class="fas fa-check-circle"></i> Secure Payment Integration (CBE, Dashen, etc.)</li>
                <li><i class="fas fa-check-circle"></i> Order Tracking System</li>
                <li><i class="fas fa-check-circle"></i> Admin Dashboard</li>
                <li><i class="fas fa-check-circle"></i> Inventory Management</li>
                <li><i class="fas fa-check-circle"></i> Customer Reviews & Ratings</li>
            </ul>
            
            <h4>Delivery Time:</h4>
            <p>10-15 business days</p>
            
            <div class="service-price-tag">
                Starting from 1,000 ETB - Contact for custom quote
            </div>
            
            <button class="cta-modal-btn" onclick="document.getElementById('serviceModal').classList.remove('active'); document.getElementById('contact').scrollIntoView({behavior: 'smooth'});">
                <i class="fas fa-paper-plane"></i> Get a Quote
            </button>
        `
    },
    'school': {
        title: '🏫 School Platforms',
        content: `
            <p>Complete digital ecosystems for schools - manage students, teachers, parents, and administration all in one place.</p>
            
            <h4>Features Included:</h4>
            <ul class="service-feature-list">
                <li><i class="fas fa-check-circle"></i> Student Information System</li>
                <li><i class="fas fa-check-circle"></i> Teacher & Staff Dashboard</li>
                <li><i class="fas fa-check-circle"></i> Parent Portal</li>
                <li><i class="fas fa-check-circle"></i> Grade Management System</li>
                <li><i class="fas fa-check-circle"></i> Attendance Tracking</li>
                <li><i class="fas fa-check-circle"></i> Fee Payment System</li>
                <li><i class="fas fa-check-circle"></i> Announcements & Notifications</li>
                <li><i class="fas fa-check-circle"></i> Online Registration/Enrollment</li>
            </ul>
            
            <h4>Delivery Time:</h4>
            <p>15-20 business days</p>
            
            <div class="service-price-tag">
                Starting from 10,000 ETB - Contact for custom quote
            </div>
            
            <button class="cta-modal-btn" onclick="document.getElementById('serviceModal').classList.remove('active'); document.getElementById('contact').scrollIntoView({behavior: 'smooth'});">
                <i class="fas fa-paper-plane"></i> Get a Quote
            </button>
        `
    },
    'portfolio': {
        title: '🎨 Custom Portfolio',
        content: `
            <p>Fully custom-built portfolios designed from scratch to showcase your work and achievements professionally.</p>
            
            <h4>Features Included:</h4>
            <ul class="service-feature-list">
                <li><i class="fas fa-check-circle"></i> Custom Design (Your Brand Colors)</li>
                <li><i class="fas fa-check-circle"></i> Project Gallery/Showcase</li>
                <li><i class="fas fa-check-circle"></i> Resume/CV Download Section</li>
                <li><i class="fas fa-check-circle"></i> About & Contact Pages</li>
                <li><i class="fas fa-check-circle"></i> Skills & Experience Showcase</li>
                <li><i class="fas fa-check-circle"></i> Testimonials Section</li>
                <li><i class="fas fa-check-circle"></i> Blog Integration (Optional)</li>
                <li><i class="fas fa-check-circle"></i> Contact Form</li>
            </ul>
            
            <h4>Delivery Time:</h4>
            <p>5-10 business days</p>
            
            <div class="service-price-tag">
                Starting from 500 ETB - Contact for custom quote
            </div>
            
            <button class="cta-modal-btn" onclick="document.getElementById('serviceModal').classList.remove('active'); document.getElementById('contact').scrollIntoView({behavior: 'smooth'});">
                <i class="fas fa-paper-plane"></i> Get a Quote
            </button>
        `
    },
    'search': {
        title: '🔍 Search Websites',
        content: `
            <p>Search and discover websites built by us - e-commerce, e-school, and portfolio platforms all in one directory.</p>
            
            <h4>Features Included:</h4>
            <ul class="service-feature-list">
                <li><i class="fas fa-check-circle"></i> Advanced Search Filters</li>
                <li><i class="fas fa-check-circle"></i> Category Browsing</li>
                <li><i class="fas fa-check-circle"></i> Website Previews</li>
                <li><i class="fas fa-check-circle"></i> Client Reviews</li>
                <li><i class="fas fa-check-circle"></i> Contact Information</li>
                <li><i class="fas fa-check-circle"></i> Featured Listings</li>
            </ul>
            
            <h4>Delivery Time:</h4>
            <p>7-12 business days</p>
            
            <div class="service-price-tag">
                Starting from 2,000 ETB - Contact for custom quote
            </div>
            
            <button class="cta-modal-btn" onclick="document.getElementById('serviceModal').classList.remove('active'); document.getElementById('contact').scrollIntoView({behavior: 'smooth'});">
                <i class="fas fa-paper-plane"></i> Get a Quote
            </button>
        `
    },
    'connect': {
        title: '🔗 Connect',
        content: `
            <p>Connect with workers through their portfolios and with schools through their platforms. A networking hub for professionals and institutions.</p>
            
            <h4>Features Included:</h4>
            <ul class="service-feature-list">
                <li><i class="fas fa-check-circle"></i> Professional Directory</li>
                <li><i class="fas fa-check-circle"></i> Messaging System</li>
                <li><i class="fas fa-check-circle"></i> Job Postings</li>
                <li><i class="fas fa-check-circle"></i> Application Tracking</li>
                <li><i class="fas fa-check-circle"></i> Profile Verification</li>
                <li><i class="fas fa-check-circle"></i> Rating System</li>
                <li><i class="fas fa-check-circle"></i> Collaboration Tools</li>
            </ul>
            
            <h4>Delivery Time:</h4>
            <p>15-25 business days</p>
            
            <div class="service-price-tag">
                Starting from 5,000 ETB - Contact for custom quote
            </div>
            
            <button class="cta-modal-btn" onclick="document.getElementById('serviceModal').classList.remove('active'); document.getElementById('contact').scrollIntoView({behavior: 'smooth'});">
                <i class="fas fa-paper-plane"></i> Get a Quote
            </button>
        `
    },
    'buy': {
        title: '💰 Buy / Virtual Market',
        content: `
            <p>Access the virtual market anytime with our self-made e-commerce websites. Shop, sell, and manage your online business effortlessly.</p>
            
            <h4>Features Included:</h4>
            <ul class="service-feature-list">
                <li><i class="fas fa-check-circle"></i> Multi-Vendor Support</li>
                <li><i class="fas fa-check-circle"></i> Digital Product Delivery</li>
                <li><i class="fas fa-check-circle"></i> Secure Payment Gateway</li>
                <li><i class="fas fa-check-circle"></i> Order Management</li>
                <li><i class="fas fa-check-circle"></i> Customer Support System</li>
                <li><i class="fas fa-check-circle"></i> Discount & Coupon System</li>
                <li><i class="fas fa-check-circle"></i> Analytics Dashboard</li>
                <li><i class="fas fa-check-circle"></i> Mobile Responsive Design</li>
            </ul>
            
            <h4>Delivery Time:</h4>
            <p>12-18 business days</p>
            
            <div class="service-price-tag">
                Starting from 3,000 ETB - Contact for custom quote
            </div>
            
            <button class="cta-modal-btn" onclick="document.getElementById('serviceModal').classList.remove('active'); document.getElementById('contact').scrollIntoView({behavior: 'smooth'});">
                <i class="fas fa-paper-plane"></i> Get a Quote
            </button>
        `
    }
};

// Function to open service modal
window.openServiceModal = (serviceType) => {
    if (!serviceModal || !serviceData[serviceType]) return;
    
    const data = serviceData[serviceType];
    serviceModalTitle.innerHTML = `<i class="fas fa-info-circle"></i> ${data.title}`;
    serviceModalContent.innerHTML = data.content;
    serviceModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Close modal function
function closeServiceModal() {
    if (serviceModal) {
        serviceModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Attach close button listener
setTimeout(() => {
    const closeServiceBtn = document.querySelector('.close-service-modal');
    if (closeServiceBtn) {
        closeServiceBtn.onclick = closeServiceModal;
    }
    if (serviceModal) {
        serviceModal.onclick = (e) => {
            if (e.target === serviceModal) closeServiceModal();
        };
    }
    // ESC key close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && serviceModal?.classList.contains('active')) {
            closeServiceModal();
        }
    });
}, 100);

// Hook into Learn More buttons on service cards
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    const serviceTypes = ['ecommerce', 'school', 'portfolio', 'search', 'connect', 'buy'];
    
    serviceCards.forEach((card, index) => {
        const learnMoreBtn = card.querySelector('.learn-more');
        if (learnMoreBtn && serviceTypes[index]) {
            learnMoreBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.openServiceModal(serviceTypes[index]);
            });
        }
    });
});