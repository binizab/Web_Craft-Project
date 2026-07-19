import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { 
    getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, 
    updateProfile, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Import Dexie
import Dexie from "https://unpkg.com/dexie@latest/dist/dexie.mjs";

// ==================== DEXIE DATABASE ====================
const projectDB = new Dexie("ProjectEngineDB");

projectDB.version(5).stores({
    projects: '++id',
    gallery: '++id, projectId',
    shared: 'key'
});

// Global variables
let currentProjectData = null;
let galleryImages = [];

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyA6lvXt1RVDbUYF1jL0yWj6OtU4Dd9-1ms",
    authDomain: "eb-academy-7f198.firebaseapp.com",
    projectId: "eb-academy-7f198",
    appId: "1:1056181453023:web:6604a142c9997045fee96a"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// ==================== HELPER FUNCTIONS ====================

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getProjectValue(key, fallback = "") {
    if (!currentProjectData) return fallback;
    const value = currentProjectData[key];
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'string' && value.trim() === '') return fallback;
    return value;
}

function getCustomSelectValue(key, fallback = "") {
    return getProjectValue(key, fallback);
}

function getTeacherCardsData() {
    if (currentProjectData && currentProjectData.teacherCards && Array.isArray(currentProjectData.teacherCards) && currentProjectData.teacherCards.length > 0) {
        return currentProjectData.teacherCards;
    }
    return null;
}

function getTestimonialsData() {
    if (currentProjectData && currentProjectData.schoolMembers && Array.isArray(currentProjectData.schoolMembers) && currentProjectData.schoolMembers.length > 0) {
        return currentProjectData.schoolMembers;
    }
    return null;
}

function getBranchesData() {
    if (currentProjectData && currentProjectData.branches && Array.isArray(currentProjectData.branches) && currentProjectData.branches.length > 0) {
        return currentProjectData.branches;
    }
    return null;
}

function getFacilitiesData() {
    if (currentProjectData && currentProjectData.facilities) {
        return currentProjectData.facilities;
    }
    return null;
}

function getFaqsData() {
    if (currentProjectData && currentProjectData.faqs && Array.isArray(currentProjectData.faqs) && currentProjectData.faqs.length > 0) {
        return currentProjectData.faqs;
    }
    return null;
}

// ==================== DEXIE DATA LOADING ====================

async function loadLatestProject() {
    try {
        await projectDB.open();
        const projects = await projectDB.projects.toArray();
        
        if (projects && projects.length > 0) {
            projects.sort((a, b) => (b.id || 0) - (a.id || 0));
            const latestProject = projects[0];
            currentProjectData = latestProject;
            
            // DEBUG: Log the facilities data
            console.log("=== LOADED PROJECT DATA ===");
            console.log("Project name:", latestProject["form-name"]);
            console.log("Full project:", latestProject);
            console.log("Facilities property:", latestProject.facilities);
            console.log("Selected items:", latestProject.facilities?.selectedItems);
            
            await loadGalleryForProject(latestProject.id);
            return latestProject;
        } else {
            console.log("No projects found in database");
            return null;
        }
    } catch (error) {
        console.error("Error loading project from Dexie:", error);
        return null;
    }
}

async function loadGalleryForProject(projectId) {
    try {
        const images = await projectDB.gallery.where("projectId").equals(projectId).toArray();
        galleryImages = images;
        console.log(`Loaded ${images.length} gallery images`);
        return images;
    } catch (error) {
        console.error("Error loading gallery:", error);
        galleryImages = [];
        return [];
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("DOM loaded, loading project data...");
    await loadLatestProject();
    
    initializeNavbar();
    initializeThemeSystem();
    initializeSettingsMenu();
    initializeHeroContent();
    initializeStatsCounter();
    initializeAboutSection();
    initializeProgramsSection();
    initializeFacilitiesSection();
    await initializeGallerySection();
    initializeTeachersSection();
    initializeTestimonialsSection();
    initializeEventsSection();
    initializeFaqSection();
    initializeNewsletterSection();
    await initializeFooterSection(); // Wait for footer to render
    initializeAuthSystem();
    
    // Wait a bit more for Lucide icons to render
    setTimeout(() => {
        initializeMapHandlers();
    }, 500);
    
    if (window.lucide) {
        setTimeout(() => lucide.createIcons(), 100);
    }
    
    initializeScrollReveal();
});

function initializeNavbar() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const nav = document.querySelector('nav');
    
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }
    
    function toggleMenu() {
        if (!mobileOverlay) return;
        const isOpen = mobileOverlay.classList.toggle('open');
        document.body.classList.toggle('no-scroll', isOpen);
        
        const icon = document.getElementById('menuBtnIcon');
        if (icon && window.lucide) {
            icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
            lucide.createIcons();
        }
    }
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });
    }
    
    document.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileOverlay && mobileOverlay.classList.contains('open')) toggleMenu();
        });
    });
    
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll("section[id]");
        const navAnchorLinks = document.querySelectorAll(".nav-links a, .mobile-link");
        
        let currentSectionId = "";
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            if (window.scrollY + 150 >= sectionTop && window.scrollY + 150 < sectionBottom) {
                currentSectionId = section.getAttribute("id");
            }
        });
        
        if (window.scrollY < 500) currentSectionId = "home";
        
        navAnchorLinks.forEach((a) => {
            a.classList.remove("current", "active");
            if (currentSectionId && a.getAttribute('href') === `#${currentSectionId}`) {
                a.classList.add(a.classList.contains('mobile-link') ? "active" : "current");
            }
        });
    });
}

function initializeThemeSystem() {
    window.changeTheme = function(themeName, element) {
        const theme = themeName.toLowerCase();
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('eb-academy-theme', theme);
        
        const label = document.getElementById('activeThemeLabel');
        if (label) label.textContent = themeName;
    };
    
    const savedTheme = localStorage.getItem('eb-academy-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        const label = document.getElementById('activeThemeLabel');
        if (label) {
            label.textContent = savedTheme.charAt(0).toUpperCase() + savedTheme.slice(1);
        }
    }
}

function initializeSettingsMenu() {
    const gearBtn = document.getElementById('gearBtn');
    const dropMenu = document.getElementById('dropMenu');
    
    if (!gearBtn || !dropMenu) return;
    
    gearBtn.addEventListener('click', (e) => {
        dropMenu.classList.toggle('active');
        if (window.goBack) window.goBack();
        e.stopPropagation();
    });
    
    window.openSubMenu = function(listId) {
        const allLists = document.querySelectorAll('.menu-list');
        allLists.forEach(list => list.classList.add('hidden'));
        const target = document.getElementById(listId);
        if (target) target.classList.remove('hidden');
    };
    
    window.goBack = function() {
        const allLists = document.querySelectorAll('.menu-list');
        allLists.forEach(list => list.classList.add('hidden'));
        const mainList = document.getElementById('mainList');
        if (mainList) mainList.classList.remove('hidden');
    };
    
    window.selectLang = function(lang, element) {
        const label = document.getElementById('activeLangLabel');
        if (label) label.textContent = lang;
    };
    
    window.addEventListener('click', () => dropMenu.classList.remove('active'));
    dropMenu.addEventListener('click', (e) => e.stopPropagation());
}

