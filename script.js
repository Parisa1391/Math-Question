const App = {
    state: {
        score: 0, coins: 0, lives: 3, time: 0, maxTime: 0,
        correct: 0, mode: '', timer: null, frozen: false,
        xp: parseInt(localStorage.getItem('math_xp_v2')) || 0
    },

    // سوالات تئوری برای سطح پیشرفته
    theory: [
        { q: "مجموع زوایای داخلی یک مثلث چند درجه است؟", a: 180 },
        { q: "یک لوزی چند خط تقارن دارد؟", a: 2 },
        { q: "کوچکترین عدد اول کدام است؟", a: 2 },
        { q: "مجموع زوایای داخلی یک چهارضلعی چند درجه است؟", a: 360 },
        { q: "جذر عدد ۱۴۴ چند است؟", a: 12 },
        { q: "محیط دایره با شعاع ۱ چند است؟ (π ≈ ۳)", a: 6 },
        { q: "مجموع زوایای داخلی یک شش‌ضلعی منتظم؟", a: 720 },
        { q: "حاصل ۳ به توان ۴ چند می‌شود؟", a: 81 },
        { q: "تعداد یال‌های یک مکعب چند عدد است؟", a: 12 },
        { q: "اگر ۲x + ۵ = ۱۱ باشد، مقدار x چند است؟", a: 3 },
        { q: "عدد اول بین ۲۰ و ۲۵ کدام است؟", a: 23 },
        { q: "مجموع اعداد اول ۱ تا ۱۰ چند می‌شود؟", a: 17 },
        { q: "قرینه عدد (۱۵-) نسبت به صفر؟", a: 15 },
        { q: "مساحت مثلثی با قاعده ۱۰ و ارتفاع ۵؟", a: 25 },
        { q: "تعداد قطر‌های یک مثلث چند است؟", a: 0 },
        { q: "یک استوانه چند راس دارد؟", a: 0 },
        { q: "مکمل زاویه ۳۰ درجه چند درجه است؟", a: 150 },
        { q: "متمم زاویه ۴۵ درجه چند درجه است؟", a: 45 },
        { q: "حاصل عبارت |۸- | + |۵-| چند است؟", a: 13 },
        { q: "شیب خط y = 3x + 2 کدام است؟", a: 3 },
        { q: "اگر شعاع دایره ۳ برابر شود، محیط چند برابر می‌شود؟", a: 3 },
        { q: "مجموع زوایای خارجی هر n ضلعی چند درجه است؟", a: 360 },
        { q: "نیمی از زاویه قائمه چند درجه است؟", a: 45 },
        { q: "حاصل (-۲) به توان ۳ چند است؟", a: -8 },
        { q: "بزرگترین عدد صحیح منفی چند است؟", a: -1 },
        { q: "تعداد وجه‌های یک هرم با قاعده مربعی؟", a: 5 },
        { q: "ریشه سوم عدد ۲۷ چند است؟", a: 3 },
        { q: "زاویه بین دو عقربه ساعت در ساعت ۳:۰۰؟", a: 90 },
        { q: "کدام عدد نه اول است و نه مرکب؟", a: 1 },
        { q: "مجموع زوایای داخلی یک پنج‌ضلعی؟", a: 540 },
        { q: "مقدار x در معادله ۲x/۳ = ۴؟", a: 6 },
        { q: "حاصل ۵۰ درصدِ عدد ۱۲۰؟", a: 60 },
        { q: "تعداد اعداد اول تک‌رقمی؟", a: 4 },
        { q: "اگر طول مکعبی ۲ برابر شود، حجم چند برابر می‌شود؟", a: 8 },
        { q: "ساده شده کسر ۱۸/۴۸؟ (مخرج کسر)", a: 8 }
    ]
};

function init() {
    document.getElementById('best-easy').innerText = localStorage.getItem('best_easy') || 0;
    document.getElementById('best-med').innerText = localStorage.getItem('best_med') || 0;
    document.getElementById('best-hard').innerText = localStorage.getItem('best_hard') || 0;
    updateRankUI();
}

function updateRankUI() {
    const ranks = ["مبتدی ریاضی", "جنگجوی اعداد", "قهرمان جبر", "استاد هندسه", "پروفسور کوانتوم"];
    let level = Math.floor(App.state.xp / 500);
    level = Math.min(level, 4);
    document.getElementById('rank-name').innerText = ranks[level];
    document.getElementById('xp-fill').style.width = (App.state.xp % 500) / 5 + "%";
    document.getElementById('xp-text').innerText = `${App.state.xp % 500} / 500 XP`;
}

