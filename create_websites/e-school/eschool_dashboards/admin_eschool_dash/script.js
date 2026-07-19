// Function to add a question card
function createCard(type) {
    const count = document.getElementById('optCount').value;
    const builderArea = document.getElementById('builderArea');
    
    const card = document.createElement('div');
    card.className = 'card question-card';
    card.setAttribute('data-type', type);

    let content = `<span class="remove-link" onclick="this.parentElement.remove()">REMOVE</span>`;
    content += `<input type="text" class="q-title" placeholder="Untitled Question">`;

    if (type !== 'text') {
        content += `<div style="margin-top:15px">`;
        for (let i = 1; i <= count; i++) {
            content += `
                <div style="margin-bottom:8px; display:flex; align-items:center; gap:10px;">
                    <input type="${type}" disabled>
                    <input type="text" class="opt-val" placeholder="Option ${i}">
                </div>`;
        }
        content += `</div>`;
    } else {
        content += `<input type="text" disabled placeholder="Short answer text" style="opacity:0.3; border-bottom: 1px dashed #334155; margin-top:15px;">`;
    }

    card.innerHTML = content;
    builderArea.appendChild(card);
}

// Function to generate the live form in a new tab
function generatePreview() {
    const title = document.getElementById('mainTitle').value;
    const desc = document.getElementById('mainDesc').value;
    const questions = document.querySelectorAll('.question-card');

    let formHTML = "";

    questions.forEach((q, idx) => {
        const qTitle = q.querySelector('.q-title').value || "Untitled Question";
        const type = q.getAttribute('data-type');
        
        formHTML += `<div style="background:#1e293b; padding:25px; border-radius:12px; margin-bottom:15px; border:1px solid #334155;">
                        <span style="font-weight:600; display:block; margin-bottom:15px;">${qTitle}</span>`;
        
        if (type === 'text') {
            formHTML += `<input type="text" placeholder="Your answer" style="width:100%; background:transparent; border:none; border-bottom:1px solid #334155; color:white; outline:none; padding:10px 0;">`;
        } else {
            const opts = q.querySelectorAll('.opt-val');
            opts.forEach(o => {
                const val = o.value || "Option";
                formHTML += `
                    <label style="display:block; margin:10px 0; color:#94a3b8; cursor:pointer;">
                        <input type="${type}" name="q${idx}"> ${val}
                    </label>`;
            });
        }
        formHTML += `</div>`;
    });

    const fullDoc = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
            <style>
                body { background:#0b1120; color:white; font-family:'Poppins'; padding:50px 20px; display:flex; justify-content:center; }
                .wrapper { width:100%; max-width:600px; }
                .head { background:#1e293b; padding:25px; border-radius:12px; margin-bottom:15px; border-top:8px solid #38bdf8; border-left:1px solid #334155; border-right:1px solid #334155; border-bottom:1px solid #334155; }
                h1 { color:#38bdf8; margin:0; }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="head"><h1>${title}</h1><p>${desc}</p></div>
                ${formHTML}
            </div>
        </body>
        </html>`;

    const blob = new Blob([fullDoc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

// Event Listeners
document.getElementById('addText').addEventListener('click', () => createCard('text'));
document.getElementById('addRadio').addEventListener('click', () => createCard('radio'));
document.getElementById('addCheck').addEventListener('click', () => createCard('checkbox'));
document.getElementById('previewBtn').addEventListener('click', generatePreview);