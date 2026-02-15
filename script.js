const Game = {
    score: 0, coins: 0, lives: 3, time: 0, maxTime: 0,
    currentAns: 0, mode: '', timer: null, isFrozen: false,
    xp: parseInt(localStorage.getItem('math_xp')) || 0
};

// بانک سوالات مفهومی هندسه و تئوری
const theoryQuestions = [
    { q: "مجموع زوایای داخلی یک مثلث چند درجه است؟", a: 180 },
    { q: "یک لوزی چند خط تقارن دارد؟", a: 2 },
    { q: "کوچکترین عدد اول کدام است؟", a: 2 },
    { q: "مجموع زوایای داخلی چهارضلعی؟", a: 360 },
    { q: "عدد پی (π) تقریبا چند است؟", a: 3 }
];

function initRecords() {
    document.getElementById('record-easy').innerText = localStorage.getItem('best_easy') || 0;
    document.getElementById('record-med').innerText = localStorage.getItem('best_med') || 0;
    document.getElementById('record-hard').innerText = localStorage.getItem('best_hard') || 0;
    updateRank();
}

function updateRank() {
    const ranks = ["مبتدی", "کارآموز", "ماهر", "استاد", "پروفسور"];
    let level = Math.floor(Game.xp / 500);
    level = Math.min(level, 4);
    document.getElementById('user-rank').innerText = ranks[level];
    document.getElementById('xp-fill').style.width = (Game.xp % 500) / 5 + "%";
}

function openModeSelection() { document.getElementById('mode-modal').style.display = 'flex'; }
function closeModeSelection() { document.getElementById('mode-modal').style.display = 'none'; }

function startGame(m) {
    Game.mode = m;
    Game.score = 0; Game.coins = 0; Game.lives = 3;
    Game.maxTime = (m === 'hard') ? 30 : (m === 'med') ? 20 : 15;
    
    closeModeSelection();
    showScreen('game-screen');
    nextQuestion();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function nextQuestion() {
    let qStr = "";
    let ans = 0;
    const m = Game.mode;

    // شانس ظاهر شدن سوال تئوری در حالت سخت
    if (m === 'hard' && Math.random() > 0.7) {
        let tq = theoryQuestions[Math.floor(Math.random() * theoryQuestions.length)];
        qStr = tq.q;
        ans = tq.a;
    } else {
        // سوالات محاسباتی
        if (m === 'easy') {
            let a = rand(1, 20), b = rand(1, 20);
            qStr = `${a} + ${b}`; ans = a + b;
        } else if (m === 'med') {
            let a = rand(5, 15), b = rand(2, 10), c = rand(1, 20);
            qStr = `(${a} × ${b}) - ${c}`; ans = (a * b) - c;
        } else { // Hard - نهم
            let type = rand(1, 3);
            if (type === 1) { // معادله
                let x = rand(3, 8), b = rand(5, 20);
                let res = 3 * x + b;
                qStr = `3x + ${b} = ${res} \n x=?`; ans = x;
            } else if (type === 2) { // توان و رادیکال
                let a = rand(11, 20);
                qStr = `${a}²`; ans = a * a;
            } else { // ترکیبی
                let a = rand(50, 100), b = rand(15, 40);
                qStr = `${a} - ${b} + 12`; ans = a - b + 12;
            }
        }
    }

    Game.currentAns = ans;
    document.getElementById('question-text').innerText = qStr;
    renderOptions(ans);
    resetTimer();
}

function renderOptions(correct) {
    let opts = new Set([correct]);
    while (opts.size < 4) opts.add(correct + rand(-10, 15));
    
    const grid = document.getElementById('options-grid');
    grid.innerHTML = '';
    [...opts].sort(() => Math.random() - 0.5).forEach(o => {
        const btn = document.createElement('button');
        btn.className = 'opt-btn';
        btn.innerText = o;
        btn.onclick = () => checkAnswer(o, btn);
        grid.appendChild(btn);
    });
}

function checkAnswer(val, btn) {
    if (val === Game.currentAns) {
        Game.score += 10;
        Game.coins += 10;
        Game.xp += 20;
        btn.style.background = "#10b981";
        setTimeout(nextQuestion, 300);
    } else {
        Game.lives--;
        btn.style.background = "#ef4444";
        updateHearts();
        if (Game.lives <= 0) endGame();
    }
    updateHUD();
}

function resetTimer() {
    clearInterval(Game.timer);
    Game.time = Game.maxTime;
    Game.isFrozen = false;
    
    Game.timer = setInterval(() => {
        if (!Game.isFrozen) {
            Game.time -= 0.1;
            document.getElementById('time-bar').style.width = (Game.time / Game.maxTime) * 100 + "%";
            if (Game.time <= 0) endGame();
        }
    }, 100);
}

function usePower(type) {
    if (type === 'freeze' && Game.coins >= 30) {
        Game.coins -= 30;
        Game.isFrozen = true;
        document.getElementById('p-freeze').innerText = "❄️ زمان یخ زد!";
        setTimeout(() => { Game.isFrozen = false; document.getElementById('p-freeze').innerText = "❄️ انجماد زمان (۳۰ سکه)"; }, 5000);
    } else if (type === 'life' && Game.coins >= 50 && Game.lives < 3) {
        Game.coins -= 50;
        Game.lives++;
        updateHearts();
    }
    updateHUD();
}

function endGame() {
    clearInterval(Game.timer);
    showScreen('result-screen');
    document.getElementById('final-score').innerText = Game.score;
    
    // ذخیره رکورد
    let key = "best_" + Game.mode;
    let old = localStorage.getItem(key) || 0;
    if (Game.score > old) localStorage.setItem(key, Game.score);
    localStorage.setItem('math_xp', Game.xp);
}

function updateHUD() {
    document.getElementById('game-coins').innerText = Game.coins;
    document.getElementById('game-score').innerText = Game.score;
    document.getElementById('p-freeze').disabled = Game.coins < 30;
    document.getElementById('p-heart').disabled = Game.coins < 50 || Game.lives >= 3;
}

function updateHearts() {
    let h = "";
    for(let i=0; i<Game.lives; i++) h += "❤️";
    document.getElementById('heart-container').innerText = h;
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

initRecords();
