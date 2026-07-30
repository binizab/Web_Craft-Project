lucide.createIcons();

const db = new Dexie("ProjectEngineDB");
db.version(2).stores({
    projects: '++id, name, category, date',
    gallery: 'slotId',
    shared: 'key'
});

db.version(3).stores({
    projects: '++id, name, category, date',
    gallery: null,
    shared: 'key'
});

db.version(4).stores({
    projects: '++id, name, category, date',
    gallery: '++id, projectId, slotId',
    shared: 'key'
});

// Global Variables
let currentStep = 0;
let activeEditId = null;
const totalSteps = 7;
let galleryData = {};
let saveAttempted = false;
let swiperInstance = null;
const FACULTY_COUNT = 6;

// ==================== UTILITY FUNCTIONS ====================

function refreshLucideIcons() {
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

function sanitizeText(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(match) {
        if (match === '&') return '&amp;';
        if (match === '<') return '&lt;';
        if (match === '>') return '&gt;';
        return match;
    });
}

function showError(inputId, hintId) {
    const el = document.getElementById(inputId);
    const hint = document.getElementById(hintId);
    
    if (el) {
        const trigger = el.classList.contains('calendar-input') || el.classList.contains('select-trigger') 
            ? el : el.querySelector('.select-trigger');
        const target = trigger || el;
        target.classList.remove('shake', 'input-error');
        void target.offsetWidth;
        target.classList.add('input-error', 'shake');
        
        setTimeout(() => {
            target.classList.remove('shake');
        }, 500);
    }
    
    if (hint) {
        hint.style.display = 'flex';
        hint.style.alignItems = 'center';
        hint.style.gap = '5px';
        hint.style.color = 'var(--error)';
        hint.style.fontSize = '0.75rem';
        hint.style.marginTop = '5px';
    }
    return false;
}

function resetValidation() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(el => {
        el.style.borderColor = '';
        el.classList.remove('input-error');
    });
    
    const customElements = document.querySelectorAll('.select-trigger, .calendar-input');
    customElements.forEach(el => {
        el.style.borderColor = 'var(--text-dim)';
        el.classList.remove('shake');
    });
    
    document.querySelectorAll('.error-hint').forEach(h => {
        h.style.display = 'none';
        h.style.color = '';
    });
    
    document.querySelectorAll('.upload-card').forEach(card => {
        card.classList.remove('has-error', 'err-img-missing', 'err-label-missing', 'err-category-missing');
    });
    
    document.querySelectorAll('.field-error').forEach(err => {
        err.classList.remove('has-field-error');
    });
    
    document.querySelectorAll('.profile-card').forEach(card => {
        card.classList.remove('invalid-card');
    });
    
    const errorDiv = document.getElementById('facilityErrors');
    if (errorDiv) errorDiv.style.display = 'none';
}

// ==================== STEP NAVIGATION ====================

function updateStepView() {
    document.querySelectorAll('.step-pane').forEach((pane, idx) => {
        pane.classList.toggle('active', idx === currentStep);
    });
    
    document.querySelectorAll('.step-indicator').forEach((node, idx) => {
        node.classList.remove('active', 'completed');
        if (idx === currentStep) node.classList.add('active');
        if (idx < currentStep) node.classList.add('completed');
    });
    
    const fillHeight = (currentStep / (totalSteps - 1)) * 100;
    const blueFlow = document.getElementById('blueFlow');
    if (blueFlow) blueFlow.style.height = fillHeight + '%';
    
    const btnNext = document.getElementById('btnNext');
    const isLastStep = (currentStep === totalSteps - 1);
    if (btnNext) {
        btnNext.innerText = isLastStep ? (activeEditId ? "Save Changes" : "Launch Project") : (activeEditId ? "Next (Edit)" : "Next Step");
    }
    
    const scrollArea = document.getElementById('scrollArea');
    if (scrollArea) scrollArea.scrollTop = 0;
    
    const btnBack = document.getElementById('btnBack');
    if (btnBack) btnBack.style.display = currentStep > 0 ? 'inline-flex' : 'none';
}

function goTo(targetStep) {
    if (targetStep > currentStep) {
        if (targetStep > currentStep + 1) return;
        if (!isStepValid()) return;
    }
    currentStep = targetStep;
    updateStepView();
}

function navigateStep(direction) {
    if (direction === 1 && !isStepValid()) return;
    currentStep += direction;
    if (currentStep >= totalSteps) {
        saveData();
        return;
    }
    updateStepView();
}

function handleCloseModal() {
    document.getElementById('projectModal').style.display = 'none';
    resetValidation();
    saveAttempted = false;
}

// ==================== STEP VALIDATION ====================

function isStepValid() {
    resetValidation();
    let valid = true;
    
    if (currentStep === 0) {
        const nameEl = document.getElementById('form-name');
        const clubNo = document.getElementById('form-clubNo');
        const students = document.getElementById('form-studentNo');
        const emailEl = document.getElementById('form-email');
        const label1 = document.getElementById('label1');
        const label2 = document.getElementById('label2');
        const label3 = document.getElementById('label3');
        const dateText = document.getElementById('selectedDateText');
        
        if (!nameEl || nameEl.value.trim().length < 2) {
            showError('form-name', 'err-name');
            valid = false;
        }
        if (clubNo && (!clubNo.value || clubNo.value === "")) {
            showError('form-clubNo', 'err-clubNo');
            valid = false;
        }
        if (students && (!students.value || students.value === "")) {
            showError('form-studentNo', 'err-studentNo');
            valid = false;
        }
        if (emailEl && !/^\S+@\S+\.\S+$/.test(emailEl.value)) {
            showError('form-email', 'err-email');
            valid = false;
        }
        if (!dateText || dateText.innerText === "Select Date") {
            showError('calInput', 'err-date');
            valid = false;
        }
        if (!label1 || label1.innerText === "Select Store Type") {
            showError('form-scType', 'err-scType');
            valid = false;
        }
        if (!label3 || label3.innerText === "Select Program") {
            showError('form-lType', 'err-lType');
            valid = false;
        }
        if (!label2 || label2.innerText === "Select Customer Segment") {
            showError('form-sType', 'err-sType');
            valid = false;
        }
        
        const fileEl = document.getElementById('form-file');
        const dataBase = document.getElementById('form-data');
        const hasFile = fileEl && (fileEl.files?.length > 0 || fileEl.dataset.filedata || fileEl.dataset.existing);
        const hasData = dataBase && (dataBase.files?.length > 0 || dataBase.dataset.filedata || dataBase.dataset.existing);
        
        if (!hasFile) {
            showError('form-file', 'err-file');
            valid = false;
        }
        if (!hasData) {
            showError('form-data', 'err-data');
            valid = false;
        }
        return valid;
    }
    
    if (currentStep === 1) {
        const cards = document.querySelectorAll("#assetGrid .upload-card");
        cards.forEach(card => {
            const index = card.id.split("-")[2];
            const label = document.getElementById(`form-labelInput-${index}`);
            const catText = document.getElementById(`cat-text-${index}`);
            const hasImage = card.classList.contains("has-image");
            
            if (!hasImage) {
                card.classList.add("err-img-missing", "has-error");
                showError(`form-imageInput-${index}`, `err-image-${index}`);
                valid = false;
            }
            
            if (label && index >= 3 && index <= 8) {
                const hasLabel = label.value && label.value.trim() !== "";
                if (!hasLabel) {
                    card.classList.add("err-label-missing", "has-error");
                    label.classList.add("input-error");
                    showError(`form-labelInput-${index}`, `err-label-${index}`);
                    valid = false;
                }
            }
            
            if (catText && index >= 3 && index <= 8) {
                const categorySelected = catText.innerText !== "Select Category";
                if (!categorySelected) {
                    card.classList.add("err-category-missing", "has-error");
                    const wrapper = document.getElementById(`cat-wrapper-${index}`);
                    if (wrapper) wrapper.classList.add('has-error');
                    document.getElementById(`err-category-${index}`).style.display = "block";
                    valid = false;
                }
            }
        });
        return valid;
    }
    
    if (currentStep === 2) {
        return window.app ? window.app.validate() : true;
    }
    
    if (currentStep === 3) {
        let validFlag = validateFull();
        
        const textareas = [
            'form-about', 'form-welcome', 'form-value', 'form-mission', 
            'form-vision', 'form-bio', 'form-footer', 'form-innovation', 
            'form-excellence', 'form-community'
        ];

        const links = ['form-linkedin', 'form-youtube', 'form-facebook', 'form-instagram'];
        
        textareas.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.value.trim() === "") {
                showError(id, `err-${id.replace('form-', '')}`);
                validFlag = false;
            }
        });

        links.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.value.trim() === "") {
                showError(id, `err-${id.replace('form-', '')}`);
                validFlag = false;
            }
        });
        
        if (!validateTeacherCards()) validFlag = false;
        return validFlag;
    }
    
    if (currentStep === 4) {
        return validateBranchData();
    }
    
    if (currentStep === 5) {
        let validFlag = true;
        let errorMsg = '';
        
        const checkboxes = document.querySelectorAll('#pane-5 .item-list .hidden-check');
        let selectedCount = 0;
        const quantityErrors = [];
        
        checkboxes.forEach((cb, idx) => {
            if (cb.checked) {
                selectedCount++;
                const rowId = cb.closest('.item-row')?.id;
                const qtyId = rowId ? rowId.replace('row', 'qty') : `qty-${idx + 1}`;
                const qtyInput = document.getElementById(qtyId);
                const qty = parseInt(qtyInput?.value, 10);
                
                if (isNaN(qty) || qty <= 0) {
                    quantityErrors.push(`Please enter quantity for ${cb.closest('.item-row')?.querySelector('.item-name')?.textContent || 'item'}`);
                    if (qtyInput) qtyInput.classList.add('input-error');
                    validFlag = false;
                } else {
                    if (qtyInput) qtyInput.classList.remove('input-error');
                }
            }
        });
        
        if (selectedCount < 3) {
            errorMsg += 'Please select at least 3 items. ';
            validFlag = false;
        }
        
        const skillCheckboxes = document.querySelectorAll('#pane-5 .selection-card .hidden-check');
        const selectedSkills = Array.from(skillCheckboxes).filter(cb => cb.checked);
        
        if (selectedSkills.length < 3) {
            errorMsg += 'Please select at least 3 skills. ';
            validFlag = false;
        }
        
        if (quantityErrors.length) errorMsg += quantityErrors.join(' | ');
        
        const errorDiv = document.getElementById('facilityErrors');
        if (errorDiv) {
            if (!validFlag) {
                errorDiv.innerHTML = `<i data-lucide="alert-circle" style="margin-right: 8px;"></i> ${errorMsg}`;
                errorDiv.style.display = 'block';
                errorDiv.style.color = 'var(--error)';
                errorDiv.style.backgroundColor = 'rgba(255,77,77,0.1)';
                errorDiv.style.padding = '10px';
                errorDiv.style.borderRadius = '8px';
                refreshLucideIcons();
            } else {
                errorDiv.style.display = 'none';
            }
        }
        
        return validFlag;
    }
    
    return true;
}

// ==================== DATA COLLECTION ====================