// مدیریت صفحات
const openModes = () => document.getElementById('mode-overlay').style.display = 'flex';
const closeModes = () => document.getElementById('mode-overlay').style.display = 'none';

function startLevel(m) {
    App.state.mode = m;
    App.state.score = 0; App.state.coins = 0; App.state.lives = 3;
    App.state.maxTime = (m === 'hard') ? 30 : (m === 'med') ? 20 : 15;
    
    closeModes();
    showScreen('game-screen');
    updateHUD();
    generate();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function generate() {
    let q = ""; let a = 0;
    const m = App.state.mode;

    if (m === 'hard' && Math.random() > 0.7) {
        let item = App.theory[Math.floor(Math.random() * App.theory.length)];
        q = item.q; a = item.a;
    } else {
        if (m === 'easy') {
            let n1 = rand(1, 20), n2 = rand(1, 20);
            q = `${n1} + ${n2}`; a = n1 + n2;
        } else if (m === 'med') {
            let n1 = rand(10, 30), n2 = rand(2, 9), n3 = rand(5, 15);
            q = `(${n1} - ${n3}) + ${n2}`; a = (n1 - n3) + n2;
        } else {
            let type = rand(1, 3);
            if(type === 1) { // معادله نهم
                let x = rand(2, 7), b = rand(5, 15);
                let res = 2 * x + b;
                q = `2x + ${b} = ${res} \n x = ?`; a = x;
            } else if(type === 2) { // توان
                let base = rand(12, 16);
                q = `${base}²`; a = base * base;
            } else {
                let n1 = rand(-10, 10), n2 = rand(-10, 10);
                q = `(${n1}) + (${n2})`; a = n1 + n2;
            }
        }
    }

    App.state.correct = a;
    document.getElementById('q-text').innerText = q + " = ?";
    renderAnswers(a);
    resetTimer();
}

function renderAnswers(correct) {
    let options = new Set([correct]);
    while (options.size < 4) options.add(correct + rand(-10, 15));
    
    const container = document.getElementById('ans-grid');
    container.innerHTML = '';
    [...options].sort(() => Math.random() - 0.5).forEach(val => {
        const btn = document.createElement('button');
        btn.className = 'ans-btn';
        btn.innerText = val;
        btn.onclick = () => check(val, btn);
        container.appendChild(btn);
    });
}

function check(val, btn) {
    if (val === App.state.correct) {
        App.state.score += 10; App.state.coins += 5; App.state.xp += 15;
        document.getElementById('q-box').style.borderColor = "#10b981";
        setTimeout(() => {
            document.getElementById('q-box').style.borderColor = "";
            generate();
        }, 300);
    } else {
        App.state.lives--;
        document.body.style.animation = "shake 0.3s";
        setTimeout(() => document.body.style.animation = "", 300);
        if (App.state.lives <= 0) end();
    }
    updateHUD();
}

function resetTimer() {
    clearInterval(App.state.timer);
    App.state.time = App.state.maxTime;
    App.state.frozen = false;
    const bar = document.getElementById('timer-bar');
    
    App.state.timer = setInterval(() => {
        if (!App.state.frozen) {
            App.state.time -= 0.1;
            bar.style.width = (App.state.time / App.state.maxTime) * 100 + "%";
            if (App.state.time <= 0) end();
        }
    }, 100);
}

function shop(type) {
    if (type === 'time' && App.state.coins >= 30) {
        App.state.coins -= 30; App.state.frozen = true;
        document.getElementById('buy-time').innerText = "❄️ زمان متوقف شد!";
        setTimeout(() => { 
            App.state.frozen = false; 
            document.getElementById('buy-time').innerText = "❄️ توقف زمان (۳۰ سکه)";
        }, 5000);
    } else if (type === 'life' && App.state.coins >= 50 && App.state.lives < 3) {
        App.state.coins -= 50; App.state.lives++;
    }
    updateHUD();
}

function end() {
    clearInterval(App.state.timer);
    showScreen('end-screen');
    document.getElementById('f-score').innerText = App.state.score;
    
    let key = "best_" + App.state.mode;
    let old = localStorage.getItem(key) || 0;
    if (App.state.score > old) localStorage.setItem(key, App.state.score);
    localStorage.setItem('math_xp_v2', App.state.xp);
}

function updateHUD() {
    document.getElementById('coins').innerText = App.state.coins;
    document.getElementById('score').innerText = App.state.score;
    document.getElementById('hearts').innerText = "❤️".repeat(App.state.lives);
    document.getElementById('buy-time').disabled = App.state.coins < 30;
    document.getElementById('buy-life').disabled = App.state.coins < 50 || App.state.lives >= 3;
    updateRankUI();
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
init();