function initializeHeroContent() {
    const schoolName = getProjectValue("form-name", "EB Academy");
    const schoolType = getCustomSelectValue("form-scType", "");
    const establishmentDate = getCustomSelectValue("form-date", "");
    const studentCount = getProjectValue("form-studentNo", "1500");
    const studentType = getCustomSelectValue("form-sType", "");
    const welcomeText = getProjectValue("form-welcome", "");
    const bioText = getProjectValue("form-bio", "");
    const image_bg = document.getElementById("hero-image");
    const heroTitle = document.querySelector('.hero-title');
    const heroName = document.getElementById("hero_schoolName");
    const hero_logo = document.getElementById("logo_img");
    const hero_schoolName_button = document.getElementById("hero_schoolName_button");
    const logo_letter = document.querySelector(".logo-box");
    const footer_name = document.querySelector(".text-primary");
    const made_name = document.getElementById("made_name");
    const card_about_text = document.querySelector(".card-heading");
    const about_logo = document.querySelector(".e-logo");
    const footer_info = document.querySelectorAll('.contact-list li span');
    const cta_name = document.querySelector(".cta-desc span");
    const newsletter_name = document.querySelector(".newsletter-desc span");

if (image_bg) {
        if (galleryImages && galleryImages.length > 0 && galleryImages[0].src) {
            image_bg.src = galleryImages[0].src;
        } else if (currentProjectData && currentProjectData.images && currentProjectData.images.length > 0) {
            image_bg.src = currentProjectData.images[0].src;
        } else {
            image_bg.src = "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80";
        }
    }

    if (hero_logo) {
        if (galleryImages && galleryImages.length > 0 && galleryImages[1].src) {
            hero_logo.src = galleryImages[1].src;
        } else if (currentProjectData && currentProjectData.images && currentProjectData.images.length > 0) {
            hero_logo.src = currentProjectData.images[1].src;
        } else {
            hero_logo.src = "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=80";
        }
    }

        if (heroTitle && schoolName) {
        const nameParts = schoolName.split(' ');
        const firstName = nameParts[0] || "EB";
        heroTitle.innerHTML = `
            <span class="text-white">Welcome to</span>
            <span class="text-gradient">${escapeHtml(firstName)} Academy</span>
        `;

        heroName.textContent = firstName.toUpperCase();
        hero_schoolName_button.textContent = firstName.toUpperCase();
        footer_name.textContent = firstName.toUpperCase();
        made_name.textContent = firstName.toUpperCase();
        card_about_text.textContent = `${firstName} Academy`;

        logo_letter.textContent = firstName.charAt(0).toUpperCase();
        about_logo.textContent = firstName.charAt(0).toUpperCase();
        cta_name.textContent = firstName.toUpperCase();
        newsletter_name.textContent = firstName.toUpperCase();
        const clean_link = firstName.replace(/[^a-zA-Z0-9\s]/g, "").toLowerCase();
        footer_info[2].textContent = `www.${clean_link}.com`;
    }
    
    const heroDescription = document.querySelector('.hero-description');
    if (heroDescription) {
        let descText = welcomeText || bioText;
        if (!descText) {
            descText = `Welcome to ${schoolName}, a premier ${schoolType || "educational"} institution established in ${establishmentDate || "1995"}. We are proud to serve ${studentCount}+ students through our ${studentType || "inclusive"} programs.`;
        }
        heroDescription.textContent = descText;
    }
    
    const badges = document.querySelectorAll('.badge-float .glass-card');
    if (badges.length >= 2) {
        const studentBadgeSpan = badges[0]?.querySelector('span');
        if (studentBadgeSpan && studentCount) {
            studentBadgeSpan.textContent = `${studentCount}+ Students`;
        }
        
        if (establishmentDate) {
            const yearMatch = establishmentDate.match(/\d{4}/);
            if (yearMatch) {
                const yearBadgeSpan = badges[1]?.querySelector('span');
                if (yearBadgeSpan) {
                    const yearDiff = new Date().getFullYear() - parseInt(yearMatch[0]);
                    yearBadgeSpan.textContent = `${yearDiff}+ Years`;
                }
            }
        }
        
        const branches = getBranchesData();
        if (branches && branches.length > 0 && badges.length >= 3) {
            const branchBadgeSpan = badges[2]?.querySelector('span');
            if (branchBadgeSpan) {
                branchBadgeSpan.textContent = `${branches.length} Branches`;
            }
        }
    }
}

function initializeStatsCounter() {
    const studentCount = parseInt(getProjectValue("form-studentNo", "1500"));
    const clubCount = parseInt(getProjectValue("form-clubNo", "45"));
    const branches = getBranchesData();
    const branchCount = branches ? branches.length : 7;
    const establishmentDate = getCustomSelectValue("form-date", "");
    
    let yearsOld = 31;
    if (establishmentDate) {
        const yearMatch = establishmentDate.match(/\d{4}/);
        if (yearMatch) {
            yearsOld = new Date().getFullYear() - parseInt(yearMatch[0]);
        }
    }
    
    const statNumbers = document.querySelectorAll('.stat-number');
    const statData = [
        { target: yearsOld, suffix: '+' },
        { target: studentCount, suffix: '+' },
        { target: branchCount, suffix: '' },
        { target: clubCount, suffix: '' }
    ];
    
    statNumbers.forEach((stat, idx) => {
        if (idx < statData.length) {
            stat.setAttribute('data-target', statData[idx].target);
            stat.setAttribute('data-suffix', statData[idx].suffix);
            stat.innerText = '0' + statData[idx].suffix;
        }
    });
    
    const animateNumbers = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const endValue = parseInt(target.getAttribute('data-target'));
                const suffix = target.getAttribute('data-suffix') || '';
                const duration = 2000;
                let startTime = null;
                
                const step = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    const currentCount = Math.floor(progress * endValue);
                    target.innerText = currentCount + suffix;
                    
                    if (progress < 1) {
                        window.requestAnimationFrame(step);
                    } else {
                        target.innerText = endValue + suffix;
                    }
                };
                
                window.requestAnimationFrame(step);
                observer.unobserve(target);
            }
        });
    };
    
    const countObserver = new IntersectionObserver(animateNumbers, { threshold: 0.5 });
    document.querySelectorAll('.stat-number').forEach(num => countObserver.observe(num));
}

function initializeAboutSection() {
    const aboutText = getProjectValue("form-about", "");
    const visionText = getProjectValue("form-vision", "");
    const missionText = getProjectValue("form-mission", "");
    const valuesText = getProjectValue("form-value", "");
    const innovationText = getProjectValue("form-innovation", "");
    const excellenceText = getProjectValue("form-excellence", "");
    const communityText = getProjectValue("form-community", "");
    const bioText = getProjectValue("form-bio", "");
    
    // Get branches data to extract grade levels
    const branchesData = getBranchesData();
    
    // Function to get grade range from branches
    function getGradeRangeFromBranches() {
        if (!branchesData || branchesData.length === 0) {
            return "Pre-K to 12th Grade";
        }
        
        // Define grade level order for sorting
        const gradeOrder = {
            "Pre-Primary": 0,
            "Pre-K": 1,
            "Kindergarten": 2,
            "KG": 3,
            "Elementary": 4,
            "Middle": 5,
            "High School": 6,
            "Middle School": 7,
            "High": 8,
            "Secondary": 9,
            "University": 10,
            "College": 11,
            "Preparatory": 12,
            "Grade 1": 13,
            "Grade 2": 14,
            "Grade 3": 15,
            "Grade 4": 16,
            "Grade 5": 17,
            "Grade 6": 18,
            "Grade 7": 19,
            "Grade 8": 20,
            "Grade 9": 21,
            "Grade 10": 22,
            "Grade 11": 23,
            "Grade 12": 24
        };
        
        // Collect all unique grades from all branches
        const allGrades = new Set();
        
        branchesData.forEach(branch => {
            if (branch.grades && Array.isArray(branch.grades)) {
                branch.grades.forEach(grade => {
                    allGrades.add(grade);
                });
            }
        });
        
        if (allGrades.size === 0) {
            return "Pre-K to 12th Grade";
        }
        
        // Convert to array and sort by grade order
        const sortedGrades = Array.from(allGrades).sort((a, b) => {
            const aOrder = gradeOrder[a] || 999;
            const bOrder = gradeOrder[b] || 999;
            return aOrder - bOrder;
        });
        
        // Get first and last grade
        const firstGrade = sortedGrades[0];
        const lastGrade = sortedGrades[sortedGrades.length - 1];
        
        // Format the grade range nicely
        function formatGrade(grade) {
            // Map common grade names to nicer display
            const gradeMap = {
                "Pre-Primary": "Pre-K",
                "Kindergarten": "KG",
                "KG": "KG",
                "Elementary": "Elementary",
                "Middle": "Middle School",
                "Middle School": "Middle School",
                "High School": "High School",
                "High": "High School",
                "Secondary": "High School",
                "University": "University",
                "College": "College",
                "Preparatory": "Prep",
                "Grade 1": "1st",
                "Grade 2": "2nd",
                "Grade 3": "3rd",
                "Grade 4": "4th",
                "Grade 5": "5th",
                "Grade 6": "6th",
                "Grade 7": "7th",
                "Grade 8": "8th",
                "Grade 9": "9th",
                "Grade 10": "10th",
                "Grade 11": "11th",
                "Grade 12": "12th"
            };
            
            return gradeMap[grade] || grade;
        }
        
        const formattedFirst = formatGrade(firstGrade);
        const formattedLast = formatGrade(lastGrade);
        
        // If only one grade level
        if (sortedGrades.length === 1) {
            return formattedFirst;
        }
        
        // Check if it's a continuous range
        return `${formattedFirst} to ${formattedLast}`;
    }
    
    // Get the grade range from branches
    const gradeRange = getGradeRangeFromBranches();
    
    const descriptionTexts = document.querySelector('.description-text');
    if (descriptionTexts) {
        if (aboutText) descriptionTexts.textContent = aboutText;
    }
    
    // Update the highlight item that shows grade range
    const highlightItems = document.querySelectorAll('.highlights-grid .highlight-item');
    if (highlightItems.length >= 1) {
        const gradeHighlight = highlightItems[0];
        const highlightVal = gradeHighlight.querySelector('.highlight-val');
        const highlightLabel = gradeHighlight.querySelector('.highlight-label');
        
        if (highlightVal) {
            highlightVal.textContent = gradeRange;
        }
        if (highlightLabel) {
            highlightLabel.textContent = "Grade Levels";
        }
    }
    
    const pillarCards = document.querySelectorAll('.pillar-card');
    const pillarContent = [
        { icon: 'eye', title: 'Vision', text: visionText },
        { icon: 'target', title: 'Mission', text: missionText },
        { icon: 'award', title: 'Values', text: valuesText },
        { icon: 'lightbulb', title: 'Innovation', text: innovationText }
    ];
    
    pillarCards.forEach((card, idx) => {
        if (idx < pillarContent.length && pillarContent[idx].text) {
            const p = card.querySelector('p');
            if (p) p.textContent = pillarContent[idx].text;
        }
    });
    
    const horizontalCards = document.querySelectorAll('.pillar-card-horizontal');
    if (horizontalCards.length >= 2) {
        if (horizontalCards[0] && communityText) {
            const p = horizontalCards[0].querySelector('p');
            if (p) p.textContent = communityText;
        }
        if (horizontalCards[1] && excellenceText) {
            const p = horizontalCards[1].querySelector('p');
            if (p) p.textContent = excellenceText;
        }
        if (horizontalCards[2] && innovationText) {
            const p = horizontalCards[2].querySelector('p');
            if (p) p.textContent = innovationText;
        }
    }
}