async function collectAllData() {
    const data = {};
    
    // Collect standard form inputs
    document.querySelectorAll('#multiStepForm input, #multiStepForm select, #multiStepForm textarea').forEach(el => {
        if (!el.id || el.type === "file") return;
        data[el.id] = el.value;
    });
    
    // Collect custom select values
    const label1 = document.getElementById('label1');
    const label2 = document.getElementById('label2');
    const label3 = document.getElementById('label3');
    const dateText = document.getElementById('selectedDateText');
    
    if (label1 && label1.innerText !== "Select Store Type") data['form-scType'] = label1.innerText;
    if (label2 && label2.innerText !== "Select Customer Segment") data['form-sType'] = label2.innerText;
    if (label3 && label3.innerText !== "Select Program") data['form-lType'] = label3.innerText;
    if (dateText && dateText.innerText !== "Select Date") data['form-date'] = dateText.innerText;
    
    // Collect file data
    const fileFields = [
        { id: 'form-file', label: 'Legal PDF' },
        { id: 'form-data', label: 'Database PDF' }
    ];
    
    fileFields.forEach(field => {
        const input = document.getElementById(field.id);
        if (input) {
            data[field.id] = input.dataset.filedata || input.dataset.existing || "";
            data[`${field.id}-name`] = input.dataset.filename || (data[field.id] ? `${field.label} Loaded` : "");
        }
    });
    
    // Collect images with categories. We preserve the SLOT index so edit
    // mode can put each image back in the same gallery slot it came from
    // (otherwise an image uploaded into slot 3 would later be restored
    // into slot 1 if earlier slots were empty).
    data.images = [];
    const slots = ["Home Hero", "Brand Logo", "Gallery 1", "Gallery 2", "Gallery 3", "Gallery 4", "Gallery 5", "Gallery 6", "Male Uniform", "Female Uniform"];

    for (let i = 0; i < slots.length; i++) {
        const idx = i + 1;
        const preview = document.getElementById(`prev-${idx}`);
        const labelIn = document.getElementById(`form-labelInput-${idx}`);
        const categoryIn = document.getElementById(`form-category-${idx}`);

        // An <img> with no real src resolves preview.src to the current
        // page URL. Only accept actual base64 data URLs as a real upload.
        const src = preview && preview.src ? preview.src : "";
        const hasRealImage = src.startsWith('data:');

        if (hasRealImage) {
            data.images.push({
                slot: idx,
                src: src,
                label: labelIn ? labelIn.value : slots[i],
                category: categoryIn ? categoryIn.value : ""
            });
        }
    }
    
    // Collect ID Card mapping
    if (window.app && window.app.store) {
        data.idMapping = {
            front: {
                img: window.app.store.front.img,
                lines: window.app.store.front.lines,
                photo: window.app.store.front.photo
            },
            back: {
                img: window.app.store.back.img,
                lines: window.app.store.back.lines,
                photo: window.app.store.back.photo
            }
        };
        const canvas = document.getElementById("canvas");
        data.mapPreview = canvas ? canvas.toDataURL("image/jpeg", 0.3) : "";
    }
    
    // Collect store members (testimonials)
    data.storeMembers = [];
    const memberCards = document.querySelectorAll('.store-card');
    memberCards.forEach((card, i) => {
        const preview = document.getElementById(`img-preview-${i}`);
        data.storeMembers.push({
            name: document.getElementById(`name-in-${i}`)?.value || "",
            role: document.getElementById(`role-in-${i}`)?.value || "",
            text: document.getElementById(`quote-in-${i}`)?.value || "",
            img: preview?.dataset?.img || ""
        });
    });
    
    // Collect teacher cards
    data.teacherCards = [];
    for (let i = 0; i < FACULTY_COUNT; i++) {
        const previewImg = document.getElementById(`facultyPreview_${i}`);
        const ratingVal = document.getElementById(`facultyRating_${i}`)?.value || "0";
        
        data.teacherCards.push({
            name: document.getElementById(`facultyName_${i}`)?.innerText.trim() || "",
            role: document.getElementById(`facultyRole_${i}`)?.innerText.trim() || "",
            subject: document.getElementById(`facultySubject_${i}`)?.innerText.trim() || "",
            quote: document.getElementById(`facultyQuote_${i}`)?.innerText.trim() || "",
            years: document.getElementById(`yearsChip_${i}`)?.innerText.trim() || "0",
            rating: ratingVal,
            imageBase64: (previewImg && previewImg.src && previewImg.src.startsWith('data:')) ? previewImg.src : ""
        });
    }
    
    const socialLinks = ['form-youtube', 'form-linkedin', 'form-instagram', 'form-facebook'];
    socialLinks.forEach(linkId => {
        const el = document.getElementById(linkId);
        if (el && el.value) {
            data[linkId] = el.value;
        }
    });
    // Add this inside collectAllData() function in maker.js
// Collect FAQs from the FAQ container
data.faqs = [];
const faqCards = document.querySelectorAll('#faqContainer .faq-card');
faqCards.forEach(card => {
    const questionEl = card.querySelector('.faq-question');
    const answerEl = card.querySelector('.faq-answer');
    if (questionEl && answerEl) {
        // Get text content, removing icon elements
        const question = questionEl.innerText || questionEl.textContent || "";
        const answer = answerEl.innerText || answerEl.textContent || "";
        if (question && answer) {
            data.faqs.push({
                question: question.trim(),
                answer: answer.trim()
            });
        }
    }
});
console.log("Collected FAQs:", data.faqs.length);

    // Collect branches
    data.branches = [];
    const branchCount = Number(document.getElementById('branchCount')?.value) || 0;
    
    for (let i = 1; i <= branchCount; i++) {
        const locInput = document.getElementById(`loc-${i}`);
        const gradeDrop = document.getElementById(`grade-drop-${i}`);
        const selectedGrades = [];
        
        if (gradeDrop) {
            gradeDrop.querySelectorAll('input[type="checkbox"]:checked').forEach(chk => {
                const label = chk.closest('.checkbox-item');
                if (label) {
                    const gradeText = label.querySelector('.label-text')?.innerText.trim();
                    if (gradeText) selectedGrades.push(gradeText);
                }
            });
        }
        
        data.branches.push({
            name: document.getElementById(`name-${i}`)?.value || "",
            location: locInput?.value || "",
            phone: document.getElementById(`phone-${i}`)?.value || "",
            telegram: document.getElementById(`telegram-${i}`)?.value || "",
            grades: selectedGrades
        });
    }
    
    // In maker.js, update the facilities collection section:

// Collect facilities - MAKE SURE THIS IS CORRECT
data.facilities = {
    selectedItems: [],
    selectedSkills: []
};

// Collect selected items from the item list (Programs)
const itemCheckboxes = document.querySelectorAll('#pane-5 .item-list .hidden-check');
console.log("Found item checkboxes:", itemCheckboxes.length);

itemCheckboxes.forEach((cb, idx) => {
    if (cb.checked) {
        const row = cb.closest('.item-row');
        const rowId = row?.id || `row-${idx + 1}`;
        const qtyId = rowId.replace('row', 'qty');
        const qtyInput = document.getElementById(qtyId);
        const itemName = row?.querySelector('.item-name')?.innerText || "";
        const quantity = qtyInput?.value || "0";
        
        console.log(`Adding selected item: ${itemName} with quantity: ${quantity}`);
        
        data.facilities.selectedItems.push({
            rowId: rowId,
            name: itemName,
            quantity: quantity
        });
    }
});

// Collect selected skills from the selection card (Facilities)
const skillCheckboxes = document.querySelectorAll('#pane-5 .selection-card .checkbox-item .hidden-check');
console.log("Found skill checkboxes:", skillCheckboxes.length);

skillCheckboxes.forEach(cb => {
    if (cb.checked) {
        const labelText = cb.closest('.checkbox-item')?.querySelector('.label-text')?.innerText || "";
        if (labelText) {
            console.log(`Adding selected skill: ${labelText}`);
            data.facilities.selectedSkills.push(labelText);
        }
    }
});

console.log("Final facilities data being saved:", data.facilities);
    
    return data;
}

// ==================== DATABASE OPERATIONS ====================

async function saveData() {
    const fullData = await collectAllData();
    
    // DEBUG: Log what's being saved
    console.log("=== SAVING PROJECT DATA ===");
    console.log("Facilities data being saved:", fullData.facilities);
    console.log("Selected items count:", fullData.facilities?.selectedItems?.length);
    console.log("Selected skills count:", fullData.facilities?.selectedSkills?.length);
    
    const images = [...(fullData.images || [])];
    fullData.images = images;

    let projectId;

    if (activeEditId) {
        await db.projects.update(activeEditId, fullData);
        projectId = activeEditId;
        try {
            await db.gallery.where("projectId").equals(projectId).delete();
        } catch (err) {
            console.warn("Gallery cleanup skipped:", err);
        }
    } else {
        projectId = await db.projects.add(fullData);
    }

    // Verify the data was saved correctly
    const savedProject = await db.projects.get(projectId);
    console.log("Verified saved project facilities:", savedProject?.facilities);

    const assetPromises = images.map((img, i) => {
        return db.gallery.add({
            projectId: projectId,
            slotId: `${projectId}-${i + 1}`,
            src: img.src,
            label: img.label,
            category: img.category || ""
        });
    });

    await Promise.all(assetPromises);
    await renderProjects();
    handleCloseModal();
    activeEditId = null;
}

