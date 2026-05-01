// App State
let balance = parseFloat(localStorage.getItem('hamkor_balance')) || 500000;
let history = JSON.parse(localStorage.getItem('hamkor_history')) || [
    { type: 'transfer', title: 'XALIMJONOV S.', amount: -40000, date: '28.04.2026 03:59', icon: 'icon-transfer' },
    { type: 'payment', title: 'Korzinka.uz', amount: -15000, date: 'Kecha, 18:20', icon: 'icon-payment' }
];
let currentPin = '';
let isTechnicalLocked = localStorage.getItem('hamkor_locked') === 'true';

// Navigation
function showPage(pageId) {
    if (pageId === 'page-monitoring') {
        triggerTechnicalWorks();
        return;
    }

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    const nav = document.getElementById('bottom-nav');
    if (pageId === 'page-login') {
        nav.style.display = 'none';
    } else {
        nav.style.display = 'flex';
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        if (pageId === 'page-dashboard') document.querySelectorAll('.nav-item')[0].classList.add('active');
        if (pageId === 'page-transfer') document.querySelectorAll('.nav-item')[1].classList.add('active');
    }
}

// PIN Logic
function pressPin(num) {
    if (currentPin.length < 4) {
        currentPin += num;
        updatePinDots();
        
        if (currentPin.length === 4) {
            setTimeout(() => {
                if (currentPin === '5555') {
                    isTechnicalLocked = false;
                    localStorage.setItem('hamkor_locked', 'false');
                    showPage('page-dashboard');
                    updateUI();
                } else if (currentPin === '0000') {
                    if (isTechnicalLocked) {
                        showMaintenance('Iltimos kuting, texnik ishlar davom etmoqda...');
                    } else {
                        showPage('page-dashboard');
                        updateUI();
                    }
                } else {
                    alert('Noto\'g\'ri PIN-kod!');
                    clearPin();
                }
            }, 300);
        }
    }
}

function triggerTechnicalWorks() {
    isTechnicalLocked = true;
    localStorage.setItem('hamkor_locked', 'true');
    showMaintenance('Ilova qotib qoldi... Texnik ishlar olib borilmoqda. Iltimos, birozdan so\'ng qayta kiring.');
    setTimeout(() => {
        location.reload(); // Force restart to login page
    }, 3000);
}

function showMaintenance(msg) {
    document.getElementById('maintenance-msg').innerText = msg;
    document.getElementById('maintenance-overlay').style.display = 'flex';
}

function closeMaintenance() {
    document.getElementById('maintenance-overlay').style.display = 'none';
    clearPin();
}

// Reset App (Bell Icon)
document.querySelector('.notif-icon').onclick = function() {
    if (confirm('Barcha ma\'lumotlar va tarix tozalansinmi?')) {
        balance = 500000;
        history = [
            { type: 'transfer', title: 'XALIMJONOV S.', amount: -40000, date: '28.04.2026 03:59', icon: 'icon-transfer' }
        ];
        updateUI();
        alert('Ilova avvalgi holatiga qaytarildi.');
    }
};

function updatePinDots() {
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
        if (i < currentPin.length) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

function clearPin() {
    currentPin = '';
    updatePinDots();
}

// UI Updates
function updateUI() {
    document.getElementById('main-balance').innerText = balance.toLocaleString('uz-UZ') + ".00 so'm";
    renderHistory();
    localStorage.setItem('hamkor_balance', balance);
    localStorage.setItem('hamkor_history', JSON.stringify(history));
}

function renderHistory() {
    const dashContainer = document.getElementById('dashboard-history');
    const monContainer = document.getElementById('monitoring-history');
    
    const html = history.map(item => `
        <div class="history-item">
            <div class="item-left">
                <div class="item-icon ${item.icon || 'icon-transfer'}">
                    ${item.title.substring(0, 2)}
                </div>
                <div class="item-info">
                    <h4>${item.title}</h4>
                    <p>${item.date}</p>
                </div>
            </div>
            <div class="item-amount" style="color: ${item.amount > 0 ? '#10B981' : '#1C1E21'}; font-weight: 700;">
                ${item.amount > 0 ? '+' : ''}${item.amount.toLocaleString('uz-UZ')}
            </div>
        </div>
    `).join('');

    if (dashContainer) dashContainer.innerHTML = html;
    if (monContainer) monContainer.innerHTML = html;
}

// Transfer Flow
function selectRecipient(name, card) {
    document.getElementById('target-name').innerText = name;
    document.getElementById('target-card').innerText = card;
    document.getElementById('amount-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('amount-modal').style.display = 'none';
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function processTransfer() {
    const amountInput = document.getElementById('transfer-amount');
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert('Iltimos, summani kiriting');
        return;
    }

    if (amount > balance) {
        alert('Mablag\' yetarli emas');
        return;
    }

    closeModal();
    document.getElementById('loader').style.display = 'flex';

    // Simulation
    setTimeout(() => {
        balance -= amount;
        const now = new Date();
        const dateStr = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth()+1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const transId = generateUUID();

        // Update Receipt
        document.getElementById('rec-amount').innerText = amount.toLocaleString('uz-UZ');
        document.getElementById('rec-date').innerText = dateStr;
        document.getElementById('rec-id').innerText = transId;

        // Add to history
        history.unshift({
            type: 'transfer',
            title: document.getElementById('target-name').innerText,
            amount: -amount,
            date: dateStr,
            icon: 'icon-transfer'
        });

        document.getElementById('loader').style.display = 'none';
        updateUI();
        document.getElementById('success-overlay').style.display = 'flex';
    }, 2500);
}

// Card Number Formatting
document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'transfer-amount') return;
    if (e.target && e.target.tagName === 'INPUT') {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = '';
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) formattedValue += ' ';
            formattedValue += value[i];
        }
        e.target.value = formattedValue.substring(0, 19);
    }
});

function finishTransfer() {
    document.getElementById('success-overlay').style.display = 'none';
    document.getElementById('transfer-amount').value = '';
    showPage('page-dashboard');
}

function shareReceipt() {
    if (navigator.share) {
        navigator.share({
            title: 'Hamkor Bank Cheki',
            text: 'Muvaffaqiyatli o\'tkazma cheki',
            url: window.location.href
        }).catch(() => {});
    } else {
        alert('Chek nusxasi nusxalandi (Simulyatsiya)');
    }
}

// Init
showPage('page-login');
updateUI();