function initializeProgramsSection() {
    const grid = document.querySelector('.programs-grid');
    if (!grid || !currentProjectData) return;

    // 1. Get the data saved from Step 5 of the maker
    const facilitiesData = currentProjectData.facilities || {};
    const selectedItems = facilitiesData.selectedItems || [];

    console.log("Selected items from maker:", selectedItems);

    // 2. Create a mapping between maker names and HTML card titles
    // This maps lowercase maker names to the actual HTML card titles
    const titleMapping = {
        "academic excellence": "Academic Excellence",
        "sports and athletics": "Sports & Athletics",
        "sports & athletics": "Sports & Athletics",
        "arts and creativity": "Arts & Creativity",
        "arts & creativity": "Arts & Creativity",
        "technology and stem": "Technology & STEM",
        "technology & stem": "Technology & STEM",
        "music and performing arts": "Music & Performing Arts",
        "science programs": "Science Programs",
        "language programs": "Language Programs",
        "leadership development": "Leadership Development"
    };

    // 3. Create a Map for fast lookup (maker name -> quantity)
    // Also store the mapped HTML title for debugging
    const selectionMap = new Map();
    selectedItems.forEach(item => {
        const makerName = item.name.toLowerCase().trim();
        const htmlTitle = titleMapping[makerName] || makerName;
        selectionMap.set(htmlTitle, item.quantity);
        console.log(`Mapped: "${makerName}" -> "${htmlTitle}" with quantity ${item.quantity}`);
    });

    // 4. Loop through every card already in the HTML
    const cards = grid.querySelectorAll('.program-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const titleElement = card.querySelector('h3');
        const badgeElement = card.querySelector('.stat-badge span');
        
        if (!titleElement) return;

        // Get the actual card title from HTML
        const cardTitle = titleElement.textContent.trim();
        console.log(`Checking card: "${cardTitle}"`);
        
        // Check if this card title is in our selection map
        if (selectionMap.has(cardTitle)) {
            // SHOW: Ensure the card is visible
            card.style.display = 'block';
            visibleCount++;
            
            // UPDATE: Fill the badge with the quantity
            if (badgeElement) {
                const quantity = selectionMap.get(cardTitle);
                badgeElement.textContent = quantity;
                console.log(`  ✓ Updated "${cardTitle}" badge to: ${quantity}`);
            }
        } else {
            // HIDE: If not selected in the maker, hide the card completely
            card.style.display = 'none';
            console.log(`  ✗ HIDING "${cardTitle}" (not in selected items)`);
        }
    });
    
    console.log(`Total visible programs: ${visibleCount} out of ${cards.length}`);
}


// ==================== FACILITIES SECTION - Uses selectedSkills (check only) ====================
function initializeFacilitiesSection() {
    const facilitiesData = getFacilitiesData();
    const facilityCards = document.querySelectorAll('.facility-card');
    
    // Default facility data
    const defaultFacilities = [
        { name: "Modern Classrooms", icon: "school", description: "Spacious, well-lit classrooms equipped with interactive whiteboards and comfortable seating." },
        { name: "High-Speed Internet", icon: "wifi", description: "Campus-wide WiFi connectivity ensuring students and teachers have access to digital resources." },
        { name: "Science Laboratories", icon: "flask-conical", description: "Fully equipped physics, chemistry, and biology labs for hands-on experimental learning." },
        { name: "Computer Labs", icon: "monitor", description: "State-of-the-art computer labs with modern hardware for STEM and digital literacy." },
        { name: "Library & Media Center", icon: "book-open", description: "A vast collection of books, journals, and digital resources to support research." },
        { name: "Cafeteria", icon: "utensils", description: "Nutritious meal options prepared daily in our hygienic cafeteria." },
        { name: "Transportation", icon: "bus", description: "Safe and reliable school bus services covering major routes." },
        { name: "Security & Safety", icon: "shield-check", description: "24/7 security personnel, CCTV, and strict safety protocols." }
    ];
    
    // Hide all facility cards initially
    facilityCards.forEach(card => {
        card.style.display = "none";
    });
    
    // If we have selected skills, show only those facilities
    if (facilitiesData && facilitiesData.selectedSkills && facilitiesData.selectedSkills.length > 0) {
        const selectedSkills = facilitiesData.selectedSkills;
        
        facilityCards.forEach((card, index) => {
            if (index < defaultFacilities.length) {
                const facilityName = defaultFacilities[index].name;
                if (selectedSkills.includes(facilityName)) {
                    card.style.display = "block";
                    
                    // Update the card content
                    const h3 = card.querySelector('h3');
                    const p = card.querySelector('p');
                    const iconBox = card.querySelector('.icon-box i');
                    
                    if (h3) h3.textContent = facilityName;
                    if (p) p.textContent = defaultFacilities[index].description;
                }
            }
        });
    } else {
        // Show first 4 default facilities if no data
        for (let i = 0; i < Math.min(4, facilityCards.length); i++) {
            if (facilityCards[i]) {
                facilityCards[i].style.display = "block";
            }
        }
    }
}

async function initializeGallerySection() {
    const galleryItemsData = [];
    
    if (galleryImages && galleryImages.length > 0) {
        for (const img of galleryImages) {
            if (img.src && img.src.startsWith('data:')) {
                galleryItemsData.push({
                    label: img.label || "Gallery Image",
                    category: img.category || "Gallery",
                    img: img.src
                });
            }
        }
    }
    
    if (galleryItemsData.length === 0 && currentProjectData && currentProjectData.images && Array.isArray(currentProjectData.images)) {
        for (const img of currentProjectData.images) {
            if (img.src && img.src.startsWith('data:')) {
                galleryItemsData.push({
                    label: img.label || `Image ${img.slot || 'Gallery'}`,
                    category: img.category || "Gallery",
                    img: img.src
                });
            }
        }
    }
    
    const fallbackGallery = [
        { label: "Science Laboratory", category: "Facilities", img: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80" },
        { label: "Computer Lab", category: "Facilities", img: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&q=80" },
        { label: "Library", category: "Facilities", img: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=80" },
    ];
    
    const finalGallery = galleryItemsData.length > 0 ? galleryItemsData : fallbackGallery;
    const categories = ["All", ...new Set(finalGallery.map(i => i.category).filter(c => c))];
    let currentFiltered = [...finalGallery];
    let currentIndex = 0;
    
    const grid = document.getElementById('gallery-grid');
    const filterBar = document.getElementById('filter-bar');
    const lightbox = document.getElementById('lightbox');
    
    if (!grid) return;
    
    function renderFilters() {
        if (!filterBar) return;
        filterBar.innerHTML = '';
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = `filter-btn ${cat === "All" ? 'active' : ''}`;
            btn.innerText = cat;
            btn.onclick = () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderGallery(cat);
            };
            filterBar.appendChild(btn);
        });
    }
    
    function renderGallery(category) {
        if (!grid) return;
        grid.innerHTML = "";
        currentFiltered = category === "All" ? finalGallery : finalGallery.filter(i => i.category === category);
        
        currentFiltered.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = "gallery-item reveal";
            div.innerHTML = `
                <img src="${item.img}" alt="${escapeHtml(item.label)}">
                <div class="item-overlay">
                    <span class="cat">${escapeHtml(item.category)}</span>
                    <span class="title">${escapeHtml(item.label)}</span>
                </div>
            `;
            div.onclick = () => openLightbox(index);
            grid.appendChild(div);
        });
        initializeScrollReveal();
    }
    
    function setupLightbox() {
        if (!lightbox) return;
        const closeBtn = document.getElementById('close-lightbox');
        const nextBtn = document.getElementById('next-btn');
        const prevBtn = document.getElementById('prev-btn');
        
        if (closeBtn) closeBtn.onclick = () => lightbox.classList.remove('active');
        if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); navigate(1); };
        if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); navigate(-1); };
        lightbox.onclick = () => lightbox.classList.remove('active');
    }
    
    function openLightbox(index) {
        currentIndex = index;
        updateLightbox();
        if (lightbox) lightbox.classList.add('active');
    }
    
    function navigate(dir) {
        currentIndex = (currentIndex + dir + currentFiltered.length) % currentFiltered.length;
        updateLightbox();
    }
    
    function updateLightbox() {
        const item = currentFiltered[currentIndex];
        const lightboxImg = document.getElementById('lightbox-img');
        const lightboxLabel = document.getElementById('lightbox-label');
        const lightboxCat = document.getElementById('lightbox-cat');
        
        if (lightboxImg) lightboxImg.src = item.img;
        if (lightboxLabel) lightboxLabel.innerText = item.label;
        if (lightboxCat) lightboxCat.innerText = item.category;
    }
    
    renderFilters();
    renderGallery("All");
    setupLightbox();
}