async function renderProjects(dataToDisplay = null) {
    const grid = document.getElementById('gridDisplay');
    if (!grid) return;
    
    grid.innerHTML = '';
    let projects = dataToDisplay ? (Array.isArray(dataToDisplay) ? dataToDisplay : [dataToDisplay]) : await db.projects.toArray();
    
    if (!projects || projects.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-dim);">
            <i class="fas fa-folder-open" style="font-size: 3rem; margin-bottom: 15px;"></i>
            <p>No active deployments found.</p>
        </div>`;
        return;
    }
    
    grid.innerHTML = projects.map(p => {
        const displayImg = (p.images && p.images[0] && p.images[0].src) ? p.images[0].src : 'https://placehold.co/400x200/1a1a2e/white?text=No+Image';
        const cleanSlug = p["form-name"] ? p["form-name"].toLowerCase().replace(/\s+/g, '').replace(/[^\w]/g, '') : 'noname';
        const nowDate = new Date().toLocaleDateString();
        
        return `
            <div class="site-card">
                <div class="card-banner">
                    <span class="card-badge">${p["form-scType"] || 'N/A'}</span>
                    <img src="${displayImg}" alt="Banner" onerror="this.src='https://placehold.co/400x200/1a1a2e/white?text=No+Image'">
                </div>
                <div class="card-body">
                    <h3>${p["form-name"] || 'Untitled Project'}</h3>
                    <div class="info-row"><i class="fas fa-user"></i> ${p["form-sType"] || 'N/A'}</div>
                    <div class="info-row"><i class="fas fa-calendar"></i> ${p["form-date"] || nowDate}</div>
                    <div class="info-row"><i class="fas fa-link"></i> www.${cleanSlug}.com</div>
                </div>
                <div class="card-footer" style="display: flex; gap: 10px; padding: 15px;">
                    <button class="btn btn-outline" onclick="handleOpenModal(${p.id})">Edit</button>
                    <button class="btn btn-danger" onclick="deleteProject(${p.id})">Delete</button>
                    <button class="btn btn-primary" onclick="launchProject(${p.id})">Launch</button>
                </div>
            </div>
        `;
    }).join('');
}

async function deleteProject(id) {
    if (confirm("Decommission this instance?")) {
        await db.projects.delete(id);
        try {
            await db.gallery.where("projectId").equals(id).delete();
        } catch (err) {
            console.warn("Gallery cleanup skipped:", err);
        }
        renderProjects();
    }
}

async function launchProject(id) {
    const p = await db.projects.get(id);
    console.log("Launching Project:", p);
    await db.shared.put({ key: 'current_active', data: p });
    window.open("https://binizab.github.io/Web_Craft-Projectcreate_websites/e-commerce/ecommerce_home/ecommerce_home.html", "_blank");
}

async function filterProjects() {
    const q = document.getElementById('projectSearch')?.value.toLowerCase() || "";
    const allProjects = await db.projects.toArray();
    const filtered = allProjects.filter(p => p["form-name"] && p["form-name"].toLowerCase().includes(q));
    renderProjects(filtered);
}

// ==================== EDIT MODE - RESTORE DATA ====================

async function handleOpenModal(editId = null) {
    activeEditId = editId;
    currentStep = 0;
    saveAttempted = false;
    
    const form = document.getElementById('multiStepForm');
    if (form) form.reset();
    resetValidation();
    
    // Clear all dynamic content
    document.querySelectorAll('.preview-img').forEach(img => img.src = "");
    document.querySelectorAll('.upload-card').forEach(c => c.classList.remove("has-image"));
    document.querySelectorAll('.label-input').forEach(input => input.value = "");

    // Wipe step-0 file input datasets and their status labels so a previously
    // opened project's PDFs don't bleed into the next session.
    ['form-file', 'form-data'].forEach(fid => {
        const fEl = document.getElementById(fid);
        if (fEl) {
            delete fEl.dataset.filedata;
            delete fEl.dataset.filename;
            delete fEl.dataset.existing;
        }
    });
    ['file-status-label', 'data-status-label'].forEach(lid => {
        const lEl = document.getElementById(lid);
        if (lEl) { lEl.innerText = ""; lEl.style.display = 'none'; }
    });

    // Clear category UI for every gallery slot
    for (let i = 1; i <= 10; i++) {
        const catSpan = document.getElementById(`cat-text-${i}`);
        const wrapper = document.getElementById(`cat-wrapper-${i}`);
        const hidden = document.getElementById(`form-category-${i}`);
        if (catSpan) {
            catSpan.textContent = "Select Category";
            catSpan.classList.add('is-placeholder');
            catSpan.classList.remove('is-active');
        }
        if (wrapper) wrapper.classList.remove('has-selection', 'has-error', 'open');
        if (hidden) hidden.value = "";
    }

    // Clear facility checkboxes/qty + skill checkboxes from any prior session
    document.querySelectorAll('#pane-5 .item-list .item-row').forEach(row => {
        const cb = row.querySelector('.hidden-check');
        const qtyId = row.id.replace('row', 'qty');
        const qty = document.getElementById(qtyId);
        if (cb) cb.checked = false;
        if (qty) { qty.value = ""; qty.disabled = true; }
        row.classList.remove('active');
    });
    document.querySelectorAll('#pane-5 .selection-card .hidden-check').forEach(cb => {
        cb.checked = false;
    });

    // Clear teacher cards rendering so editing a project always starts fresh
    if (typeof renderAllCards === 'function') renderAllCards();
    
    // Reset custom selects
    const defaultLabels = [
        { id: 'label1', text: "Select Store Type" },
        { id: 'label2', text: "Select Customer Segment" },
        { id: 'label3', text: "Select Program" }
    ];
    defaultLabels.forEach(item => {
        const label = document.getElementById(item.id);
        if (label) {
            label.innerText = item.text;
            label.classList.add('is-placeholder');
        }
    });
    
    const dateText = document.getElementById('selectedDateText');
    if (dateText) {
        dateText.innerText = "Select Date";
        dateText.classList.add('is-placeholder');
    }
    
    if (editId) {
        const p = await db.projects.get(editId);
        if (p) {
            document.getElementById('modalMainHeading').innerText = "Edit Project";
            
            // Restore standard inputs
            Object.keys(p).forEach(key => {
                const el = document.getElementById(key);
                if (el && el.type !== 'file' && el.type !== 'checkbox' && typeof p[key] !== 'object') {
                    el.value = p[key];
                }
            });
            
            // Restore custom selects
            if (p['form-scType']) {
                const label1 = document.getElementById('label1');
                if (label1) {
                    label1.innerText = p['form-scType'];
                    label1.classList.remove('is-placeholder');
                    label1.classList.add('is-active');
                }
            }
            if (p['form-sType']) {
                const label2 = document.getElementById('label2');
                if (label2) {
                    label2.innerText = p['form-sType'];
                    label2.classList.remove('is-placeholder');
                    label2.classList.add('is-active');
                }
            }
            if (p['form-lType']) {
                const label3 = document.getElementById('label3');
                if (label3) {
                    label3.innerText = p['form-lType'];
                    label3.classList.remove('is-placeholder');
                    label3.classList.add('is-active');
                }
            }
            if (p['form-date']) {
                const dateTextEl = document.getElementById('selectedDateText');
                if (dateTextEl) {
                    dateTextEl.innerText = p['form-date'];
                    dateTextEl.classList.remove('is-placeholder');
                    dateTextEl.classList.add('is-active');
                }
            }
            
            // Restore files
            if (p['form-file']) {
                const el = document.getElementById('form-file');
                const statusLabel = document.getElementById('file-status-label');
                if (el) {
                    el.dataset.existing = p['form-file'];
                    el.dataset.filedata = p['form-file'];
                    el.dataset.filename = p['form-file-name'] || "Legal PDF";
                    if (statusLabel) {
                        statusLabel.innerText = p['form-file-name'] || "Legal PDF Loaded ✅";
                        statusLabel.style.display = 'block';
                        statusLabel.style.color = 'var(--success-green)';
                    }
                }
            }
            if (p['form-data']) {
                const el = document.getElementById('form-data');
                const statusLabel = document.getElementById('data-status-label');
                if (el) {
                    el.dataset.existing = p['form-data'];
                    el.dataset.filedata = p['form-data'];
                    el.dataset.filename = p['form-data-name'] || "Database PDF";
                    if (statusLabel) {
                        statusLabel.innerText = p['form-data-name'] || "Database PDF Loaded ✅";
                        statusLabel.style.display = 'block';
                        statusLabel.style.color = 'var(--success-green)';
                    }
                }
            }
            
           // Restore images with categories. Use the saved slot index when
           // present so each image lands back in the same upload card it
           // came from. Older saved projects won't have `slot`, so fall
           // back to sequential placement for backwards compatibility.
if (p.images && Array.isArray(p.images)) {
    // Reset global galleryData for a clean edit session
    galleryData = {};

    p.images.forEach((imgData, index) => {
        const idx = imgData.slot || (index + 1);
        const imgEl = document.getElementById(`prev-${idx}`);
        const card = document.getElementById(`gallery-card-${idx}`);
        const labelInput = document.getElementById(`form-labelInput-${idx}`);

        if (imgEl && imgData.src && imgData.src.length > 10) {
            // Restore Preview
            imgEl.src = imgData.src;
            if (card) card.classList.add("has-image");

            // Restore label
            if (labelInput) labelInput.value = imgData.label || "";

            // Restore category using our helper
            if (imgData.category) {
                setCategoryUI(idx, imgData.category);
            } else {
                // If no category, ensure UI is in placeholder state
                const catSpan = document.getElementById(`cat-text-${idx}`);
                if (catSpan) {
                    catSpan.textContent = "Select Category";
                    catSpan.classList.add('is-placeholder');
                    catSpan.classList.remove('is-active');
                }
            }

            // Sync the global galleryData object so saving works correctly
            galleryData[`slot-${idx}`] = {
                img: imgData.src,
                label: imgData.label || "",
                category: imgData.category || ""
            };
        }
    });
}
            
            // Restore ID Card mapping
            if (window.app && p.idMapping) {
                window.app.store = {
                    front: {
                        img: p.idMapping.front?.img || null,
                        lines: p.idMapping.front?.lines || [],
                        photo: p.idMapping.front?.photo || null
                    },
                    back: {
                        img: p.idMapping.back?.img || null,
                        lines: p.idMapping.back?.lines || [],
                        photo: p.idMapping.back?.photo || null
                    }
                };
                window.app.currentSide = 'front';
                window.app.render();
                window.app.draw();
            }
            
            // Restore store members (testimonials)
            if (p.storeMembers && p.storeMembers.length > 0) {
                const countInput = document.getElementById('cardCount');
                if (countInput) {
                    countInput.value = p.storeMembers.length;
                    updateSwiper();
                }
                
                setTimeout(() => {
                    p.storeMembers.forEach((member, i) => {
                        const preview = document.getElementById(`img-preview-${i}`);
                        if (preview && member.img) {
                            preview.style.backgroundImage = `url(${member.img})`;
                            preview.style.backgroundSize = "cover";
                            preview.style.backgroundPosition = "center";
                            preview.innerHTML = "";
                            preview.dataset.img = member.img;
                        }
                        
                        const nameInput = document.getElementById(`name-in-${i}`);
                        const roleInput = document.getElementById(`role-in-${i}`);
                        const quoteInput = document.getElementById(`quote-in-${i}`);
                        
                        if (nameInput) nameInput.value = member.name;
                        if (roleInput) roleInput.value = member.role;
                        if (quoteInput) quoteInput.value = member.text;
                    });
                }, 100);
            }
            
            // Restore teacher cards
            if (p.teacherCards && p.teacherCards.length > 0) {
                p.teacherCards.forEach((teacher, i) => {
                    const nameElem = document.getElementById(`facultyName_${i}`);
                    const roleElem = document.getElementById(`facultyRole_${i}`);
                    const subjectElem = document.getElementById(`facultySubject_${i}`);
                    const quoteElem = document.getElementById(`facultyQuote_${i}`);
                    const yearsChip = document.getElementById(`yearsChip_${i}`);
                    const ratingHidden = document.getElementById(`facultyRating_${i}`);
                    const previewImg = document.getElementById(`facultyPreview_${i}`);
                    const placeholderZone = document.getElementById(`placeholderZone_${i}`);
                    
                    if (nameElem) nameElem.innerText = teacher.name || "Educator Name";
                    if (roleElem) roleElem.innerText = teacher.role || "Lead Instructor";
                    if (subjectElem) subjectElem.innerText = teacher.subject || "Curriculum Expert";
                    if (quoteElem) quoteElem.innerText = teacher.quote || "Inspire minds, transform futures.";
                    if (yearsChip) yearsChip.innerText = teacher.years || "4";
                    if (ratingHidden) ratingHidden.value = teacher.rating || "0";
                    
                    if (previewImg && teacher.imageBase64) {
                        previewImg.src = teacher.imageBase64;
                        previewImg.style.display = 'block';
                        if (placeholderZone) placeholderZone.style.display = 'none';
                    }
                    
                    // Restore star rating
                    if (teacher.rating && parseInt(teacher.rating) > 0) {
                        const starContainer = document.getElementById(`starContainer_${i}`);
                        if (starContainer) {
                            const stars = starContainer.querySelectorAll('.star-icon');
                            stars.forEach((star, idx) => {
                                if (idx < parseInt(teacher.rating)) star.classList.add('active-star');
                                else star.classList.remove('active-star');
                            });
                        }
                    }
                    
                    // Sync badge
                    if (yearsChip) {
                        let raw = yearsChip.innerText.trim();
                        let numericMatch = raw.match(/\d+/);
                        let displayVal = numericMatch ? numericMatch[0] : "0";
                        const badgeSpan = document.getElementById(`badgeYears_${i}`);
                        if (badgeSpan) badgeSpan.innerText = `${displayVal} yr${displayVal !== "1" ? 's' : ''}`;
                    }
                });
            }
            
            // Restore branches
            if (p.branches && p.branches.length > 0) {
                const branchCountInput = document.getElementById('branchCount');
                if (branchCountInput) {
                    branchCountInput.value = p.branches.length;
                    updateBranchGrid();
                }
                
                setTimeout(() => {
                    p.branches.forEach((branch, index) => {
                        const id = index + 1;
                        const nameInput = document.getElementById(`name-${id}`);
                        const locInput = document.getElementById(`loc-${id}`);
                        const phoneInput = document.getElementById(`phone-${id}`);
                        const telegramInput = document.getElementById(`telegram-${id}`);
                        const locDisplay = document.getElementById(`locDis-${id}`);
                        
                        if (nameInput) nameInput.value = branch.name || "";
                        if (locInput) locInput.value = branch.location || "";
                        if (phoneInput) phoneInput.value = branch.phone || "";
                        if (telegramInput) telegramInput.value = branch.telegram || "";
                        if (locDisplay && branch.location) locDisplay.innerText = branch.location;
                        
                        // Restore grade checkboxes
                        if (branch.grades && Array.isArray(branch.grades)) {
                            const gradeDrop = document.getElementById(`grade-drop-${id}`);
                            if (gradeDrop) {
                                const checkboxes = gradeDrop.querySelectorAll('.checkbox-item');
                                checkboxes.forEach(labelEl => {
                                    const checkbox = labelEl.querySelector('input');
                                    const gradeName = labelEl.querySelector('.label-text')?.innerText.trim() || "";
                                    if (checkbox && branch.grades.includes(gradeName)) {
                                        checkbox.checked = true;
                                    }
                                });
                            }
                        }
                        
                        // Restore map marker
                        if (branch.location && typeof branch.location === 'string' && branch.location.includes(',')) {
                            const coords = branch.location.split(',').map(Number);
                            if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
                                const map = branchMaps[id];
                                if (map) updateBranchLocation(id, coords[0], coords[1], map);
                            }
                        }
                    });
                }, 500);
            }
            
            // Restore facilities
            if (p.facilities) {
                if (p.facilities.selectedItems && p.facilities.selectedItems.length > 0) {
                    // Build a lookup of all rows so we can match each saved
                    // item to the correct row by id (preferred) or name.
                    const allRows = document.querySelectorAll('#pane-5 .item-list .item-row');
                    p.facilities.selectedItems.forEach(item => {
                        let row = null;
                        if (item.rowId) {
                            row = document.getElementById(item.rowId);
                        }
                        if (!row && item.name) {
                            allRows.forEach(r => {
                                const rn = r.querySelector('.item-name')?.innerText || "";
                                if (!row && rn === item.name) row = r;
                            });
                        }
                        if (!row) return;
                        const checkbox = row.querySelector('.hidden-check');
                        const qtyId = row.id.replace('row', 'qty');
                        const qtyInput = document.getElementById(qtyId);
                        if (checkbox && item.quantity && parseInt(item.quantity) > 0) {
                            checkbox.checked = true;
                            if (qtyInput) {
                                qtyInput.disabled = false;
                                qtyInput.value = item.quantity;
                            }
                            row.classList.add('active');
                        }
                    });
                }
                
                if (p.facilities.selectedSkills && p.facilities.selectedSkills.length > 0) {
                    const skillCheckboxes = document.querySelectorAll('#pane-5 .selection-card .checkbox-item');
                    skillCheckboxes.forEach(cb => {
                        const labelText = cb.querySelector('.label-text')?.innerText || "";
                        const checkbox = cb.querySelector('.hidden-check');
                        if (checkbox && p.facilities.selectedSkills.includes(labelText)) {
                            checkbox.checked = true;
                        }
                    });
                }
            }
        }
    } else {
        document.getElementById('modalMainHeading').innerText = "New Project";
        galleryData = {};
        
        const branchCountInput = document.getElementById('branchCount');
        if (branchCountInput) {
            branchCountInput.value = 1;
            updateBranchGrid();
        }
        
        const cardCountInput = document.getElementById('cardCount');
        if (cardCountInput) {
            cardCountInput.value = 4;
            updateSwiper();
        }
    }
    
    document.getElementById('projectModal').style.display = 'flex';
    updateStepView();
}

// ==================== GALLERY FUNCTIONS ====================

function triggerInput(index) {
    document.getElementById(`input-${index}`)?.click();
}

async function handleFile(input, index) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            const result = e.target.result;
            const card = document.getElementById(`gallery-card-${index}`);
            const img = document.getElementById(`prev-${index}`);
            if (img) img.src = result;
            if (card) card.classList.add("has-image");
            
            if (!galleryData[`slot-${index}`]) {
                galleryData[`slot-${index}`] = { img: "", label: "" };
            }
            galleryData[`slot-${index}`].img = result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function updateLabel(index, value) {
    const card = document.getElementById(`gallery-card-${index}`);
    if (!galleryData[`slot-${index}`]) {
        galleryData[`slot-${index}`] = { img: "", label: "" };
    }
    galleryData[`slot-${index}`].label = value;
    
    if (value.trim() !== "") {
        if (card) card.classList.remove("err-label-missing");
        const input = document.getElementById(`form-labelInput-${index}`);
        if (input) input.classList.remove("input-error");
        checkCardError(card);
    }
}

// Used by edit-mode restore to programmatically set the category UI for a slot
// without going through the click handler. Mirrors selectCategory() but does
// not toggle the dropdown open/close state.
function setCategoryUI(idx, value) {
    if (!value) return;
    const wrapper = document.getElementById(`cat-wrapper-${idx}`);
    const catSpan = document.getElementById(`cat-text-${idx}`);
    const hiddenCat = document.getElementById(`form-category-${idx}`);
    const card = document.getElementById(`gallery-card-${idx}`);
    const menu = document.getElementById(`cat-menu-${idx}`);

    if (catSpan) {
        catSpan.textContent = value;
        catSpan.classList.remove('is-placeholder');
        catSpan.classList.add('is-active');
    }
    if (wrapper) {
        wrapper.classList.remove('has-error', 'open');
        wrapper.classList.add('has-selection');
    }
    if (menu) {
        menu.querySelectorAll('.option-item').forEach(opt => {
            opt.classList.remove('active-opt');
            if (opt.textContent === value) opt.classList.add('active-opt');
        });
    }
    if (hiddenCat) hiddenCat.value = value;
    if (card) {
        card.classList.remove("err-category-missing");
        const errHint = document.getElementById(`err-category-${idx}`);
        if (errHint) errHint.style.display = 'none';
        checkCardError(card);
    }
}

function selectCategory(idx, value) {
    const wrapper = document.getElementById(`cat-wrapper-${idx}`);
    const catSpan = document.getElementById(`cat-text-${idx}`);
    const hiddenCat = document.getElementById(`form-category-${idx}`);
    const card = document.getElementById(`gallery-card-${idx}`);
    const menu = document.getElementById(`cat-menu-${idx}`);
    
    if (catSpan) {
        catSpan.textContent = value;
        catSpan.classList.remove('is-placeholder');
        catSpan.classList.add('is-active');
    }
    
    if (wrapper) {
        wrapper.classList.remove('has-error', 'open');
        wrapper.classList.add('has-selection');
    }
    
    if (menu) {
        menu.querySelectorAll('.option-item').forEach(opt => {
            opt.classList.remove('active-opt');
            if (opt.textContent === value) opt.classList.add('active-opt');
        });
    }
    
    if (hiddenCat) hiddenCat.value = value;
    if (!galleryData[`slot-${idx}`]) {
        galleryData[`slot-${idx}`] = { img: "", label: "" };
    }
    galleryData[`slot-${idx}`].category = value;
    
    if (card && value.trim() !== "") {
        card.classList.remove("err-category-missing");
        const errHint = document.getElementById(`err-category-${idx}`);
        if (errHint) errHint.style.display = 'none';
        checkCardError(card);
    }
}

function toggleCategorySelect(idx) {
    const wrapper = document.getElementById(`cat-wrapper-${idx}`);
    if (!wrapper) return;
    
    document.querySelectorAll('.custom-select-wrapper').forEach(w => {
        if (w.id !== `cat-wrapper-${idx}`) {
            w.classList.remove('open');
        }
    });
    
    wrapper.classList.toggle('open');
}

function checkCardError(card) {
    if (!card) return;
    if (!card.classList.contains("err-img-missing") &&
        !card.classList.contains("err-label-missing") &&
        !card.classList.contains("err-category-missing")) {
        card.classList.remove("has-error");
    }
}

// ==================== BRANCH FUNCTIONS ====================

let branchMaps = {};
let branchMarkers = {};

function handleCountChange() {
    updateBranchGrid();
}

function updateBranchGrid() {
    const grid = document.getElementById('branchGrid');
    const count = Math.min(Math.max(Number(document.getElementById('branchCount')?.value) || 1, 1), 50);
    if (grid) grid.innerHTML = '';
    
    for (let i = 1; i <= count; i++) {
        const card = createBranchCard(i);
        if (grid) grid.appendChild(card);
    }
    
    setTimeout(() => {
        for (let i = 1; i <= count; i++) {
            initBranchMap(i);
        }
    }, 100);
}

function createBranchCard(id) {
    const card = document.createElement('div');
    card.className = 'branch-card';
    card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center">
            <h3 style="margin:0; color:var(--accent-blue);"><i class="fas fa-store"></i> Branch #${id}</h3>
        </div>
        <div class="input-group">
            <i class="fas fa-pen-nib"></i>
            <input type="text" id="name-${id}" placeholder=" ">
            <label>Relative Location (Name)</label>
        </div>
        <div style="display: flex; gap: 10px; margin: 5px 0;">
            <button type="button" class="locate-btn" data-id="${id}">
                <i class="fas fa-location-dot"></i> Locate Me
            </button>
        </div>
        <div id="map-${id}" style="height: 200px; border-radius: 12px; margin: 10px 0; border: 1px solid var(--border);"></div>
        <div class="input-group location-display">
            <input type="hidden" id="loc-${id}" value="">
            <div class="coords-text">
                <span><i data-lucide="locate" style="transform: scale(0.8); margin-bottom: -5px; margin-right:5px;"></i><span id="locDis-${id}">Waiting for location...</span></span>
            </div>
        </div>
        <div class="input-group" id="phone-group-${id}">
            <i class="fas fa-phone"></i>
            <input type="tel" id="phone-${id}" placeholder=" " oninput="validateETPhone(this)">
            <label>Phone Number (+251)</label>
        </div>
        <div class="custom-dropdown" id="grade-drop-${id}">
            <div class="dropdown-trigger" onclick="toggleDrop('grade-drop-${id}')">
                <span><i class="fas fa-graduation-cap"></i> &nbsp; Available Grades</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="dropdown-content">
                ${['Pre-Primary', 'Elementary', 'Middle', 'High Store', 'University', 'College'].map(g => `
                    <label class="checkbox-item">
                        <input type="checkbox" class="hidden-check">
                        <div class="custom-box"><i data-lucide="check" size="14"></i></div>
                        <span class="label-text">${g}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        <div class="input-group">
            <i class="fab fa-telegram"></i>
            <input type="text" id="telegram-${id}" placeholder=" ">
            <label>Telegram Username</label>
        </div>
        <div id="links-${id}" style="display:flex; flex-direction:column; gap:12px;"></div>
    `;
    return card;
}

function initBranchMap(id) {
    const container = document.getElementById(`map-${id}`);
    if (!container) return;
    
    const defaultCenter = [9.0192, 38.7525];
    const map = L.map(container).setView(defaultCenter, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
    }).addTo(map);
    
    map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        updateBranchLocation(id, lat, lng, map);
    });
    
    branchMaps[id] = map;
    
    const locateBtn = container.parentElement?.querySelector(`.locate-btn[data-id="${id}"]`);
    if (locateBtn) {
        locateBtn.onclick = () => locateBranch(id);
    }
}

function updateBranchLocation(id, lat, lng, map) {
    const locInput = document.getElementById(`loc-${id}`);
    const locDisplay = document.getElementById(`locDis-${id}`);
    const val = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    
    if (locInput) locInput.value = val;
    if (locDisplay) {
        locDisplay.innerText = val;
        locDisplay.classList.add('location-updated');
        setTimeout(() => locDisplay.classList.remove('location-updated'), 1000);
    }
    
    if (branchMarkers[id]) {
        branchMarkers[id].setLatLng([lat, lng]);
    } else {
        branchMarkers[id] = L.marker([lat, lng], { draggable: true }).addTo(map);
        branchMarkers[id].on('dragend', function() {
            const pos = this.getLatLng();
            updateBranchLocation(id, pos.lat, pos.lng, map);
        });
    }
    map.setView([lat, lng], 15);
}

function locateBranch(id) {
    if (!navigator.geolocation) {
        alert("Geolocation not supported by your browser.");
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            const map = branchMaps[id];
            if (map) {
                updateBranchLocation(id, latitude, longitude, map);
            } else {
                setTimeout(() => locateBranch(id), 500);
            }
        },
        (error) => {
            console.error("Geolocation error:", error);
            alert("Unable to retrieve your location. Please check permissions.");
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

function toggleDrop(id) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('active');
}

function validateBranchData() {
    const count = Number(document.getElementById('branchCount')?.value) || 0;
    let errors = 0;
    
    for (let i = 1; i <= count; i++) {
        const card = document.querySelector(`.branch-card:nth-child(${i})`);
        if (!card) return false;
        
        card.querySelectorAll('.error-msg').forEach(e => e.remove());
        card.querySelectorAll('.input-error').forEach(e => e.classList.remove('input-error'));
        
        const addError = (el, msg) => {
            const err = document.createElement('div');
            err.className = 'error-msg';
            err.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${msg}`;
            err.style.color = 'var(--error)';
            err.style.fontSize = '0.75rem';
            err.style.marginTop = '5px';
            const wrapper = (el && el.closest && el.closest('.input-group, .custom-dropdown, .btn-outline')) || el || card;
            if (wrapper && wrapper.after) wrapper.after(err);
            if (el && el.tagName === 'INPUT') el.classList.add('input-error');
            errors++;
        };
        
        const name = document.getElementById(`name-${i}`);
        if (!name || !name.value.trim()) addError(name || card, "Location name is required");
        
        const loc = document.getElementById(`loc-${i}`);
        if (!loc || !loc.value.trim()) addError(loc || card, "Please pin on map");
        
        const gradeBox = document.getElementById(`grade-drop-${i}`);
        if (!gradeBox || gradeBox.querySelectorAll('input:checked').length === 0) {
            addError((gradeBox && gradeBox.querySelector('.dropdown-trigger')) || card, "Select at least one grade");
        }
        
        const telegram = document.getElementById(`telegram-${i}`);
        if (!telegram || !telegram.value.trim()) {
            addError(telegram, "Telegram username is required");
        } else if (!/^@?[a-zA-Z0-9_]{5,}$/.test(telegram.value.trim())) {
            addError(telegram, "Invalid Telegram username");
        }
        
        const phone = document.getElementById(`phone-${i}`);
        if (!phone || !phone.value.trim()) {
            addError(phone, "Phone number is required");
        } else if (!/^9\d{8}$/.test(phone.value.trim())) {
            addError(phone, "Enter valid Ethiopian number (9XXXXXXXX)");
        }
    }
    
    if (errors > 0) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
    }
    return true;
}

// ==================== TESTIMONIAL / SWIPER FUNCTIONS ====================

function updateSwiper() {
    const wrapper = document.getElementById('swiper-wrapper');
    let count = Math.min(parseInt(document.getElementById('cardCount')?.value) || 4, 15);
    
    if (swiperInstance) swiperInstance.destroy(true, true);
    if (wrapper) wrapper.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide';
        slide.innerHTML = `
            <div class="store-card upload-card" id="card-${i}">
                <div class="profile-wrapper" onclick="triggerUpload(${i})">
                    <div class="profile-img" id="img-preview-${i}">
                        <i class="fa-solid fa-camera" style="font-size:24px; color:#3b82f6"></i>
                    </div>
                    <input type="file" id="file-input-${i}" style="display:none" accept="image/*" onchange="previewImage(event, ${i})">
                </div>
                <input type="text" class="input-field name-in" id="name-in-${i}" placeholder="User Name">
                <input type="text" class="input-field role-in" id="role-in-${i}" style="color:#3b82f6; font-size:11px; font-weight:700" placeholder="JOB POSITION">
                <textarea class="input-field quote-in quote-input" id="quote-in-${i}" placeholder="Enter testimonial..."></textarea>
                <div class="error-list">
                    <div class="error-text msg-img"><i class="fa-solid fa-circle-image"></i> Select an image</div>
                    <div class="error-text msg-name"><i class="fa-solid fa-user-pen"></i> Name is required</div>
                    <div class="error-text msg-role"><i class="fa-solid fa-briefcase"></i> Role is required</div>
                    <div class="error-text msg-quote"><i class="fa-solid fa-message"></i> Testimonial required</div>
                    <div class="error-text msg-short"><i class="fa-solid fa-triangle-exclamation"></i> Must be more than 5 words</div>
                </div>
            </div>
        `;
        if (wrapper) wrapper.appendChild(slide);
    }
    
    swiperInstance = new Swiper(".mySwiper", {
        effect: "coverflow",
        centeredSlides: true,
        slidesPerView: "auto",
        autoHeight: true,
        coverflowEffect: { rotate: 0, stretch: 0, depth: 100, modifier: 2, slideShadows: false },
        pagination: { el: ".swiper-pagination", clickable: true },
        navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    });
}

function triggerUpload(i) {
    document.getElementById(`file-input-${i}`)?.click();
}

function previewImage(event, i) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const preview = document.getElementById(`img-preview-${i}`);
        if (preview) {
            preview.style.backgroundImage = `url(${e.target.result})`;
            preview.style.backgroundSize = "cover";
            preview.style.backgroundPosition = "center";
            preview.innerHTML = "";
            preview.dataset.img = e.target.result;
            
            const card = document.getElementById(`card-${i}`);
            if (card) card.classList.remove('err-img-miss');
        }
    };
    reader.readAsDataURL(file);
}

function validateFull() {
    let isValid = true;
    const cards = document.querySelectorAll('.store-card');
    
    cards.forEach(card => {
        const preview = card.querySelector('.profile-img');
        const hasImg = preview && preview.dataset.img;
        const name = card.querySelector('.name-in')?.value.trim() || "";
        const role = card.querySelector('.role-in')?.value.trim() || "";
        const quote = card.querySelector('.quote-in')?.value.trim() || "";
        const words = quote === "" ? 0 : quote.split(/\s+/).filter(w => w.length > 0).length;
        
        card.classList.remove('has-error', 'err-img-miss', 'err-name-miss', 'err-role-miss', 'err-quote-miss', 'err-quote-short');
        
        if (!hasImg) card.classList.add('err-img-miss');
        if (name === "") card.classList.add('err-name-miss');
        if (role === "") card.classList.add('err-role-miss');
        if (quote === "") {
            card.classList.add('err-quote-miss');
        } else if (words <= 5) {
            card.classList.add('err-quote-short');
        }
        
        if ([...card.classList].some(c => c.startsWith('err-'))) {
            card.classList.add('has-error');
            isValid = false;
        }
    });
    
    if (typeof swiperInstance !== 'undefined' && swiperInstance) {
        swiperInstance.updateAutoHeight();
    }
    
    return isValid;
}

// ==================== TEACHER CARD FUNCTIONS ====================

function buildFacultyCard(dataObj, cardIndex) {
    const defaultYears = (dataObj.years !== undefined && dataObj.years !== null) ? dataObj.years : "4";
    return `
        <div class="profile-card" id="facultyCard_${cardIndex}">
            <div class="image-zone" onclick="triggerFacultyUpload(${cardIndex})">
                <img src="" class="teacher-preview" id="facultyPreview_${cardIndex}">
                <div class="experience-badge" id="expBadge_${cardIndex}">
                    <i data-lucide="clock"></i>
                    <span id="badgeYears_${cardIndex}">${sanitizeText(defaultYears)} yrs</span>
                </div>
                <div class="upload-placeholder" id="placeholderZone_${cardIndex}">
                    <i data-lucide="camera"></i><br>
                    <span>Portrait</span>
                </div>
                <input type="file" id="facultyFile_${cardIndex}" hidden accept="image/*" onchange="processFacultyImage(this, ${cardIndex})">
            </div>
            <div class="field-error" data-error-group="image" id="imgErrorGroup_${cardIndex}">
                <div class="error-message" id="imgError_${cardIndex}">
                    <i data-lucide="alert-triangle"></i> Profile image required
                </div>
            </div>
            <div class="info-block">
                <div class="field-row" data-field-group="fullname">
                    <div class="field-icon"><i data-lucide="user"></i></div>
                    <div class="field-content">
                        <div class="editable-text teacher-name" contenteditable="true" id="facultyName_${cardIndex}">${sanitizeText(dataObj.name || "Educator Name")}</div>
                    </div>
                </div>
                <div class="field-error" data-error-group="fullname" id="nameErrorGroup_${cardIndex}">
                    <div class="error-message" id="nameError_${cardIndex}">
                        <i data-lucide="alert-triangle"></i> Name required
                    </div>
                </div>
                <div class="field-row" data-field-group="role">
                    <div class="field-icon"><i data-lucide="briefcase"></i></div>
                    <div class="field-content">
                        <div class="editable-text teacher-role" contenteditable="true" id="facultyRole_${cardIndex}">${sanitizeText(dataObj.role || "Lead Instructor")}</div>
                    </div>
                </div>
                <div class="field-error" data-error-group="role" id="roleErrorGroup_${cardIndex}">
                    <div class="error-message" id="roleError_${cardIndex}">
                        <i data-lucide="alert-triangle"></i> Role required
                    </div>
                </div>
                <div class="field-row" data-field-group="subject">
                    <div class="field-icon"><i data-lucide="book-marked"></i></div>
                    <div class="field-content">
                        <div class="editable-text subject-style" contenteditable="true" id="facultySubject_${cardIndex}">${sanitizeText(dataObj.subject || "Curriculum Expert")}</div>
                    </div>
                </div>
                <div class="field-error" data-error-group="subject" id="subjectErrorGroup_${cardIndex}">
                    <div class="error-message" id="subjectError_${cardIndex}">
                        <i data-lucide="alert-triangle"></i> Subject field required
                    </div>
                </div>
                <div class="field-row" data-field-group="years">
                    <div class="field-icon"><i data-lucide="calendar-days"></i></div>
                    <div class="field-content">
                        <div class="years-wrapper">
                            <span class="years-editable-chip editable-text" contenteditable="true" id="yearsChip_${cardIndex}">${sanitizeText(defaultYears)}</span>
                            <span style="font-size:0.75rem; color:var(--text-muted);">years of experience</span>
                        </div>
                    </div>
                </div>
                <div class="field-error" data-error-group="years" id="yearsErrorGroup_${cardIndex}">
                    <div class="error-message" id="yearsError_${cardIndex}">
                        <i data-lucide="alert-triangle"></i> Years must be 0-60 (numeric)
                    </div>
                </div>
                <div class="field-row" data-field-group="quote">
                    <div class="field-icon"><i data-lucide="quote"></i></div>
                    <div class="field-content">
                        <q class="editable-text quote-style" contenteditable="true" id="facultyQuote_${cardIndex}">${sanitizeText(dataObj.quote || "Inspire minds, transform futures.")}</q>
                    </div>
                </div>
                <div class="field-error" data-error-group="quote" id="quoteErrorGroup_${cardIndex}">
                    <div class="error-message" id="quoteError_${cardIndex}">
                        <i data-lucide="alert-triangle"></i> Quote required
                    </div>
                </div>
                <div class="rating-area" id="starContainer_${cardIndex}" data-current-rating="0">
                    <span class="star-icon" data-star-val="1">★</span>
                    <span class="star-icon" data-star-val="2">★</span>
                    <span class="star-icon" data-star-val="3">★</span>
                    <span class="star-icon" data-star-val="4">★</span>
                    <span class="star-icon" data-star-val="5">★</span>
                </div>
                <div class="rating-error" id="ratingError_${cardIndex}" style="display:none;">
                    <i data-lucide="alert-triangle"></i> Please rate this teacher
                </div>
                <input type="hidden" id="facultyRating_${cardIndex}" value="0">
            </div>
        </div>
    `;
}