function initializeTeachersSection() {
    const teacherCardsData = getTeacherCardsData();
    const grid = document.querySelector('.teachers-grid');
    
    if (!grid) return;
    grid.innerHTML = '';
    
    const teacherCount = teacherCardsData ? teacherCardsData.length : 6;
    const subjectCount = teacherCardsData ? new Set(teacherCardsData.map(t => t.subject).filter(Boolean)).size : 12;
    const avgYears = teacherCardsData ? Math.round(teacherCardsData.reduce((sum, t) => sum + (parseInt(t.years) || 0), 0) / teacherCardsData.length) : 8;
    const avgRating = teacherCardsData ? (teacherCardsData.reduce((sum, t) => sum + (parseInt(t.rating) || 0), 0) / teacherCardsData.length).toFixed(1) : 4.7;
    const about_expert = document.querySelector(".highlight-val span");
    
    const statRow = document.querySelector('.stats-row');
    if (statRow) {
        const statValues = statRow.querySelectorAll('.stat-value');
        if (statValues.length >= 4) {
            if (statValues[0]) statValues[0].textContent = `${teacherCount}+`;
            if (statValues[1]) statValues[1].textContent = `${subjectCount}+`;
            if (statValues[2]) statValues[2].textContent = `${avgYears} Yrs`;
            if (statValues[3]) statValues[3].textContent = `${avgRating}/5`;
        }
    }

    about_expert.textContent = subjectCount;
    
    const defaultTeachers = [
        { name: "Mr. Kebede Tadesse", role: "Head of Mathematics", subject: "Mathematics", years: "15", img: "https://i.pravatar.cc/300?u=teacher1", quote: "Every student has the potential to excel in mathematics with the right guidance.", rating: 5 },
        { name: "Ms. Yeshimebet Hailu", role: "Head of English", subject: "English Literature", years: "12", img: "https://i.pravatar.cc/300?u=teacher2", quote: "Literature opens doors to new worlds and perspectives for our students.", rating: 5 },
        { name: "Mr. Demerew Asefa", role: "Head of Administration", subject: "Administration", years: "20", img: "https://i.pravatar.cc/300?u=teacher3", quote: "Our mission is to create an environment where every student thrives.", rating: 5 },
    ];
    
    const teachersToUse = teacherCardsData || defaultTeachers;
    
    teachersToUse.forEach((t, i) => {
        const card = document.createElement('div');
        card.className = 'teacher-card';
        card.style.transitionDelay = `${(i % 3) * 150}ms`;
        
        const experience = t.years ? `${t.years}+ years` : (t.experience || "10+ years");
        const rating = parseInt(t.rating) || 5;
        const teacherName = t.name || t.fullname || "Educator";
        const teacherRole = t.role || "Teacher";
        const teacherSubject = t.subject || "Education";
        const teacherQuote = t.quote || "Inspiring minds, shaping futures.";
        const teacherImg = t.imageBase64 || t.img || `https://i.pravatar.cc/300?u=teacher${i + 1}`;
        
        card.innerHTML = `
            <div class="image-container">
                <img src="${teacherImg}" alt="${escapeHtml(teacherName)}" class="teacher-img" onerror="this.src='https://i.pravatar.cc/300'">
                <div class="overlay"></div>
                <div class="experience-badge">${escapeHtml(experience)}</div>
                <div class="name-block">
                    <h3>${escapeHtml(teacherName)}</h3>
                    <p>${escapeHtml(teacherRole)}</p>
                </div>
            </div>
            <div class="info-content">
                <div class="subject-row">
                    <i data-lucide="book-open" style="width:16px; height:16px;"></i>
                    <span>${escapeHtml(teacherSubject)}</span>
                </div>
                <p class="quote">"${escapeHtml(teacherQuote)}"</p>
                <div class="stars">
                    ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    if (window.lucide) setTimeout(() => lucide.createIcons(), 50);
}

function initializeTestimonialsSection() {
    const testimonialsData = getTestimonialsData();
    const container = document.getElementById('testimonials-container');
    const dotsContainer = document.getElementById('dots-container');
    const sliderWrapper = document.getElementById('slider-wrapper');
    
    if (!container) return;
    
    const defaultTestimonials = [
        { name: "Adonyas Berhanu", role: "12th Grade Student", text: "The STEM program here transformed how I view engineering. The facilities are top-notch!", rating: 5 },
        { name: "Mr. Kebede Tadesse", role: "Deputy President", text: "Teaching here is a joy because the students are genuinely curious and driven to succeed.", rating: 5 },
        { name: "Ms. Melkam Ayele", role: "Class President", text: "Our student council has been able to implement real changes thanks to the staff.", rating: 5 },
    ];
    
    const testimonialsToUse = testimonialsData || defaultTestimonials;
    let currentPage = 0;
    let perPage = 3;
    let autoplayInterval;
    
    function updatePerPage() {
        const width = window.innerWidth;
        if (width < 768) perPage = 1;
        else if (width < 1024) perPage = 2;
        else perPage = 3;
        render();
    }
    
    function render() {
        const maxPage = Math.ceil(testimonialsToUse.length / perPage);
        if (currentPage >= maxPage) currentPage = 0;
        if (currentPage < 0) currentPage = maxPage - 1;
        if (maxPage === 0) return;
        
        container.style.opacity = '0';
        setTimeout(() => {
            container.innerHTML = "";
            const start = currentPage * perPage;
            const visible = testimonialsToUse.slice(start, start + perPage);
            
            visible.forEach(t => {
                const initials = t.name.split(" ").map(n => n[0]).join("").slice(0, 2);
                const rating = t.rating || 5;
                const stars = Array.from({ length: 5 }, (_, i) => 
                    `<i data-lucide="star" style="fill: ${i < rating ? '#fbbf24' : 'none'}; stroke: ${i < rating ? '#fbbf24' : '#d1d5db'}; width: 16px; height: 16px;"></i>`
                ).join("");
                
                container.innerHTML += `
                    <div class="testimonial-card">
                        <div class="stars">${stars}</div>
                        <div class="quote-content">
                            <i data-lucide="quote" class="quote-icon"></i>
                            <p class="testimonial-text">"${escapeHtml(t.text)}"</p>
                        </div>
                        <div class="author-info">
                            <div class="avatar">${escapeHtml(initials)}</div>
                            <div>
                                <p class="author-name">${escapeHtml(t.name)}</p>
                                <p class="author-role">${escapeHtml(t.role)}</p>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            if (window.lucide) lucide.createIcons();
            container.style.opacity = '1';
        }, 200);
        
        if (dotsContainer) {
            dotsContainer.innerHTML = "";
            for (let i = 0; i < maxPage; i++) {
                const dot = document.createElement('button');
                dot.className = `dot ${i === currentPage ? 'active' : ''}`;
                dot.onclick = () => { currentPage = i; resetAutoplay(); render(); };
                dotsContainer.appendChild(dot);
            }
        }
    }
    
    function next() { currentPage++; render(); }
    function prev() { currentPage--; render(); }
    function startAutoplay() { stopAutoplay(); autoplayInterval = setInterval(next, 5000); }
    function stopAutoplay() { clearInterval(autoplayInterval); }
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }
    
    const nextBtn = document.getElementById('next-test-btn');
    const prevBtn = document.getElementById('prev-test-btn');
    
    if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });
    if (sliderWrapper) {
        sliderWrapper.onmouseenter = stopAutoplay;
        sliderWrapper.onmouseleave = startAutoplay;
    }
    
    window.addEventListener('resize', updatePerPage);
    updatePerPage();
    startAutoplay();
}