function renderAllCards() {
    const gridContainer = document.getElementById('teacherGridContainer');
    if (!gridContainer) return;
    
    let htmlString = '';
    for (let i = 0; i < FACULTY_COUNT; i++) {
        htmlString += buildFacultyCard({}, i);
    }
    gridContainer.innerHTML = htmlString;
    
    for (let i = 0; i < FACULTY_COUNT; i++) {
        attachStarRating(i);
        attachYearsSyncAndValidation(i);
        attachLiveFieldTracking(i);
    }
    refreshLucideIcons();
}

function attachStarRating(cardIndex) {
    const starContainer = document.getElementById(`starContainer_${cardIndex}`);
    if (!starContainer) return;
    
    const stars = starContainer.querySelectorAll('.star-icon');
    const ratingHidden = document.getElementById(`facultyRating_${cardIndex}`);
    
    const updateStarsUI = (ratingVal) => {
        stars.forEach((star, idx) => {
            if (idx < ratingVal) star.classList.add('active-star');
            else star.classList.remove('active-star');
        });
        if (ratingHidden) ratingHidden.value = ratingVal;
        starContainer.setAttribute('data-current-rating', ratingVal);
    };
    
    updateStarsUI(0);

    stars.forEach(star => {
        star.addEventListener('click', (e) => {
            e.stopPropagation();
            const starValue = parseInt(star.getAttribute('data-star-val'));
            updateStarsUI(starValue);
            // Clear rating error state once a star is picked
            if (saveAttempted) {
                validateSingleField(cardIndex, 'rating');
                updateCardBorder(cardIndex);
            }
        });
    });
}

function attachYearsSyncAndValidation(cardIndex) {
    const yearsElement = document.getElementById(`yearsChip_${cardIndex}`);
    if (!yearsElement) return;
    
    const updateBadgeAndStore = () => {
        let raw = yearsElement.innerText.trim();
        if (raw === "") yearsElement.innerText = "0";
        let digits = raw.match(/\d+/);
        let cleanNumber = digits ? parseInt(digits[0]) : 0;
        if (isNaN(cleanNumber)) cleanNumber = 0;
        if (cleanNumber > 60) cleanNumber = 60;
        yearsElement.innerText = cleanNumber;
        
        const badgeSpan = document.getElementById(`badgeYears_${cardIndex}`);
        if (badgeSpan) {
            badgeSpan.innerText = `${cleanNumber} yr${cleanNumber !== 1 ? 's' : ''}`;
        }
        
        if (saveAttempted) {
            validateSingleField(cardIndex, 'years');
            updateCardBorder(cardIndex);
        }
    };
    
    yearsElement.addEventListener('input', () => {
        let raw = yearsElement.innerText;
        let numericPart = raw.replace(/[^\d]/g, '');
        if (numericPart !== raw) yearsElement.innerText = numericPart;
        updateBadgeAndStore();
    });
    
    yearsElement.addEventListener('blur', () => updateBadgeAndStore());
    updateBadgeAndStore();
}

function attachLiveFieldTracking(cardIndex) {
    const fields = ['facultyName', 'facultyRole', 'facultySubject', 'facultyQuote'];
    fields.forEach(fieldId => {
        const element = document.getElementById(`${fieldId}_${cardIndex}`);
        if (element) {
            element.addEventListener('input', () => {
                let fieldType = '';
                if (fieldId === 'facultyName') fieldType = 'fullname';
                else if (fieldId === 'facultyRole') fieldType = 'role';
                else if (fieldId === 'facultySubject') fieldType = 'subject';
                else if (fieldId === 'facultyQuote') fieldType = 'quote';
                
                if (fieldType) {
                    validateSingleField(cardIndex, fieldType);
                    updateCardBorder(cardIndex);
                }
            });
        }
    });
}

function validateSingleField(cardIndex, fieldType) {
    const card = document.getElementById(`facultyCard_${cardIndex}`);
    if (!card) return true;
    
    let isValid = true;
    
    if (fieldType === 'image') {
        const previewImg = document.getElementById(`facultyPreview_${cardIndex}`);
        const hasImage = previewImg && previewImg.src && previewImg.src.startsWith('data:');
        const errorGroup = document.getElementById(`imgErrorGroup_${cardIndex}`);
        isValid = hasImage;
        if (errorGroup) {
            if (!isValid && saveAttempted) errorGroup.classList.add('has-field-error');
            else errorGroup.classList.remove('has-field-error');
        }
    } else if (fieldType === 'fullname') {
        const nameElem = document.getElementById(`facultyName_${cardIndex}`);
        const nameVal = nameElem ? nameElem.innerText.trim() : '';
        const isValidName = nameVal !== "" && nameVal !== "Educator Name";
        const errorGroup = document.getElementById(`nameErrorGroup_${cardIndex}`);
        isValid = isValidName;
        if (errorGroup) {
            if (!isValid && saveAttempted) errorGroup.classList.add('has-field-error');
            else errorGroup.classList.remove('has-field-error');
        }
    } else if (fieldType === 'role') {
        const roleElem = document.getElementById(`facultyRole_${cardIndex}`);
        const roleVal = roleElem ? roleElem.innerText.trim() : '';
        const isValidRole = roleVal !== "" && roleVal !== "Lead Instructor";
        const errorGroup = document.getElementById(`roleErrorGroup_${cardIndex}`);
        isValid = isValidRole;
        if (errorGroup) {
            if (!isValid && saveAttempted) errorGroup.classList.add('has-field-error');
            else errorGroup.classList.remove('has-field-error');
        }
    } else if (fieldType === 'subject') {
        const subjectElem = document.getElementById(`facultySubject_${cardIndex}`);
        const subjectVal = subjectElem ? subjectElem.innerText.trim() : '';
        const isValidSub = subjectVal !== "" && subjectVal !== "Curriculum Expert";
        const errorGroup = document.getElementById(`subjectErrorGroup_${cardIndex}`);
        isValid = isValidSub;
        if (errorGroup) {
            if (!isValid && saveAttempted) errorGroup.classList.add('has-field-error');
            else errorGroup.classList.remove('has-field-error');
        }
    } else if (fieldType === 'quote') {
        const quoteElem = document.getElementById(`facultyQuote_${cardIndex}`);
        const quoteVal = quoteElem ? quoteElem.innerText.trim() : '';
        const isValidQuote = quoteVal !== "" && quoteVal !== "Inspire minds, transform futures.";
        const errorGroup = document.getElementById(`quoteErrorGroup_${cardIndex}`);
        isValid = isValidQuote;
        if (errorGroup) {
            if (!isValid && saveAttempted) errorGroup.classList.add('has-field-error');
            else errorGroup.classList.remove('has-field-error');
        }
    } else if (fieldType === 'years') {
        const yearsChip = document.getElementById(`yearsChip_${cardIndex}`);
        let yearsRaw = yearsChip ? yearsChip.innerText.trim() : "0";
        let yearsNum = parseInt(yearsRaw);
        const isValidYears = (!isNaN(yearsNum) && yearsNum >= 0 && yearsNum <= 60 && yearsRaw !== "");
        const errorGroup = document.getElementById(`yearsErrorGroup_${cardIndex}`);
        isValid = isValidYears;
        if (errorGroup) {
            if (!isValid && saveAttempted) errorGroup.classList.add('has-field-error');
            else errorGroup.classList.remove('has-field-error');
        }
    } else if (fieldType === 'rating') {
        const ratingHidden = document.getElementById(`facultyRating_${cardIndex}`);
        const starContainer = document.getElementById(`starContainer_${cardIndex}`);
        const errorEl = document.getElementById(`ratingError_${cardIndex}`);
        const ratingVal = parseInt(ratingHidden?.value || "0", 10);
        isValid = ratingVal > 0;
        if (starContainer) {
            if (!isValid && saveAttempted) {
                starContainer.classList.add('has-error');
                // Re-trigger CSS shake animation
                starContainer.classList.remove('shake-rating');
                void starContainer.offsetWidth;
                starContainer.classList.add('shake-rating');
            } else {
                starContainer.classList.remove('has-error', 'shake-rating');
            }
        }
        if (errorEl) {
            errorEl.style.display = (!isValid && saveAttempted) ? 'flex' : 'none';
        }
    }

    return isValid;
}

function updateCardBorder(cardIndex) {
    const card = document.getElementById(`facultyCard_${cardIndex}`);
    if (!card) return;
    
    const fields = ['image', 'fullname', 'role', 'subject', 'quote', 'years', 'rating'];
    let allValid = true;
    fields.forEach(f => {
        if (!validateSingleField(cardIndex, f)) allValid = false;
    });
    
    if (saveAttempted && !allValid) {
        card.classList.add('invalid-card');
    } else {
        card.classList.remove('invalid-card');
    }
    return allValid;
}

function isCardFullyValid(cardIndex) {
    const fields = ['image', 'fullname', 'role', 'subject', 'quote', 'years', 'rating'];
    for (let f of fields) {
        let fieldValid = false;
        if (f === 'image') {
            const previewImg = document.getElementById(`facultyPreview_${cardIndex}`);
            fieldValid = previewImg && previewImg.src && previewImg.src.startsWith('data:');
        } else if (f === 'fullname') {
            const nameElem = document.getElementById(`facultyName_${cardIndex}`);
            const nameVal = nameElem ? nameElem.innerText.trim() : '';
            fieldValid = nameVal !== "" && nameVal !== "Educator Name";
        } else if (f === 'role') {
            const roleElem = document.getElementById(`facultyRole_${cardIndex}`);
            const roleVal = roleElem ? roleElem.innerText.trim() : '';
            fieldValid = roleVal !== "" && roleVal !== "Lead Instructor";
        } else if (f === 'subject') {
            const subjectElem = document.getElementById(`facultySubject_${cardIndex}`);
            const subjectVal = subjectElem ? subjectElem.innerText.trim() : '';
            fieldValid = subjectVal !== "" && subjectVal !== "Curriculum Expert";
        } else if (f === 'quote') {
            const quoteElem = document.getElementById(`facultyQuote_${cardIndex}`);
            const quoteVal = quoteElem ? quoteElem.innerText.trim() : '';
            fieldValid = quoteVal !== "" && quoteVal !== "Inspire minds, transform futures.";
        } else if (f === 'years') {
            const yearsChip = document.getElementById(`yearsChip_${cardIndex}`);
            let yearsRaw = yearsChip ? yearsChip.innerText.trim() : "0";
            let yearsNum = parseInt(yearsRaw);
            fieldValid = (!isNaN(yearsNum) && yearsNum >= 0 && yearsNum <= 60 && yearsRaw !== "");
        } else if (f === 'rating') {
            const ratingHidden = document.getElementById(`facultyRating_${cardIndex}`);
            const ratingVal = parseInt(ratingHidden?.value || "0", 10);
            fieldValid = ratingVal > 0;
        }
        if (!fieldValid) return false;
    }
    return true;
}

window.processFacultyImage = function(inputEl, idx) {
    const file = inputEl.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const previewImg = document.getElementById(`facultyPreview_${idx}`);
            const placeholderDiv = document.getElementById(`placeholderZone_${idx}`);
            if (previewImg) {
                previewImg.src = ev.target.result;
                previewImg.style.display = 'block';
                if (placeholderDiv) placeholderDiv.style.display = 'none';
                
                if (saveAttempted) {
                    validateSingleField(idx, 'image');
                    updateCardBorder(idx);
                } else {
                    const errorGroup = document.getElementById(`imgErrorGroup_${idx}`);
                    if (errorGroup) errorGroup.classList.remove('has-field-error');
                }
                refreshLucideIcons();
            }
        };
        reader.readAsDataURL(file);
    }
};

window.triggerFacultyUpload = function(idx) {
    const fileInput = document.getElementById(`facultyFile_${idx}`);
    if (fileInput) fileInput.click();
};

function validateTeacherCards() {
    saveAttempted = true;
    
    for (let i = 0; i < FACULTY_COUNT; i++) {
        validateSingleField(i, 'image');
        validateSingleField(i, 'fullname');
        validateSingleField(i, 'role');
        validateSingleField(i, 'subject');
        validateSingleField(i, 'quote');
        validateSingleField(i, 'years');
        validateSingleField(i, 'rating');
        updateCardBorder(i);
    }
    
    let allValid = true;
    for (let i = 0; i < FACULTY_COUNT; i++) {
        if (!isCardFullyValid(i)) allValid = false;
    }
    
    if (!allValid) {
        const firstInvalidCard = document.querySelector('.profile-card.invalid-card');
        if (firstInvalidCard) {
            firstInvalidCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstInvalidCard.classList.add('shake-card-animation');
            setTimeout(() => firstInvalidCard.classList.remove('shake-card-animation'), 500);
        }
        return false;
    }
    
    return true;
}

// ==================== CALENDAR FUNCTIONS ====================

const calInputEl = document.getElementById('calInput');
const calDropdownEl = document.getElementById('calDropdown');
const gridCalendar = document.getElementById('calendarGrid');
const monthDisplay = document.getElementById('monthDisplay');
const dateTextEl = document.getElementById('selectedDateText');
let currentNavDate = new Date();
let selectedDate = null;
const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const weekdaysList = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function renderCalendar() {
    if (!gridCalendar) return;
    gridCalendar.innerHTML = '';
    const year = currentNavDate.getFullYear();
    const month = currentNavDate.getMonth();
    if (monthDisplay) monthDisplay.innerText = `${monthsList[month]} ${year}`;
    
    weekdaysList.forEach(day => {
        const el = document.createElement('div');
        el.className = 'weekday';
        el.innerText = day;
        gridCalendar.appendChild(el);
    });
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
        const el = document.createElement('div');
        el.className = 'day empty';
        gridCalendar.appendChild(el);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const el = document.createElement('div');
        el.className = 'day';
        el.innerText = i;
        if (new Date().toDateString() === new Date(year, month, i).toDateString()) el.classList.add('today');
        if (selectedDate && selectedDate.toDateString() === new Date(year, month, i).toDateString()) el.classList.add('selected');
        
        el.onclick = (e) => {
            e.stopPropagation();
            selectedDate = new Date(year, month, i);
            if (dateTextEl) {
                dateTextEl.innerText = selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                dateTextEl.classList.remove('is-placeholder');
                dateTextEl.classList.add('is-active');
            }
            if (calDropdownEl) calDropdownEl.classList.remove('show');
            if (calInputEl) calInputEl.style.borderColor = "var(--text-dim)";
            renderCalendar();
        };
        gridCalendar.appendChild(el);
    }
}

if (calInputEl) {
    calInputEl.onclick = (e) => {
        e.stopPropagation();
        document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
        if (calDropdownEl) {
            const isOpen = calDropdownEl.classList.toggle('show');
            calInputEl.style.borderColor = isOpen ? "var(--primary)" : "var(--text-dim)";
        }
    };
}

function toggleMenu(menuId) {
    const menu = document.getElementById(menuId);
    if (!menu) return;
    
    const wrapper = menu.closest('.custom-select-wrapper');
    const trigger = wrapper.querySelector('.select-trigger');
    
    if (calDropdownEl) calDropdownEl.classList.remove('show');
    if (calInputEl) calInputEl.style.borderColor = "var(--text-dim)";
    
    document.querySelectorAll('.custom-select-wrapper').forEach(w => {
        if (w !== wrapper) {
            w.classList.remove('open');
            const t = w.querySelector('.select-trigger');
            if (t) t.style.borderColor = "var(--text-dim)";
        }
    });
    
    const isOpen = wrapper.classList.toggle('open');
    trigger.style.borderColor = isOpen ? "var(--primary)" : "var(--text-dim)";
}

function selectValue(element, value, labelId, menuId) {
    const label = document.getElementById(labelId);
    const menu = document.getElementById(menuId);
    if (!menu || !label) return;
    
    const wrapper = menu.closest('.custom-select-wrapper');
    const trigger = wrapper.querySelector('.select-trigger');
    
    label.textContent = value;
    label.classList.remove('is-placeholder');
    label.classList.add('is-active');
    label.style.color = "#ffffff";
    
    if (menu) {
        menu.querySelectorAll('.option-item').forEach(opt => {
            opt.classList.remove('selected');
            opt.style.background = "";
            opt.style.color = "";
        });
        element.classList.add('selected');
    }
    
    wrapper.classList.remove('open');
    trigger.style.borderColor = "var(--text-dim)";
}

// ==================== UTILITY FUNCTIONS ====================

function validateETPhone(input) {
    input.value = input.value.replace(/\D/g, '');
    if (/^9\d{8}$/.test(input.value)) {
        input.style.borderColor = 'var(--accent-blue)';
    } else {
        input.style.borderColor = 'var(--error)';
    }
}

function handleStepZeroFile(input, statusId) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        input.dataset.filedata = e.target.result;
        input.dataset.filename = file.name;
        const label = document.getElementById(statusId);
        if (label) {
            label.innerText = `Attached: ${file.name} ✅`;
            label.style.color = "var(--success-green)";
        }
    };
    reader.readAsDataURL(file);
}

function toggleRow(checkbox, inputId, rowId) {
    const input = document.getElementById(inputId);
    const row = document.getElementById(rowId);
    
    if (checkbox.checked) {
        if (input) {
            input.disabled = false;
            input.focus();
        }
        if (row) row.classList.add('active');
    } else {
        if (input) {
            input.disabled = true;
            input.value = "";
        }
        if (row) row.classList.remove('active');
    }
}

// ==================== ID CARD MAPPER CLASS ====================

const TEXT_FIELDS = ["Full Name", "Grade", "Number", "Year", "Subcity", "Kebele", "House No", "Phone", "Contact Person", "Telephone", "Date", "Validity", "Signature"];
const ID_RATIO = 1.35;

class FormMapper {
    constructor() {
        this.store = { front: { img: null, lines: [], photo: null }, back: { img: null, lines: [], photo: null } };
        this.currentSide = 'front';
        this.isDrawing = false;
        this.startX = 0; this.startY = 0;
        this.tempShape = null;
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        if (!this.canvas || !this.ctx) return;
        this.bgImg = document.getElementById('bg-img');
        this.floatingMenu = document.getElementById('floating-menu');
        this.fieldSelect = document.getElementById('form-card');
        this.saveBtn = document.getElementById('save-btn');
        this.statusLabel = document.getElementById('status-label');
        this.modeIndicator = document.getElementById('mode-indicator');
        this.init();
    }
    
    init() {
        if (this.canvas) {
            this.canvas.addEventListener('mousedown', e => this.handleDown(e));
            this.canvas.addEventListener('mousemove', e => this.handleMove(e));
            this.canvas.addEventListener('mouseup', e => this.handleUp(e));
            this.canvas.addEventListener('dblclick', e => this.handleDblClick(e));
        }
        window.addEventListener('keydown', e => { if (e.key === 'Escape') this.resetDrawingState(); });
        if (this.saveBtn) this.saveBtn.addEventListener('click', () => this.validate());
        this.updateDropdown();
    }
    
    getCounts() {
        const fCount = this.store.front.lines.length;
        const bCount = this.store.back.lines.length;
        const photoExists = this.store.front.photo || this.store.back.photo;
        const totalLines = fCount + bCount;
        return { fCount, bCount, totalLines, photoExists, isFullyLocked: (totalLines === 13 && photoExists) };
    }
    
    updateDropdown() {
        if (!this.fieldSelect) return;
        const used = [...this.store.front.lines, ...this.store.back.lines].map(l => l.name);
        this.fieldSelect.innerHTML = '';
        TEXT_FIELDS.forEach(f => {
            const opt = document.createElement('option');
            opt.value = f;
            opt.textContent = f;
            opt.disabled = used.includes(f);
            this.fieldSelect.appendChild(opt);
        });
    }
    
    validate() {
        const { totalLines, photoExists, isFullyLocked } = this.getCounts();
        let msg = `Mapped: ${totalLines}/13 Inputs | Photo Area: ${photoExists ? '✅' : '❌'}`;
        if (this.statusLabel) this.statusLabel.innerHTML = msg;
        return isFullyLocked;
    }
    
    handleDown(e) {
        const { isFullyLocked } = this.getCounts();
        if (isFullyLocked || (this.floatingMenu && this.floatingMenu.style.display === 'flex')) return;
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        this.startX = e.clientX - rect.left;
        this.startY = e.clientY - rect.top;
        this.isDrawing = true;
    }
    
    handleMove(e) {
        if (!this.isDrawing) return;
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;
        const { totalLines } = this.getCounts();
        
        if (totalLines < 13) {
            this.tempShape = { type: 'line', x1: this.startX, x2: curX, y: this.startY };
        } else {
            let w = curX - this.startX;
            let h = Math.abs(w) * ID_RATIO;
            if (w < 0) {
                this.tempShape = { type: 'rect', x: this.startX + w, y: this.startY, w: Math.abs(w), h: h };
            } else {
                this.tempShape = { type: 'rect', x: this.startX, y: this.startY, w: w, h: h };
            }
        }
        this.draw();
    }
    
    handleUp(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        const { totalLines, photoExists } = this.getCounts();
        
        if (totalLines < 13) {
            if (this.tempShape && Math.abs(this.tempShape.x2 - this.startX) > 15) this.smartPosition();
            else this.resetDrawingState();
        } else if (!photoExists) {
            if (this.tempShape && Math.abs(this.tempShape.w) > 30) {
                this.store[this.currentSide].photo = { ...this.tempShape };
                this.tempShape = null;
                this.validate();
                this.draw();
            } else this.resetDrawingState();
        }
    }
    
    smartPosition() {
        const menu = this.floatingMenu;
        if (!menu || !this.tempShape) return;
        menu.style.display = 'flex';
        menu.style.visibility = 'hidden';
        const mWidth = menu.offsetWidth;
        const mHeight = menu.offsetHeight;
        menu.style.visibility = 'visible';
        const cWidth = this.canvas.width, cHeight = this.canvas.height;
        let left = Math.max(this.tempShape.x1, this.tempShape.x2) + 10;
        let top = this.tempShape.y - 15;
        
        if (left + mWidth > cWidth) left = Math.min(this.tempShape.x1, this.tempShape.x2) - mWidth - 10;
        if (left < 0 || left + mWidth > cWidth) left = (cWidth - mWidth) / 2;
        if (top + mHeight > cHeight) top = cHeight - mHeight - 10;
        if (top < 0) top = 10;
        
        menu.style.left = left + "px";
        menu.style.top = top + "px";
    }
    
    draw() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const data = this.store[this.currentSide];
        
        if (data.photo) {
            this.ctx.fillStyle = 'rgba(0, 255, 204, 0.1)';
            this.ctx.strokeStyle = '#00ffcc';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(data.photo.x, data.photo.y, data.photo.w, data.photo.h);
            this.ctx.fillRect(data.photo.x, data.photo.y, data.photo.w, data.photo.h);
            this.ctx.fillStyle = '#00ffcc';
            this.ctx.font = 'bold 9px Inter';
            this.ctx.fillText("ID PHOTO AREA", data.photo.x + 5, data.photo.y + 15);
        }
        
        data.lines.forEach(l => {
            this.ctx.strokeStyle = '#00a2ff';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(l.x1, l.y);
            this.ctx.lineTo(l.x2, l.y);
            this.ctx.stroke();
            this.ctx.fillStyle = '#00a2ff';
            const txt = l.name.toUpperCase();
            this.ctx.fillRect(Math.min(l.x1, l.x2), l.y - 18, this.ctx.measureText(txt).width + 8, 12);
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 8px Inter';
            this.ctx.fillText(txt, Math.min(l.x1, l.x2) + 4, l.y - 9);
        });
        
        if (this.tempShape) {
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            if (this.tempShape.type === 'line') {
                this.ctx.beginPath();
                this.ctx.moveTo(this.tempShape.x1, this.tempShape.y);
                this.ctx.lineTo(this.tempShape.x2, this.tempShape.y);
                this.ctx.stroke();
            } else {
                this.ctx.strokeRect(this.tempShape.x, this.tempShape.y, this.tempShape.w, this.tempShape.h);
            }
        }
    }
    
    confirmField() {
        const val = this.fieldSelect?.value;
        if (!val || !this.tempShape) return;
        this.store[this.currentSide].lines.push({ ...this.tempShape, name: val });
        this.tempShape = null;
        if (this.floatingMenu) this.floatingMenu.style.display = "none";
        this.updateDropdown();
        this.draw();
        this.validate();
    }
    
    resetDrawingState() {
        if (this.floatingMenu) this.floatingMenu.style.display = 'none';
        this.tempShape = null;
        this.isDrawing = false;
        this.draw();
    }
    
    handleDblClick(e) {
        if (!this.canvas) return;
        const rect = this.canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
        const data = this.store[this.currentSide];
        
        data.lines = data.lines.filter(l => !(Math.abs(cy - l.y) < 15 && cx >= Math.min(l.x1, l.x2) && cx <= Math.max(l.x1, l.x2)));
        if (data.photo && cx >= data.photo.x && cx <= data.photo.x + data.photo.w && cy >= data.photo.y && cy <= data.photo.y + data.photo.h) {
            data.photo = null;
        }
        this.updateDropdown();
        this.validate();
        this.draw();
        if (this.saveBtn) this.saveBtn.classList.remove('ready');
    }
    
    switchSide(side) {
        this.currentSide = side;
        document.querySelectorAll('.switch-btn').forEach(b => b.classList.toggle('active', b.id === `btn-${side}`));
        this.render();
    }
    
    handleFile(input) {
        if (input.files?.[0]) {
            const reader = new FileReader();
            reader.onload = e => {
                this.store[this.currentSide].img = e.target.result;
                this.render();
            };
            reader.readAsDataURL(input.files[0]);
        }
    }
    
    render() {
        const data = this.store[this.currentSide];
        if (data.img) {
            this.bgImg.src = data.img;
            this.bgImg.onload = () => {
                const dropZone = document.getElementById('drop-zone');
                const canvasWrap = document.getElementById('canvas-wrap');
                const actions = document.getElementById('actions');
                if (dropZone) dropZone.style.display = 'none';
                if (canvasWrap) canvasWrap.style.display = 'block';
                if (actions) actions.style.display = 'flex';
                this.canvas.width = this.bgImg.width;
                this.canvas.height = this.bgImg.height;
                this.draw();
                this.validate();
            };
        } else {
            const dropZone = document.getElementById('drop-zone');
            const canvasWrap = document.getElementById('canvas-wrap');
            const actions = document.getElementById('actions');
            if (dropZone) dropZone.style.display = 'flex';
            if (canvasWrap) canvasWrap.style.display = 'none';
            if (actions) actions.style.display = 'none';
        }
    }
}