function initializeEventsSection() {
    const defaultEvents = [
        { title: "Annual Science Fair 2026", date: "April 15, 2026", time: "9:00 AM - 4:00 PM", location: "Main Campus", desc: "Students showcase their innovative science projects and compete for top honors.", tag: "Academics", hex: "#3b82f6" },
        { title: "Sports Championship", date: "May 5-7, 2026", time: "8:00 AM - 6:00 PM", location: "Sports Complex", desc: "Inter-branch sports competition featuring basketball, soccer, and athletics.", tag: "Sports", hex: "#10b981" },
        { title: "Parent-Teacher Conference", date: "May 20, 2026", time: "2:00 PM - 6:00 PM", location: "All Branches", desc: "Meet with teachers to discuss your child's academic progress.", tag: "Community", hex: "#f59e0b" },
    ];
    
    const grid = document.getElementById('events-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    defaultEvents.forEach((e, i) => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.style.transitionDelay = `${i * 100}ms`;
        
        card.innerHTML = `
            <div class="color-bar" style="background-color: ${e.hex}"></div>
            <div class="card-body">
                <div class="card-top">
                    <span class="event-tag" style="background-color: ${e.hex}">${escapeHtml(e.tag)}</span>
                    <i data-lucide="calendar" style="width: 20px; color: var(--muted-foreground)"></i>
                </div>
                <h3>${escapeHtml(e.title)}</h3>
                <p class="event-desc">${escapeHtml(e.desc)}</p>
                <div class="event-meta">
                    <div class="meta-item"><i data-lucide="calendar"></i> <span>${escapeHtml(e.date)}</span></div>
                    <div class="meta-item"><i data-lucide="clock"></i> <span>${escapeHtml(e.time)}</span></div>
                    <div class="meta-item"><i data-lucide="map-pin"></i> <span>${escapeHtml(e.location)}</span></div>
                </div>
                <div class="learn-more">
                    Learn More <i data-lucide="arrow-right" style="width: 16px"></i>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
    
    if (window.lucide) setTimeout(() => lucide.createIcons(), 50);
}

// ==================== FAQ SECTION - Loads from project data ====================
function initializeFaqSection() {
    const faqsData = getFaqsData();
    const faqList = document.getElementById('faq-list');
    
    if (!faqList) return;
    faqList.innerHTML = '';
    
    // Default FAQs if no data from maker
    const defaultFaqs = [
        { question: "What grade levels does EB Academy offer?", answer: "EB Academy provides education from Pre-Primary (KG) through 12th Grade across our branches." },
        { question: "How can I enroll my child at EB Academy?", answer: "Visit any of our branches or contact us through our website. Fill out a registration form and schedule an assessment." },
        { question: "What extracurricular activities are available?", answer: "We offer over 45 student clubs including sports, arts, STEM programs, language clubs, and leadership development." },
        { question: "Are there scholarship opportunities?", answer: "Yes, we offer merit-based and need-based scholarships. Contact our admissions office for details." },
    ];
    
    // Check if we have FAQs from the maker page
    let faqsToUse = defaultFaqs;
    
    if (faqsData && faqsData.length > 0) {
        // Map the FAQ data structure from maker page (question/answer)
        faqsToUse = faqsData.map(faq => ({
            question: faq.question || faq.q,
            answer: faq.answer || faq.a
        }));
        console.log(`Loaded ${faqsToUse.length} FAQs from project data`);
    }
    
    faqsToUse.forEach((faq) => {
        const item = document.createElement('div');
        item.className = 'faq-item';
        
        item.innerHTML = `
            <button class="faq-trigger">
                <span class="faq-question">${escapeHtml(faq.question)}</span>
                <i data-lucide="chevron-down" class="faq-chevron"></i>
            </button>
            <div class="faq-content">
                <div class="faq-inner">
                    ${escapeHtml(faq.answer)}
                </div>
            </div>
        `;
        
        const trigger = item.querySelector('.faq-trigger');
        const content = item.querySelector('.faq-content');
        
        if (trigger) {
            trigger.onclick = () => {
                const isActive = item.classList.contains('active');
                document.querySelectorAll('.faq-item').forEach(el => {
                    el.classList.remove('active');
                    const elContent = el.querySelector('.faq-content');
                    if (elContent) elContent.style.maxHeight = null;
                });
                
                if (!isActive) {
                    item.classList.add('active');
                    if (content) content.style.maxHeight = content.scrollHeight + "px";
                }
            };
        }
        
        faqList.appendChild(item);
    });
    
    if (window.lucide) setTimeout(() => lucide.createIcons(), 50);
}

function initializeNewsletterSection() {
    const form = document.getElementById('newsletter-form');
    const formContainer = document.getElementById('newsletter-form-container');
    const successMessage = document.getElementById('newsletter-success');
    const emailInput = document.getElementById('newsletter-email');
    
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            const email = emailInput?.value;
            
            if (email && formContainer && successMessage) {
                formContainer.classList.add('hidden');
                successMessage.classList.remove('hidden');
                
                setTimeout(() => {
                    successMessage.classList.add('hidden');
                    formContainer.classList.remove('hidden');
                    if (emailInput) emailInput.value = "";
                }, 4000);
            }
        };
    }
}

function initializeFooterSection() {
    const branchesData = getBranchesData();
    const schoolName = getProjectValue("form-name", "EB Academy");
    const schoolEmail = getProjectValue("form-email", "info@ebacademy.com");
    const footerText = getProjectValue("form-footer", "Excellence in education. Nurturing minds, shaping futures.");
    const footer_para = document.querySelector(".brand-desc");

    // Get social media links from project data
    const youtubeLink = getProjectValue("form-youtube", "");
    const linkedinLink = getProjectValue("form-linkedin", "");
    const instagramLink = getProjectValue("form-instagram", "");
    const facebookLink = getProjectValue("form-facebook", "");

    const copyright = document.querySelector('.copyright');
    if (copyright && footerText) {
        copyright.textContent = `© ${new Date().getFullYear()} ${schoolName}. All Rights Reserved.`;
    }

    if (footer_para) {
        footer_para.textContent = footerText;
    }
    
    const emailSpan = document.querySelector('.contact-list li:first-child span');
    if (emailSpan && schoolEmail) {
        emailSpan.textContent = schoolEmail;
    }
    
    const branchUl = document.getElementById('branches-list');
    const footer_info = document.querySelectorAll('.contact-list li span');
    if (branchUl) {
        if (branchesData && branchesData.length > 0) {
            branchUl.innerHTML = '';
            branchesData.forEach((branch, index) => {
                const locationText = `Near to ${branch.name || "Branch Location"}`;
                if (footer_info.length >= 2 && branch.phone) {
                    footer_info[1].textContent = `0${branch.phone}`;
                }
                // Create the list item with icon
                const li = document.createElement('li');
                li.setAttribute('data-branch-index', index);
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.gap = '8px';
                li.style.cursor = 'pointer';
                
                // Create icon
                const icon = document.createElement('i');
                icon.className = 'fas fa-map-marker-alt location-marker-icon';
                icon.style.cursor = 'pointer';
                icon.style.transition = 'all 0.3s ease';
                icon.style.color = 'var(--primary)';
                
                // Add hover effects
                icon.addEventListener('mouseenter', () => {
                    icon.style.transform = 'scale(1.2)';
                    icon.style.color = '#ffd700';
                });
                icon.addEventListener('mouseleave', () => {
                    icon.style.transform = 'scale(1)';
                    icon.style.color = 'var(--primary)';
                });
                
                // Add click handler for map
                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(`Opening map for branch: ${branch.name || branch.location}`);
                    openBranchMap(branch);
                });
                
                // Create span for text
                const span = document.createElement('span');
                span.textContent = escapeHtml(locationText);
                
                // Assemble
                li.appendChild(icon);
                li.appendChild(span);
                
                // Make the whole list item clickable too
                li.addEventListener('click', () => {
                    openBranchMap(branch);
                });
                
                branchUl.appendChild(li);
            });
        } else {
            const defaultBranches = ["Gulele Campus", "Arada Campus", "Bole Campus"];
            defaultBranches.forEach((branch, idx) => {
                const li = document.createElement('li');
                li.setAttribute('data-branch-index', idx);
                li.style.display = 'flex';
                li.style.alignItems = 'center';
                li.style.gap = '8px';
                li.style.cursor = 'pointer';
                
                const icon = document.createElement('i');
                icon.className = 'fas fa-map-marker-alt location-marker-icon';
                icon.style.cursor = 'pointer';
                icon.style.transition = 'all 0.3s ease';
                icon.style.color = 'var(--primary)';
                
                icon.addEventListener('mouseenter', () => {
                    icon.style.transform = 'scale(1.2)';
                    icon.style.color = '#ffd700';
                });
                icon.addEventListener('mouseleave', () => {
                    icon.style.transform = 'scale(1)';
                    icon.style.color = 'var(--primary)';
                });
                
                // Create a branch object for default branches
                const defaultBranch = { name: branch, location: branch };
                
                icon.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openBranchMap(defaultBranch);
                });
                
                const span = document.createElement('span');
                span.textContent = escapeHtml(branch);
                
                li.appendChild(icon);
                li.appendChild(span);
                
                li.addEventListener('click', () => {
                    openBranchMap(defaultBranch);
                });
                
                branchUl.appendChild(li);
            });
        }
    }
    
    // Telegram channels
    const telegramChannels = branchesData?.map(b => b.telegram).filter(t => t) || ["1-6 Gulele", "1-8 Gulele", "9-12 Arada"];
    const telegramUl = document.getElementById('telegram-list');
    if (telegramUl) {
        telegramUl.innerHTML = '';
        telegramChannels.slice(0, 3).forEach(c => {
            telegramUl.innerHTML += `<li><i data-lucide="send" style="width:12px; color:var(--primary)"></i> <span>${escapeHtml(c)}</span></li>`;
        });
    }
    
    // Quick links
    const quickLinks = [
        { label: "About Us", href: "#about" },
        { label: "Services", href: "#services" },
        { label: "Gallery", href: "#gallery" },
        { label: "Testimonials", href: "#testimonials" },
        { label: "Contact", href: "#contact" },
    ];
    
    const linksUl = document.getElementById('quick-links');
    if (linksUl) {
        linksUl.innerHTML = '';
        quickLinks.forEach(link => {
            linksUl.innerHTML += `<li><a href="${link.href}, '_blank'"><i data-lucide="arrow-right" style="width:12px"></i> ${escapeHtml(link.label)}</a></li>`;
        });
    }
    
    // ==================== SOCIAL LINKS WITH URLS FROM DEXIE ====================
    const socialDiv = document.getElementById('social-links');
    if (socialDiv) {
        socialDiv.innerHTML = '';
        
        // Define social media platforms with their Font Awesome icons and default URLs
        const socialPlatforms = [
            { 
                name: "facebook", 
                icon: "fab fa-facebook-f", 
                url: facebookLink,
                defaultUrl: "https://facebook.com",
                color: "#1877f2"
            },
            { 
                name: "instagram", 
                icon: "fab fa-instagram", 
                url: instagramLink,
                defaultUrl: "https://instagram.com",
                color: "#e4405f"
            },
            { 
                name: "linkedin", 
                icon: "fab fa-linkedin-in", 
                url: linkedinLink,
                defaultUrl: "https://linkedin.com",
                color: "#0077b5"
            },
            { 
                name: "youtube", 
                icon: "fab fa-youtube", 
                url: youtubeLink,
                defaultUrl: "https://youtube.com",
                color: "#ff0000"
            }
        ];
        
        // Filter out platforms with valid URLs (non-empty) or use defaults
        socialPlatforms.forEach(platform => {
            // Use the URL from Dexie if available, otherwise skip (or use default)
            const finalUrl = platform.url && platform.url.trim() !== "" 
                ? platform.url 
                : null; // Don't show if no URL is provided
            
            // Only show the social link if a URL is provided
            if (finalUrl) {
                const socialLink = document.createElement('a');
                socialLink.href = finalUrl;
                socialLink.className = 'social-icon';
                socialLink.target = '_blank';
                socialLink.rel = 'noopener noreferrer';
                socialLink.title = `${platform.name.charAt(0).toUpperCase() + platform.name.slice(1)}`;
                socialLink.style.backgroundColor = 'rgba(255,255,255,0.1)';
                socialLink.style.borderRadius = '50%';
                socialLink.style.width = '36px';
                socialLink.style.height = '36px';
                socialLink.style.display = 'inline-flex';
                socialLink.style.alignItems = 'center';
                socialLink.style.justifyContent = 'center';
                socialLink.style.transition = 'all 0.3s ease';
                
                // Add hover effect
                socialLink.addEventListener('mouseenter', () => {
                    socialLink.style.backgroundColor = platform.color;
                    socialLink.style.transform = 'translateY(-3px)';
                });
                socialLink.addEventListener('mouseleave', () => {
                    socialLink.style.backgroundColor = 'rgba(255,255,255,0.1)';
                    socialLink.style.transform = 'translateY(0)';
                });
                
                // Create icon element
                const icon = document.createElement('i');
                icon.className = platform.icon;
                icon.style.fontSize = '16px';
                icon.style.color = 'white';
                
                socialLink.appendChild(icon);
                socialDiv.appendChild(socialLink);
            }
        });
        
        // If no social links have URLs, show a message or keep empty
        if (socialDiv.children.length === 0) {
            console.log("No social media URLs provided in project data");
        }
    }
    
    if (window.lucide) setTimeout(() => lucide.createIcons(), 50);
}

function initializeAuthSystem() {
    const auth = getAuth();
    
    onAuthStateChanged(auth, (user) => {
        const loggedInUI = document.getElementById('loggedInUI');
        const loggedOutUI = document.getElementById('loggedOutUI');
        
        if (user) {
            if (loggedInUI) loggedInUI.classList.remove('hidden');
            if (loggedOutUI) loggedOutUI.classList.add('hidden');
            
            const userNameSpan = document.getElementById('userName');
            const userEmailSpan = document.getElementById('userEmail');
            const userAvatar = document.getElementById('userAvatar');
            
            if (userNameSpan) userNameSpan.textContent = user.displayName || 'Student';
            if (userEmailSpan) userEmailSpan.textContent = user.email;
            if (userAvatar) userAvatar.src = `https://ui-avatars.com/api/?name=${user.email}&background=009fee&color=fff`;
            
            toggleSignInModal(false);
        } else {
            if (loggedInUI) loggedInUI.classList.add('hidden');
            if (loggedOutUI) loggedOutUI.classList.remove('hidden');
        }
        if (window.lucide) lucide.createIcons();
    });
    
    function showErrorMessage(message) {
        const toast = document.getElementById('errorToast');
        const msgSpan = document.getElementById('errorMessage');
        if (msgSpan) msgSpan.textContent = message;
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 5000);
        }
    }
    
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
        signInForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail')?.value;
            const pass = document.getElementById('loginPassword')?.value;
            
            if (email && pass) {
                signInWithEmailAndPassword(auth, email, pass)
                    .then(() => {
                        if (e.target) e.target.reset();
                    })
                    .catch(error => {
                        let friendlyMsg = "Failed to sign in. Please check your credentials.";
                        if (error.code === 'auth/invalid-credential') friendlyMsg = "Incorrect email or password.";
                        if (error.code === 'auth/too-many-requests') friendlyMsg = "Too many attempts. Try again later.";
                        showErrorMessage(friendlyMsg);
                    });
            }
        });
    }
    
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('regName')?.value;
            const email = document.getElementById('regEmail')?.value;
            const pass = document.getElementById('regPassword')?.value;
            
            if (name && email && pass) {
                createUserWithEmailAndPassword(auth, email, pass)
                    .then((userCredential) => {
                        return updateProfile(userCredential.user, { displayName: name });
                    })
                    .then(() => {
                        toggleSignInModal(false);
                        if (e.target) e.target.reset();
                    })
                    .catch(error => {
                        let friendlyMsg = "Registration failed. Please try again.";
                        if (error.code === 'auth/email-already-in-use') friendlyMsg = "This email is already registered.";
                        if (error.code === 'auth/weak-password') friendlyMsg = "Password must be at least 6 characters.";
                        showErrorMessage(friendlyMsg);
                    });
            }
        });
    }
    
    window.toggleSignInModal = (show) => {
        const modal = document.getElementById('signInModal');
        if (modal) {
            modal.classList.toggle('active', show);
            document.body.style.overflow = show ? 'hidden' : '';
            if (show) switchAuthMode('signin');
        }
    };
    
    window.switchAuthMode = (mode) => {
        const signIn = document.getElementById('signInContainer');
        const signUp = document.getElementById('signUpContainer');
        
        if (signIn && signUp) {
            if (mode === 'signup') {
                signIn.classList.add('hidden');
                signUp.classList.remove('hidden');
            } else {
                signIn.classList.remove('hidden');
                signUp.classList.add('hidden');
            }
        }
        if (window.lucide) lucide.createIcons();
    };
    
    const profileTrigger = document.getElementById('profileTrigger');
    if (profileTrigger) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('profileDropdown');
            if (dropdown) dropdown.classList.toggle('active');
        });
    }
    
    window.handleLogout = () => {
        signOut(auth).then(() => {
            const dropdown = document.getElementById('profileDropdown');
            if (dropdown) dropdown.classList.remove('active');
        });
    };
    
    window.addEventListener('click', () => {
        const dropdown = document.getElementById('profileDropdown');
        if (dropdown) dropdown.classList.remove('active');
    });
}

function initializeScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transition = 'all 0.8s ease-out';
        
        if (el.classList.contains('reveal-left')) {
            el.style.transform = 'translateX(-50px)';
        } else if (el.classList.contains('reveal-right')) {
            el.style.transform = 'translateX(50px)';
        } else {
            el.style.transform = 'translateY(30px)';
        }
        
        observer.observe(el);
    });
    
    if (!document.querySelector('#reveal-styles')) {
        const style = document.createElement('style');
        style.id = 'reveal-styles';
        style.textContent = `
            .reveal.active, .reveal-left.active, .reveal-right.active {
                opacity: 1 !important;
                transform: translate(0, 0) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

if (window.lucide) {
    setTimeout(() => lucide.createIcons(), 100);
}

const CREDENTIALS = {
        Student: [
            { name: "student1", passkey: "student123" },
            { name: "alex_j", passkey: "learn2026" },
            { name: "mariam_e", passkey: "ebstudent" }
        ],
        Teacher: [
            { name: "teacher1", passkey: "teacher123" },
            { name: "prof_james", passkey: "teach@eb" },
            { name: "ms_helen", passkey: "classroom22" }
        ],
        Admin: [
            { name: "admin1", passkey: "admin123" },
            { name: "superadmin", passkey: "eb_admin_2026" },
            { name: "director_eb", passkey: "direct0r#" }
        ],
        Parent: [
            { name: "parent1", passkey: "parent123" },
            { name: "fatima_ali", passkey: "kids2026" },
            { name: "girma_t", passkey: "ebparent" }
        ]
    };

    // Role-specific redirect URLs (simulated dashboard pages)
    // In a real environment you would redirect to actual dashboards,
    // but for this self-contained file we show an alert + simulation.
    // You can modify redirects to actual subfolders if needed.
    const REDIRECT_MAP = {
        Student: "student_dashboard.html",
        Teacher: "teacher_panel.html",
        Admin: "admin_console.html",
        Parent: "parent_portal.html"
    };

    // Guest links for Student & Teacher (similar to original)
    const GUEST_ACTIONS = {
        Student: { text: "📝 New Student Registration", link: "#", action: "studentRegistration" },
        Teacher: { text: "📄 Teacher Application", link: "#", action: "teacherApplication" }
    };

    let currentRole = "";
    let currentGuestDiv = null;

    // Open modal with role context
    window.openPortal = (role) => {
        currentRole = role;
        const modal = document.getElementById('loginModal');
        const modalTitle = document.getElementById('modalTitle');
        const roleBadge = document.getElementById('roleBadge');
        const guestArea = document.getElementById('guestActionArea');
        const guestBtn = document.getElementById('guestBtnDynamic');

        // Reset fields
        document.getElementById('usernameInput').value = "";
        document.getElementById('passkeyInput').value = "";
        
        // Update UI
        modalTitle.innerText = `${role} Portal`;
        roleBadge.innerHTML = `🔑 Role: ${role}`;
        
        // Show guest action only for Student & Teacher (same as original)
        if (role === 'Student' || role === 'Teacher') {
            const guestInfo = GUEST_ACTIONS[role];
            guestBtn.innerText = guestInfo.text;
            guestArea.style.display = "block";
            // store custom action
            guestBtn.onclick = () => handleGuestAction(role);
        } else {
            guestArea.style.display = "none";
        }
        
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    };

    window.closeModal = () => {
        document.getElementById('loginModal').style.display = "none";
        document.body.style.overflow = "auto";
        currentRole = "";
    };

    // Toggle password visibility
    window.togglePasswordVisibility = () => {
        const passInput = document.getElementById('passkeyInput');
        const icon = document.getElementById('togglePassIcon');
        if (passInput.type === 'password') {
            passInput.type = 'text';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        } else {
            passInput.type = 'password';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    };

    // Verify entered name & passkey against role credentials
    window.verifyCredentials = () => {
        const enteredName = document.getElementById('usernameInput').value.trim();
        const enteredPass = document.getElementById('passkeyInput').value.trim();
        
        if (!enteredName || !enteredPass) {
            alert("❌ Please enter both Name and Passkey.");
            return;
        }
        
        const roleCreds = CREDENTIALS[currentRole];
        if (!roleCreds) {
            alert("Invalid role selected.");
            closeModal();
            return;
        }
        
        // check for match (case-sensitive but can be case-insensitive if needed)
        const isValid = roleCreds.some(cred => 
            cred.name.toLowerCase() === enteredName.toLowerCase() && 
            cred.passkey === enteredPass
        );
        
        if (isValid) {
            showDashboardSimulation(currentRole, enteredName);
            closeModal();
        } else {
            alert("⛔ Access Denied: Invalid credentials for " + currentRole + " role.\n\nHint: Use predefined name & passkey pairs shown in console or below.\n\nStudent: student1 / student123\nTeacher: teacher1 / teacher123\nAdmin: admin1 / admin123\nParent: parent1 / parent123");
        }
    };

    // Function to simulate dashboard (one-file experience)
    function showDashboardSimulation(role, userName) {
        // Remove any existing dashboard overlay
        const existingDash = document.getElementById('simulated-dashboard');
        if(existingDash) existingDash.remove();
        
        const dashDiv = document.createElement('div');
        dashDiv.id = 'simulated-dashboard';
        dashDiv.style.position = 'fixed';
        dashDiv.style.top = '0';
        dashDiv.style.left = '0';
        dashDiv.style.width = '100%';
        dashDiv.style.height = '100%';
        dashDiv.style.backgroundColor = '#f8fafc';
        dashDiv.style.zIndex = '2000';
        dashDiv.style.overflowY = 'auto';
        dashDiv.style.padding = '2rem';
        dashDiv.style.fontFamily = "'Poppins', sans-serif";
        
        // Different content per role
        let roleContent = '';
        if(role === 'Student') {
            roleContent = `
                <div style="max-width:800px; margin:0 auto; background:white; border-radius:36px; padding:2rem; box-shadow:0 20px 35px -12px rgba(0,0,0,0.1);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="color:#0f2b6d;"><i class="fas fa-user-graduate"></i> Student Dashboard</h2>
                        <button id="closeDashboardBtn" style="background:#ef4444; border:none; padding:8px 18px; border-radius:40px; color:white; cursor:pointer;">Exit Portal</button>
                    </div>
                    <div style="margin: 1.5rem 0; border-bottom:2px solid #e2e8f0;"></div>
                    <p><strong>Welcome back, ${userName}!</strong> (Role: Student)</p>
                    <div class="dashboard-cards" style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-top:1.5rem;">
                        <div style="background:#eef2ff; padding:1rem; border-radius:24px;"><i class="fas fa-chart-line"></i> <strong>Grades:</strong> A- (Math), B+ (Science)</div>
                        <div style="background:#eef2ff; padding:1rem; border-radius:24px;"><i class="fas fa-calendar-alt"></i> <strong>Upcoming:</strong> Exam on May 20</div>
                        <div style="background:#eef2ff; padding:1rem; border-radius:24px;"><i class="fas fa-tasks"></i> <strong>Assignments:</strong> 2 pending</div>
                    </div>
                    <p style="margin-top: 1rem;"><i class="fas fa-check-circle" style="color:#10b981;"></i> Secure portal access granted via EB Academy.</p>
                </div>
            `;
        } else if(role === 'Teacher') {
            roleContent = `
                <div style="max-width:800px; margin:0 auto; background:white; border-radius:36px; padding:2rem; box-shadow:0 20px 35px -12px rgba(0,0,0,0.1);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="color:#0f2b6d;"><i class="fas fa-chalkboard-user"></i> Teacher Workspace</h2>
                        <button id="closeDashboardBtn" style="background:#ef4444; border:none; padding:8px 18px; border-radius:40px; color:white; cursor:pointer;">Exit Portal</button>
                    </div>
                    <div style="margin: 1.5rem 0; border-bottom:2px solid #e2e8f0;"></div>
                    <p><strong>Hello, Teacher ${userName}</strong> — Manage classes, assignments & feedback.</p>
                    <div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin-top:1.5rem;">
                        <div style="background:#f1f5f9; padding:1rem; border-radius:20px;"><i class="fas fa-users"></i> 3 Active Classes</div>
                        <div style="background:#f1f5f9; padding:1rem; border-radius:20px;"><i class="fas fa-file-alt"></i> 12 Submissions pending</div>
                        <div style="background:#f1f5f9; padding:1rem; border-radius:20px;"><i class="fas fa-chalkboard"></i> Schedule: Mon-Wed-Fri</div>
                    </div>
                </div>
            `;
        } else if(role === 'Admin') {
            roleContent = `
                <div style="max-width:800px; margin:0 auto; background:white; border-radius:36px; padding:2rem; box-shadow:0 20px 35px -12px rgba(0,0,0,0.1);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="color:#0f2b6d;"><i class="fas fa-user-shield"></i> Admin Console</h2>
                        <button id="closeDashboardBtn" style="background:#ef4444; border:none; padding:8px 18px; border-radius:40px; color:white; cursor:pointer;">Exit Portal</button>
                    </div>
                    <div style="margin: 1.5rem 0; border-bottom:2px solid #e2e8f0;"></div>
                    <p><strong>Administrator ${userName}</strong> — Full system oversight.</p>
                    <div style="background:#e6f7ff; border-radius:24px; padding:1.2rem; margin-top:1rem;">
                        <i class="fas fa-chart-pie"></i> System analytics: 1560 students, 87 teachers, 7 branches.<br>
                        <button style="margin-top:12px; background:#0f2b6d; border:none; padding:6px 20px; border-radius:30px; color:white;">Manage Users</button>
                    </div>
                </div>
            `;
        } else { // Parent
            roleContent = `
                <div style="max-width:800px; margin:0 auto; background:white; border-radius:36px; padding:2rem; box-shadow:0 20px 35px -12px rgba(0,0,0,0.1);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h2 style="color:#0f2b6d;"><i class="fas fa-heart"></i> Parent Portal</h2>
                        <button id="closeDashboardBtn" style="background:#ef4444; border:none; padding:8px 18px; border-radius:40px; color:white; cursor:pointer;">Exit Portal</button>
                    </div>
                    <div style="margin: 1.5rem 0; border-bottom:2px solid #e2e8f0;"></div>
                    <p><strong>Welcome, ${userName}</strong> — Monitor your child's progress.</p>
                    <div style="background:#fef9e3; border-radius:24px; padding:1rem;">
                        <p><i class="fas fa-child"></i> Child: Maya S. (Grade 8) | Attendance: 96% | GPA: 3.8</p>
                        <p><i class="fas fa-calendar-week"></i> Next parent-teacher meeting: June 12</p>
                    </div>
                </div>
            `;
        }
        
        dashDiv.innerHTML = roleContent;
        document.body.appendChild(dashDiv);
        document.body.style.overflow = 'hidden';
        
        const closeBtn = document.getElementById('closeDashboardBtn');
        if(closeBtn) {
            closeBtn.addEventListener('click', () => {
                dashDiv.remove();
                document.body.style.overflow = 'auto';
            });
        }
        
        // Click outside overlay to close? optional
        dashDiv.addEventListener('click', (e) => {
            if(e.target === dashDiv) {
                dashDiv.remove();
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Handle guest registration / application links (simulated)
    function handleGuestAction(role) {
        if(role === 'Student') {
            alert("📘 Student Registration Portal (Demo)\n\nIn full version, you would be redirected to registration form.\nFor this standalone demo, registration flow is simulated.");
            // simulate new page or open registration modal
            window.open('#', '_blank');  // just placeholder
        } else if(role === 'Teacher') {
            alert("🍎 Teacher Application (Demo)\n\nSubmit your credentials to join EB Academy. This is a demonstration of the guest feature.");
        }
    }
    
    // Close modal if clicking on backdrop
    document.getElementById('loginModal').addEventListener('click', function(e) {
        if(e.target === this) closeModal();
    });
    
    // Add enter key support in modal inputs
    const usernameField = document.getElementById('usernameInput');
    const passField = document.getElementById('passkeyInput');
    const verifyBtn = document.getElementById('verifyBtn');
    
    function handleEnter(e) {
        if(e.key === 'Enter') {
            e.preventDefault();
            verifyCredentials();
        }
    }
    usernameField.addEventListener('keypress', handleEnter);
    passField.addEventListener('keypress', handleEnter);
    
    // Quick info display in console for convenience
    console.log("✅ EB Academy Portal — Predefined Credentials (name / passkey):");
    console.log("🎓 Student: student1 / student123 , alex_j / learn2026");
    console.log("👩‍🏫 Teacher: teacher1 / teacher123 , prof_james / teach@eb");
    console.log("👑 Admin: admin1 / admin123 , superadmin / eb_admin_2026");
    console.log("👪 Parent: parent1 / parent123 , fatima_ali / kids2026");
    console.log("Use any matching pair for each role.");

    // ==================== MAP FUNCTIONALITY WITH DEXIE DATA ====================

let userLocation = null;
let currentMap = null;
let currentRouteLayer = null;
let alternativeRoutes = [];

// Get user's current location
function getUserLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    userLocation = [position.coords.latitude, position.coords.longitude];
                    resolve(userLocation);
                },
                (error) => {
                    console.warn("Location error:", error);
                    // Fallback to Addis Ababa center
                    userLocation = [9.0320, 38.7469];
                    resolve(userLocation);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        } else {
            userLocation = [9.0320, 38.7469];
            resolve(userLocation);
        }
    });
}

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Geocode address to coordinates (if location is a string)
async function geocodeAddress(address) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        }
    } catch (error) {
        console.error("Geocoding error:", error);
    }
    return null;
}

// Get branch coordinates (handles both string addresses and coordinate objects)
async function getBranchCoordinates(branch) {
    // If branch.location is already an object with lat/lng
    if (branch.location && typeof branch.location === 'object' && branch.location.lat) {
        return [branch.location.lat, branch.location.lng];
    }
    // If branch.location is a string address
    else if (branch.location && typeof branch.location === 'string') {
        const coords = await geocodeAddress(branch.location);
        if (coords) return coords;
    }
    // If branch has direct lat/lng properties
    else if (branch.lat && branch.lng) {
        return [branch.lat, branch.lng];
    }
    // Fallback to default Addis Ababa coordinates
    return [9.0320, 38.7469];
}

// Get route from OSRM (Open Source Routing Machine)
async function getRoute(start, end, map, branchName) {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const distanceKm = (route.distance / 1000).toFixed(2);
            
            // Update distance display
            const distanceEl = document.getElementById('distance');
            const targetNameEl = document.getElementById('targetName');
            if (distanceEl) distanceEl.innerHTML = `${distanceKm} <span style="font-size: 0.8rem;">km</span>`;
            if (targetNameEl) targetNameEl.innerHTML = branchName;
            
            // Draw the route on map
            const points = route.geometry.coordinates.map(p => [p[1], p[0]]);
            
            // Remove existing route layer
            if (currentRouteLayer && map) map.removeLayer(currentRouteLayer);
            
            // Draw shortest path in YELLOW
            currentRouteLayer = L.polyline(points, {
                color: '#ffd700',
                weight: 6,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(map);
            
            // Add glow effect
            L.polyline(points, {
                color: '#ffaa00',
                weight: 12,
                opacity: 0.3,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(map);
            
            // Fit map to route bounds
            if (map && currentRouteLayer.getBounds) {
                map.fitBounds(currentRouteLayer.getBounds(), { padding: [50, 50] });
            }
            
            return distanceKm;
        } else {
            throw new Error("No route found");
        }
    } catch (error) {
        console.error("Routing error:", error);
        // Fallback to straight line distance
        const directDist = calculateDistance(start[0], start[1], end[0], end[1]);
        const distanceEl = document.getElementById('distance');
        if (distanceEl) distanceEl.innerHTML = `${directDist.toFixed(2)} <span style="font-size: 0.8rem;">km (direct)</span>`;
        return directDist;
    }
}

// Get alternative routes (shown in BLUE dashed lines)
async function getAlternativeRoutes(start, end, map) {
    try {
        const altUrl = `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?alternatives=true&overview=simplified&geometries=geojson`;
        const altResp = await fetch(altUrl);
        const altData = await altResp.json();
        
        if (altData.routes && altData.routes.length > 1) {
            // Clear existing alternative routes
            if (alternativeRoutes.length) {
                alternativeRoutes.forEach(route => {
                    if (map) map.removeLayer(route);
                });
                alternativeRoutes = [];
            }
            
            // Draw alternative routes in BLUE
            for (let i = 1; i < Math.min(altData.routes.length, 3); i++) {
                const altRoute = altData.routes[i];
                const altPoints = altRoute.geometry.coordinates.map(p => [p[1], p[0]]);
                const altDistance = (altRoute.distance / 1000).toFixed(1);
                
                const altLine = L.polyline(altPoints, {
                    color: '#3366ff',
                    weight: 4,
                    opacity: 0.6,
                    dashArray: '8, 8'
                }).addTo(map);
                
                altLine.bindPopup(`Alternative route: ${altDistance} km`);
                alternativeRoutes.push(altLine);
            }
        }
    } catch (e) {
        console.log("Alternative routes not available:", e);
    }
}

// Open map for a specific branch (USES DEXIE DATA)
window.openBranchMap = async function(branch) {
    const overlay = document.getElementById('mapOverlay');
    if (!overlay) return;
    
    overlay.classList.add('active');
    
    // Get user location
    await getUserLocation();
    
    // Get branch coordinates
    const branchCoords = await getBranchCoordinates(branch);
    const branchName = branch.name || branch.branchName || "EB Academy Branch";
    
    // Initialize map
    if (currentMap) {
        currentMap.remove();
    }
    
    currentMap = L.map('map').setView(branchCoords, 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(currentMap);
    
    // Destination marker (RED)
    const destinationIcon = L.divIcon({
        className: 'custom-div-icon',
        html: '<div style="background-color: #ff3366; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px #ff3366;"></div>',
        iconSize: [30, 30],
        popupAnchor: [0, -15]
    });
    
    L.marker(branchCoords, { icon: destinationIcon })
        .addTo(currentMap)
        .bindPopup(`<b>${branchName}</b><br>${branch.location || ''}`)
        .openPopup();
    
    // User location marker (GREEN)
    if (userLocation) {
        const userIcon = L.divIcon({
            className: 'custom-div-icon',
            html: '<div style="background-color: #00ff88; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #00ff88;"></div>',
            iconSize: [20, 20]
        });
        
        L.marker(userLocation, { icon: userIcon })
            .addTo(currentMap)
            .bindPopup('<b>You are here</b>');
        
        // Get and draw the route
        await getRoute(userLocation, branchCoords, currentMap, branchName);
        
        // Get alternative routes
        await getAlternativeRoutes(userLocation, branchCoords, currentMap);
    } else {
        const distanceEl = document.getElementById('distance');
        if (distanceEl) distanceEl.innerHTML = 'Location unavailable';
    }
    
    setTimeout(() => {
        if (currentMap) currentMap.invalidateSize();
    }, 200);
};

// Close map overlay
window.closeMap = function() {
    const overlay = document.getElementById('mapOverlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
    // Clean up alternative routes
    if (alternativeRoutes.length) {
        alternativeRoutes.forEach(route => {
            if (currentMap) currentMap.removeLayer(route);
        });
        alternativeRoutes = [];
    }
};

function initializeMapHandlers() {
    const branches = getBranchesData();
    
    if (!branches || branches.length === 0) {
        console.log("No branches data available from Dexie");
        return;
    }
    
    const locationIcons = document.querySelectorAll('#branches-list .fa-map-marker-alt');
    
    if (locationIcons.length === 0) {
        console.log("No location icons found. Retrying...");
        setTimeout(() => initializeMapHandlers(), 500);
        return;
    }
    
    console.log(`Found ${locationIcons.length} location icons`);
    
    locationIcons.forEach((icon, index) => {
        const branch = branches[index];
        if (!branch) return;
        
        const newIcon = icon.cloneNode(true);
        icon.parentNode.replaceChild(newIcon, icon);
        
        newIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Opening map for:", branch.name || branch.location);
            openBranchMap(branch);
        });
    });
}