// ==================== INITIALIZATION ====================

document.addEventListener("DOMContentLoaded", async () => {
    await renderProjects();
    window.app = new FormMapper();
    
    // Initialize gallery
    const assetGrid = document.getElementById("assetGrid");
    if (assetGrid) {
        const slots = ["Home Hero", "Brand Logo", "Gallery 1", "Gallery 2", "Gallery 3", "Gallery 4", "Gallery 5", "Gallery 6", "Male Uniform", "Female Uniform"];
        const noLabelSlots = ["Home Hero", "Brand Logo", "Male Uniform", "Female Uniform"];
        
        assetGrid.innerHTML = "";
        slots.forEach((name, i) => {
            const idx = i + 1;
            const hideLabel = noLabelSlots.includes(name);
            
            if (hideLabel) {
                assetGrid.innerHTML += `
                    <div class="upload-card" id="gallery-card-${idx}">
                        <div class="media-area longer" id="form-imageInput-${idx}" onclick="triggerInput(${idx})" style="z-index: 200;">
                            <img src="" class="preview-img" id="prev-${idx}" style="z-index: 200;">
                            <div class="placeholder-content" style="z-index: 200;">
                                <i class="fas fa-cloud-arrow-up"></i><br>
                                <span>${name}</span>
                            </div>
                            <input type="file" id="input-${idx}" hidden accept="image/*" onchange="handleFile(this,${idx})" style="z-index: 200;">
                        </div>
                        <div class="info-area">
                            <input type="hidden" id="form-labelInput-${idx}" value="${name}">
                            <p class="error-hint msg-img" id="err-image-${idx}">
                                <i class="fas fa-circle-exclamation"></i> Image required
                            </p>
                        </div>
                    </div>`;
            } else {
                assetGrid.innerHTML += `
                    <div class="upload-card" id="gallery-card-${idx}">
                        <div class="media-area" id="form-imageInput-${idx}" onclick="triggerInput(${idx})">
                            <img src="" class="preview-img" id="prev-${idx}">
                            <div class="placeholder-content">
                                <i class="fas fa-cloud-arrow-up"></i><br>
                                <span>${name}</span>
                            </div>
                            <input type="file" id="input-${idx}" hidden accept="image/*" onchange="handleFile(this,${idx})">
                        </div>
                        <div class="info-area" style="position: relative;">
                            <div class="input-wrap" style="position: relative; margin-bottom: 12px;">
                                <i data-lucide="tag" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-dim); z-index: 1;"></i>
                                <input type="text" class="label-input" id="form-labelInput-${idx}" 
                                       placeholder="Asset Label" oninput="updateLabel(${idx}, this.value)"
                                       style="padding-left: 36px;">
                            </div>
                            <div class="custom-select-wrapper" id="cat-wrapper-${idx}" style="margin-top: 8px;">
                                <div class="select-trigger" onclick="toggleCategorySelect(${idx})" id="toggleSelectOption-${idx}">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <i data-lucide="folder" style="width: 14px;"></i>
                                        <span id="cat-text-${idx}" class="select-text is-placeholder">Select Category</span>
                                    </div>
                                    <i data-lucide="chevron-down" class="chevron-icon"></i>
                                </div>
                                <div class="select-options" id="cat-menu-${idx}" style="z-index: 10000 !important;">
                                    <div class="option-item" onclick="selectCategory(${idx}, 'Event')">Event</div>
                                    <div class="option-item" onclick="selectCategory(${idx}, 'Sport')">Sport</div>
                                    <div class="option-item" onclick="selectCategory(${idx}, 'Academics')">Academics</div>
                                    <div class="option-item" onclick="selectCategory(${idx}, 'Art')">Art</div>
                                    <div class="option-item" onclick="selectCategory(${idx}, 'Technology')">Technology</div>
                                </div>
                            </div>
                            <input type="hidden" id="form-category-${idx}" value="">
                            <p class="error-hint msg-label" id="err-label-${idx}">
                                <i data-lucide="alert-circle" style="margin-right: 5px; transform: scale(0.8);"></i> Label required
                            </p>
                            <p class="error-hint msg-category" id="err-category-${idx}">
                                <i data-lucide="alert-circle" style="margin-right: 5px; transform: scale(0.8);"></i> Category required
                            </p>
                            <p class="error-hint msg-img" id="err-image-${idx}">
                                <i data-lucide="alert-circle" style="margin-right: 5px; transform: scale(0.8);"></i> Image required
                            </p>
                        </div>
                    </div>`;
            }
        });
        refreshLucideIcons();
    }
    
    // Initialize teacher cards
    if (document.getElementById('teacherGridContainer')) {
        renderAllCards();
    }
    
    // Initialize swiper
    updateSwiper();
    
    // Initialize branches
    updateBranchGrid();
    
    // Initialize calendar
    renderCalendar();
    
    // Setup dropzones
    const dropzones = document.querySelectorAll('.dropzone');
    dropzones.forEach(zone => {
        const input = zone.querySelector('.file-input-hidden');
        const info = zone.querySelector('.file-info');
        const nameSpan = zone.querySelector('.file-name');
        
        ['dragenter', 'dragover'].forEach(eName => {
            zone.addEventListener(eName, (e) => {
                e.preventDefault();
                zone.classList.add('dragover');
            });
        });
        
        ['dragleave', 'drop'].forEach(eName => {
            zone.addEventListener(eName, (e) => {
                e.preventDefault();
                zone.classList.remove('dragover');
            });
        });
        
        zone.addEventListener('drop', (e) => {
            if (input) input.files = e.dataTransfer.files;
            if (input && info && nameSpan && input.files.length > 0) {
                nameSpan.textContent = input.files.length === 1 ? input.files[0].name : `${input.files.length} files ready`;
                info.style.display = 'inline-block';
            }
        });
        
        if (input) {
            input.addEventListener('change', () => {
                if (input.files.length > 0 && info && nameSpan) {
                    nameSpan.textContent = input.files.length === 1 ? input.files[0].name : `${input.files.length} files ready`;
                    info.style.display = 'inline-block';
                }
            });
        }
    });
    
    // Setup file handlers for step 0
    const legalFile = document.getElementById('form-file');
    const dataFile = document.getElementById('form-data');
    if (legalFile) legalFile.addEventListener('change', () => handleStepZeroFile(legalFile, 'file-status-label'));
    if (dataFile) dataFile.addEventListener('change', () => handleStepZeroFile(dataFile, 'data-status-label'));
    
    refreshLucideIcons();
    
    // Reset saveAttempted after initial load
    setTimeout(() => {
        saveAttempted = false;
        for (let i = 0; i < FACULTY_COUNT; i++) {
            const groups = ['imgErrorGroup', 'nameErrorGroup', 'roleErrorGroup', 'subjectErrorGroup', 'yearsErrorGroup', 'quoteErrorGroup'];
            groups.forEach(grp => {
                const el = document.getElementById(`${grp}_${i}`);
                if (el) el.classList.remove('has-field-error');
            });
            const card = document.getElementById(`facultyCard_${i}`);
            if (card) card.classList.remove('invalid-card');
        }
    }, 200);
});

// Global click handler for closing dropdowns
document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select-wrapper')) {
        document.querySelectorAll('.custom-select-wrapper').forEach(wrapper => {
            wrapper.classList.remove('open');
            const trigger = wrapper.querySelector('.select-trigger');
            if (trigger) {
                trigger.style.borderColor = "var(--text-dim)";
                trigger.style.boxShadow = "none";
            }
        });
    }
    if (!e.target.closest('#calInput') && !e.target.closest('#calDropdown') && calDropdownEl) {
        calDropdownEl.classList.remove('show');
        if (calInputEl) calInputEl.style.borderColor = "var(--text-dim)";
    }
});

// Month navigation for calendar
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
if (prevMonthBtn) {
    prevMonthBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentNavDate.setMonth(currentNavDate.getMonth() - 1);
        renderCalendar();
    };
}
if (nextMonthBtn) {
    nextMonthBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentNavDate.setMonth(currentNavDate.getMonth() + 1);
        renderCalendar();
    };
}

// ==================== FAQ FUNCTIONALITY WITH DEXIE PERSISTENCE ====================

// Global FAQ variables
let faqs = [];
let nextId = 1;
let currentDisplayLimit = 10;
let currentEditId = null;
let dbReady = false;

// DOM elements
const faqNum1Input = document.getElementById('num1');
const faqNum2Input = document.getElementById('num2');
const faqNum3Input = document.getElementById('num3');
const faqNum4Input = document.getElementById('num4');
const faqContainer = document.getElementById('faqContainer');
const faqStatsSpan = document.getElementById('faqStats');
const faqSmartSortBtn = document.getElementById('smartSortBtn');
const faqResetAllBtn = document.getElementById('resetAllFaqsBtn');
const faqModal = document.getElementById('faqModal');
const faqModalTitle = document.getElementById('modalTitle');
const faqModalQuestion = document.getElementById('modalQuestion');
const faqModalAnswer = document.getElementById('modalAnswer');
const faqModalWeight = document.getElementById('modalCustomWeight');
const faqCloseModalBtn = document.getElementById('closeModalBtn');
const faqSaveModalBtn = document.getElementById('saveModalBtn');

// Helper functions
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function getIcon(name, size = 16) {
    const icons = {
        'help-circle': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
        'message-square': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
        'sliders': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="12" x2="14" y2="12"/><line x1="18" y1="16" x2="22" y2="16"/></svg>`,
        'hash': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>`,
        'pencil': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M4 20h16"/></svg>`,
        'trash': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 4V2h8v2"/></svg>`,
        'arrow-up': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
        'arrow-down': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/></svg>`,
        'plus': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
        'x': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
        'save': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
        'plus-circle': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
        'edit-2': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4-7 7H10v-4l7-7z"/><path d="M4 20h16"/></svg>`,
        'zap': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
        'trash-2': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 4V2h8v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`,
        'upload': `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`
    };
    return icons[name] || '';
}

// Toast notification
function showFaqToast(msg, isError = false, type = 'info') {
    let toast = document.createElement('div');
    toast.innerText = msg;
    
    let bgColor = '#1e293b';
    let borderColor = '#4f46e5';
    
    if (type === 'success') {
        bgColor = '#064e3b';
        borderColor = '#10b981';
    } else if (type === 'warning') {
        bgColor = '#451a03';
        borderColor = '#f59e0b';
    } else if (isError) {
        bgColor = '#450a0a';
        borderColor = '#f87171';
    }
    
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '20px';
    toast.style.background = bgColor;
    toast.style.color = '#e2e8f0';
    toast.style.padding = '10px 18px';
    toast.style.borderRadius = '40px';
    toast.style.fontSize = '0.85rem';
    toast.style.zIndex = '9999';
    toast.style.borderLeft = `3px solid ${borderColor}`;
    toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
    toast.style.fontWeight = '500';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
}

// ==================== FAQ RENDER FUNCTION ====================
function renderFaqs() {
    if (!faqContainer) return;
    let itemsToShow = [...faqs];
    let limitedList = itemsToShow.slice(0, currentDisplayLimit);
    
    if (limitedList.length === 0) {
        faqContainer.innerHTML = `<div class="empty-state">
            <div style="font-size: 3rem; margin-bottom: 0.8rem;">📭</div>
            <strong>No FAQs yet</strong><br>
            <span>Click <strong style="background:#4f46e5; padding:0.2rem 0.8rem; border-radius:30px; color:white; display:inline-flex; align-items:center; gap:4px;">➕ Add New FAQ</strong> to get started</span>
        </div>`;
        if (faqStatsSpan) faqStatsSpan.innerText = `0 / 0 items`;
        return;
    }

    faqContainer.innerHTML = limitedList.map((faq) => {
        const originalIndex = faqs.findIndex(f => f.id === faq.id);
        const isMoveUpDisabled = originalIndex === 0;
        const isMoveDownDisabled = originalIndex === faqs.length - 1;
        return `
            <div class="faq-card" data-id="${faq.id}">
                <div class="faq-question">
                    ${getIcon('help-circle', 20)}
                    <span>${escapeHtml(faq.question)}</span>
                </div>
                <div class="faq-answer">
                    ${getIcon('message-square', 16)}
                    <span>${escapeHtml(faq.answer)}</span>
                </div>
                <div class="faq-meta">
                    <span class="badge">${getIcon('sliders', 12)} weight: ${faq.weight}</span>
                    <span class="badge">${getIcon('hash', 12)} id: ${faq.id}</span>
                </div>
                <div class="card-actions">
                    <button class="icon-btn edit" data-id="${faq.id}">${getIcon('pencil', 12)} Edit</button>
                    <button class="icon-btn delete" data-id="${faq.id}">${getIcon('trash', 12)} Del</button>
                    <button class="icon-btn move-up" data-id="${faq.id}" ${isMoveUpDisabled ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>${getIcon('arrow-up', 12)} Up</button>
                    <button class="icon-btn move-down" data-id="${faq.id}" ${isMoveDownDisabled ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>${getIcon('arrow-down', 12)} Down</button>
                </div>
            </div>
        `;
    }).join('');
    
    if (faqStatsSpan) faqStatsSpan.innerText = `${limitedList.length} / ${faqs.length} items (limit: ${currentDisplayLimit})`;
    
    // Attach event listeners
    document.querySelectorAll('#faqContainer .icon-btn.edit').forEach(btn => {
        btn.removeEventListener('click', handleFaqEdit);
        btn.addEventListener('click', handleFaqEdit);
    });
    document.querySelectorAll('#faqContainer .icon-btn.delete').forEach(btn => {
        btn.removeEventListener('click', handleFaqDelete);
        btn.addEventListener('click', handleFaqDelete);
    });
    document.querySelectorAll('#faqContainer .icon-btn.move-up').forEach(btn => {
        if (!btn.hasAttribute('disabled')) {
            btn.removeEventListener('click', handleFaqMoveUp);
            btn.addEventListener('click', handleFaqMoveUp);
        }
    });
    document.querySelectorAll('#faqContainer .icon-btn.move-down').forEach(btn => {
        if (!btn.hasAttribute('disabled')) {
            btn.removeEventListener('click', handleFaqMoveDown);
            btn.addEventListener('click', handleFaqMoveDown);
        }
    });
}

// Event handlers
function handleFaqEdit(e) {
    const id = e.currentTarget.getAttribute('data-id');
    openFaqEditModal(id);
}

function handleFaqDelete(e) {
    const id = e.currentTarget.getAttribute('data-id');
    deleteFaqById(id);
}

function handleFaqMoveUp(e) {
    const id = e.currentTarget.getAttribute('data-id');
    moveFaq(id, 'up');
}

function handleFaqMoveDown(e) {
    const id = e.currentTarget.getAttribute('data-id');
    moveFaq(id, 'down');
}

// ==================== FAQ CRUD OPERATIONS ====================
function moveFaq(id, direction) {
    const index = faqs.findIndex(f => f.id === id);
    if (index === -1) return;
    if (direction === 'up' && index > 0) {
        [faqs[index - 1], faqs[index]] = [faqs[index], faqs[index - 1]];
    } else if (direction === 'down' && index < faqs.length - 1) {
        [faqs[index + 1], faqs[index]] = [faqs[index], faqs[index + 1]];
    } else {
        return;
    }
    renderFaqs();
    saveAllFaqsToDB();
}

function deleteFaqById(id) {
    if (confirm("Delete this FAQ permanently?")) {
        faqs = faqs.filter(f => f.id !== id);
        renderFaqs();
        deleteFaqFromDB(id);
        showFaqToast("FAQ deleted", false, 'success');
    }
}

function openFaqEditModal(id) {
    const faq = faqs.find(f => f.id === id);
    if (!faq) return;
    currentEditId = id;
    if (faqModalTitle) faqModalTitle.innerHTML = `${getIcon('edit-2', 18)} Edit FAQ`;
    if (faqModalQuestion) faqModalQuestion.value = faq.question;
    if (faqModalAnswer) faqModalAnswer.value = faq.answer;
    if (faqModalWeight) faqModalWeight.value = faq.weight;
    if (faqModal) faqModal.style.display = 'flex';
}

function openFaqAddModal() {
    currentEditId = null;
    if (faqModalTitle) faqModalTitle.innerHTML = `${getIcon('plus-circle', 18)} Add New FAQ`;
    if (faqModalQuestion) faqModalQuestion.value = '';
    if (faqModalAnswer) faqModalAnswer.value = '';
    if (faqModalWeight) faqModalWeight.value = 5;
    if (faqModal) faqModal.style.display = 'flex';
}

function saveFaqFromModal() {
    const question = faqModalQuestion ? faqModalQuestion.value.trim() : '';
    const answer = faqModalAnswer ? faqModalAnswer.value.trim() : '';
    if (!question || !answer) {
        alert("Please fill both question and answer.");
        return;
    }
    let weight = parseInt(faqModalWeight ? faqModalWeight.value : 5);
    if (isNaN(weight)) weight = 0;

    if (currentEditId) {
        const index = faqs.findIndex(f => f.id === currentEditId);
        if (index !== -1) {
            faqs[index].question = question;
            faqs[index].answer = answer;
            faqs[index].weight = weight;
            saveFaqToDB(faqs[index]);
            showFaqToast("FAQ updated", false, 'success');
        }
    } else {
        let insertPos = faqNum3Input ? parseInt(faqNum3Input.value) : faqs.length;
        if (isNaN(insertPos)) insertPos = faqs.length;
        insertPos = Math.max(0, Math.min(insertPos, faqs.length));
        const newFaq = {
            id: String(nextId++),
            question: question,
            answer: answer,
            weight: weight
        };
        faqs.splice(insertPos, 0, newFaq);
        saveFaqToDB(newFaq);
        showFaqToast("FAQ added", false, 'success');
    }
    closeFaqModal();
    renderFaqs();
}

function closeFaqModal() {
    if (faqModal) faqModal.style.display = 'none';
    currentEditId = null;
}

function smartSortFaqs() {
    if (faqs.length === 0) {
        alert("No FAQs to sort. Add some first.");
        return;
    }
    let priorityFactor = faqNum1Input ? parseFloat(faqNum1Input.value) : 1;
    let offset = faqNum4Input ? parseFloat(faqNum4Input.value) : 0;
    if (isNaN(priorityFactor)) priorityFactor = 1;
    if (isNaN(offset)) offset = 0;
    
    faqs.sort((a, b) => {
        const scoreA = (priorityFactor * a.weight) + offset;
        const scoreB = (priorityFactor * b.weight) + offset;
        if (scoreA !== scoreB) return scoreB - scoreA;
        return b.weight - a.weight;
    });
    renderFaqs();
    saveAllFaqsToDB();
    showFaqToast(`Sorted and saved! (${priorityFactor} × weight + ${offset})`, false, 'success');
}

function resetAllFaqs() {
    if (faqs.length > 0 && confirm("Delete ALL FAQs? This cannot be undone.")) {
        faqs = [];
        nextId = 1;
        renderFaqs();
        saveAllFaqsToDB();
        showFaqToast("All FAQs cleared", false, 'warning');
    } else if (faqs.length === 0) {
        alert("No FAQs to clear.");
    }
}

// ==================== LOCAL STORAGE ONLY (No Dexie) ====================
// Simplified approach - use only localStorage to avoid Dexie conflicts

function loadFaqsFromLocalStorage() {
    try {
        const saved = localStorage.getItem('faqs_data');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                faqs = parsed;
                nextId = Math.max(...parsed.map(f => parseInt(f.id)), 0) + 1;
                renderFaqs();
                console.log(`✅ Loaded ${faqs.length} FAQs from localStorage`);
                return true;
            }
        }
    } catch (e) {
        console.warn("localStorage load failed", e);
    }
    
    // Add demo FAQs if empty
    if (faqs.length === 0) {
        faqs = [
            { id: '1', question: "What is the purpose of the 4 number inputs?", answer: "They control sorting priority, display limit, insertion index, and sorting offset — giving you dynamic control over how FAQs are listed.", weight: 10 },
            { id: '2', question: "How does Input 1 (Priority) work?", answer: "When you click 'Smart Sort', each FAQ gets a combined sort key: (Input1 + weight) + Input4. Higher value = higher position.", weight: 5 },
            { id: '3', question: "What does Display Limit (Input 2) do?", answer: "It restricts the number of visible FAQs on screen. Great for previewing top K entries.", weight: 8 },
            { id: '4', question: "Can I reorder FAQs manually?", answer: "Yes! Use the ↑ and ↓ buttons on each card, or use Input 3 to insert at a specific position when adding.", weight: 3 },
            { id: '5', question: "How to edit or remove a FAQ?", answer: "Each card has Edit ✏️ and Delete 🗑️ buttons. You can also clone the weight logic.", weight: 7 }
        ];
        nextId = 6;
        renderFaqs();
        saveFaqsToLocalStorage();
        console.log("📝 Added demo FAQs");
    }
    return false;
}

function saveFaqsToLocalStorage() {
    try {
        localStorage.setItem('faqs_data', JSON.stringify(faqs));
        localStorage.setItem('faqs_nextId', nextId);
        console.log(`💾 Saved ${faqs.length} FAQs to localStorage`);
    } catch (e) {
        console.warn("localStorage save failed", e);
    }
}

function saveAllFaqsToDB() {
    saveFaqsToLocalStorage();
}

function saveFaqToDB(faq) {
    saveFaqsToLocalStorage();
}

function deleteFaqFromDB(id) {
    saveFaqsToLocalStorage();
}

// ==================== EXPORT/IMPORT ====================
function exportFaqsToJSON() {
    const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0',
        faqs: faqs,
        settings: { displayLimit: currentDisplayLimit }
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `faqs_export_${new Date().toISOString().slice(0,19)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showFaqToast(`Exported ${faqs.length} FAQs`, false, 'success');
}

function importFaqsFromJSON(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            let importedFaqs = imported.faqs || imported;
            
            if (Array.isArray(importedFaqs)) {
                faqs = importedFaqs.map((f, idx) => ({
                    id: f.id || String(idx + 1),
                    question: f.question,
                    answer: f.answer,
                    weight: f.weight || 5
                }));
                nextId = Math.max(...faqs.map(f => parseInt(f.id)), 0) + 1;
                renderFaqs();
                saveAllFaqsToDB();
                showFaqToast(`Imported ${faqs.length} FAQs!`, false, 'success');
            } else {
                alert("Invalid FAQ format. Please provide a valid JSON array.");
            }
        } catch (error) {
            console.error("Import error:", error);
            alert("Error parsing JSON file. Please check the format.");
        }
    };
    reader.readAsText(file);
}

// ==================== SETUP UI BUTTONS ====================
const faqAddBtn = document.createElement('button');
faqAddBtn.innerHTML = `${getIcon('plus', 14)} Add New FAQ`;
faqAddBtn.className = 'btn btn-primary';
faqAddBtn.style.marginLeft = 'auto';
faqAddBtn.addEventListener('click', openFaqAddModal);

const faqSaveAllBtn = document.createElement('button');
faqSaveAllBtn.innerHTML = `${getIcon('save', 14)} Save All`;
faqSaveAllBtn.className = 'btn btn-secondary';
faqSaveAllBtn.style.marginLeft = '10px';
faqSaveAllBtn.addEventListener('click', async () => {
    await saveAllFaqsToDB();
    showFaqToast("All FAQs saved!", false, 'success');
});

const faqExportBtn = document.createElement('button');
faqExportBtn.innerHTML = `${getIcon('save', 14)} Export`;
faqExportBtn.className = 'btn btn-outline';
faqExportBtn.style.marginLeft = '10px';
faqExportBtn.addEventListener('click', exportFaqsToJSON);

const faqImportInput = document.createElement('input');
faqImportInput.type = 'file';
faqImportInput.accept = '.json';
faqImportInput.style.display = 'none';
faqImportInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        importFaqsFromJSON(e.target.files[0]);
    }
    faqImportInput.value = '';
});

const faqImportBtn = document.createElement('button');
faqImportBtn.innerHTML = `${getIcon('upload', 14)} Import`;
faqImportBtn.className = 'btn btn-outline';
faqImportBtn.style.marginLeft = '10px';
faqImportBtn.addEventListener('click', () => faqImportInput.click());

const faqTitleDiv = document.querySelector('.app-container .section-title');
if (faqTitleDiv) {
    faqTitleDiv.appendChild(faqAddBtn);
    faqTitleDiv.appendChild(faqSaveAllBtn);
    faqTitleDiv.appendChild(faqExportBtn);
    faqTitleDiv.appendChild(faqImportBtn);
    document.body.appendChild(faqImportInput);
}

// ==================== EVENT LISTENERS ====================
if (faqSmartSortBtn) faqSmartSortBtn.addEventListener('click', smartSortFaqs);
if (faqResetAllBtn) faqResetAllBtn.addEventListener('click', resetAllFaqs);
if (faqCloseModalBtn) faqCloseModalBtn.addEventListener('click', closeFaqModal);
if (faqSaveModalBtn) faqSaveModalBtn.addEventListener('click', saveFaqFromModal);
if (faqModal) {
    window.addEventListener('click', (e) => { if (e.target === faqModal) closeFaqModal(); });
}

// Update button icons
if (faqSmartSortBtn) faqSmartSortBtn.innerHTML = `${getIcon('zap', 14)} Smart Sort (Input 1+4)`;
if (faqResetAllBtn) faqResetAllBtn.innerHTML = `${getIcon('trash-2', 14)} Clear All FAQs`;
if (faqCloseModalBtn) faqCloseModalBtn.innerHTML = `${getIcon('x', 14)} Cancel`;
if (faqSaveModalBtn) faqSaveModalBtn.innerHTML = `${getIcon('save', 14)} Save`;

// ==================== INITIALIZATION ====================
function initFaqSystem() {
    if (faqNum2Input) {
        let initLimit = parseInt(faqNum2Input.value);
        if (isNaN(initLimit)) initLimit = 10;
        currentDisplayLimit = initLimit;
    }
    
    // Load FAQs from localStorage only (simplified, no Dexie conflicts)
    loadFaqsFromLocalStorage();
}

// Auto-save before page unload
window.addEventListener('beforeunload', () => {
    saveFaqsToLocalStorage();
});

// Start the FAQ system
initFaqSystem();

// Expose global functions
window.handleOpenModal = handleOpenModal;
window.navigateStep = navigateStep;
window.goTo = goTo;
window.handleCloseModal = handleCloseModal;
window.filterProjects = filterProjects;
window.deleteProject = deleteProject;
window.launchProject = launchProject;
window.validateETPhone = validateETPhone;
window.toggleRow = toggleRow;
window.handleStepZeroFile = handleStepZeroFile;
window.toggleMenu = toggleMenu;
window.selectValue = selectValue;
window.updateSwiper = updateSwiper;
window.validateFull = validateFull;
window.triggerUpload = triggerUpload;
window.previewImage = previewImage;
window.validateTeacherCards = validateTeacherCards;
window.handleCountChange = handleCountChange;
window.updateBranchGrid = updateBranchGrid;
window.toggleDrop = toggleDrop;

async function debugSavedData() {
    const projects = await db.projects.toArray();
    console.log("=== ALL SAVED PROJECTS ===");
    projects.forEach(p => {
        console.log(`Project ID: ${p.id}, Name: ${p["form-name"]}`);
        console.log("Facilities data:", p.facilities);
        console.log("FAQs data:", p.faqs);
        console.log("Images count:", p.images?.length);
    });
}
