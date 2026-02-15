// متغیرهای سراسری بازی
const Game = {
    score: 0,
    level: 1,
    time: 10,
    maxTime: 10,
    timer: null,
    isPlaying: false,
    combo: 0,
    correctAnswer: 0,
    freezeActive: false
};

// دریافت بالاترین امتیاز از حافظه
let highScore = localStorage.getItem('mathMaster_highScore') || 0;
document.getElementById('best-score-display').innerText = highScore;

// المان های صوتی (بصری)
const screens = {
    home: document.getElementById('home-screen'),
    game: document.getElementById('game-screen'),
    end: document.getElementById('game-over-screen')
};

function switchScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenName].classList.add('active');
}

// شروع بازی
function startGame() {
    Game.score = 0;
    Game.level = 1;
    Game.combo = 0;
    Game.time = 15;
    Game.maxTime = 15;
    Game.freezeActive = false;
    
    updateHUD();
    switchScreen('game');
    nextQuestion();
    startTimer();
}

// تایمر پیشرفته
function startTimer() {
    clearInterval(Game.timer);
    Game.timer = setInterval(() => {
        if (!Game.freezeActive) {
            Game.time -= 0.1;
        }
        
        const percent = (Game.time / Game.maxTime) * 100;
        document.getElementById('timer-bar').style.width = percent + '%';
        
        if (Game.time <= 0) {
            gameOver();
        }
    }, 100);
}

// تولید عدد تصادفی
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// موتور تولید سوال (فوق هوشمند)
function nextQuestion() {
    let q = "", a = 0;
    const lvl = Game.level;

    // سطح بندی سختی
    if (lvl <= 5) { // جمع و تفریق
        let n1 = rand(5, 20 + lvl*2), n2 = rand(2, 15);
        if (Math.random() > 0.5) { q = `${n1} + ${n2}`; a = n1 + n2; }
        else { q = `${n1} - ${n2}`; a = n1 - n2; }
    } 
    else if (lvl <= 10) { // ضرب و تقسیم
        let n1 = rand(2, 9), n2 = rand(2, 9);
        q = `${n1} × ${n2}`; a = n1 * n2;
        if (lvl > 8 && Math.random() > 0.7) { // گهگاهی تقسیم
            let prod = n1 * n2;
            q = `${prod} ÷ ${n1}`; a = n2;
        }
    } 
    else if (lvl <= 15) { // معادلات و اولویت
        let x = rand(2, 10);
        let b = rand(1, 20);
        q = `${x}x + ${b} = ${x*2 + b} <br><small>x = ?</small>`;
        a = 2; // جواب همیشه 2 است، فقط ظاهر پیچیده است (تریک)
        // واقعی سازی:
        let n1 = rand(2,5), n2 = rand(2,5), n3=rand(1,10);
        q = `${n1} × ${n2} + ${n3}`; a = n1*n2+n3;
    }
    else { // سطح نابغه
        let base = rand(2, 5);
        q = `${base}² + ${rand(1,10)}`;
        a = Math.pow(base, 2) + eval(q.split('+')[1]);
    }

    Game.correctAnswer = a;
    document.getElementById('question-text').innerHTML = q;
    generateOptions(a);
    
    // بازنشانی زمان بر اساس مرحله
    if(!Game.freezeActive) {
        Game.maxTime = Math.max(5, 12 - Math.floor(lvl/5));
        Game.time = Game.maxTime;
    }
    
    checkPowerUpAvailability();
}

function generateOptions(correct) {
    let opts = new Set([correct]);
    while (opts.size < 4) {
        let fake = correct + rand(-10, 10);
        if (fake !== correct && fake > 0) opts.add(fake);
    }
    
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    Array.from(opts).sort(()=>Math.random()-0.5).forEach(opt => {
        let btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(btn, opt);
        container.appendChild(btn);
    });
}

function handleAnswer(btn, value) {
    if (value === Game.correctAnswer) {
        // درست
        Game.combo++;
        let bonus = Game.combo > 2 ? Game.combo * 5 : 0;
        Game.score += (10 + bonus);
        Game.level++;
        Game.freezeActive = false; // لغو یخ بعد از پاسخ
        
        btn.classList.add('correct');
        setTimeout(nextQuestion, 500);
    } else {
        // غلط
        Game.combo = 0;
        btn.classList.add('wrong');
        navigator.vibrate(200); // لرزش گوشی
        setTimeout(gameOver, 500);
    }
    updateHUD();
}

function updateHUD() {
    document.getElementById('score').innerText = Game.score;
    document.getElementById('level').innerText = Game.level;
    document.getElementById('combo').innerText = 'x' + (Game.combo > 1 ? Game.combo : 1);
}

// پایان بازی
function gameOver() {
    clearInterval(Game.timer);
    switchScreen('end');
    document.getElementById('final-score').innerText = Game.score;
    
    if (Game.score > highScore) {
        highScore = Game.score;
        localStorage.setItem('mathMaster_highScore', highScore);
        document.getElementById('best-score-display').innerText = highScore;
        document.getElementById('new-record-msg').classList.remove('hidden');
    } else {
        document.getElementById('new-record-msg').classList.add('hidden');
    }
}

// --- قابلیت های ویژه (Power-Ups) ---

function checkPowerUpAvailability() {
    // فعال سازی دکمه ها اگر امتیاز کافی باشد
    const freezeBtn = document.getElementById('freeze-btn');
    const hintBtn = document.getElementById('hint-btn');
    
    freezeBtn.disabled = Game.score < 50;
    hintBtn.disabled = Game.score < 30;
    
    if(Game.score >= 50) freezeBtn.classList.add('active');
    else freezeBtn.classList.remove('active');
    
    if(Game.score >= 30) hintBtn.classList.add('active');
    else hintBtn.classList.remove('active');
}

function activateFreeze() {
    if (Game.score >= 50) {
        Game.score -= 50;
        Game.freezeActive = true;
        document.body.style.border = "5px solid cyan"; // افکت بصری
        updateHUD();
        checkPowerUpAvailability();
        setTimeout(() => { document.body.style.border = "none"; }, 500);
    }
}

function activateHint() {
    if (Game.score >= 30) {
        Game.score -= 30;
        const opts = document.querySelectorAll('.option-btn');
        let removed = 0;
        opts.forEach(btn => {
            if (parseInt(btn.innerText) !== Game.correctAnswer && removed < 2) {
                btn.classList.add('disabled');
                removed++;
            }
        });
        updateHUD();
        checkPowerUpAvailability();
    }
}

// --- افکت پس زمینه ماتریکسی ---
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const katakana = '0123456789+-×÷=∑∫π';
const fontSize = 16;
const columns = canvas.width/fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

    for(let i = 0; i < drops.length; i++) {
        const text = katakana.charAt(Math.floor(Math.random() * katakana.length));
        ctx.fillText(text, i*fontSize, drops[i]*fontSize);
        if(drops[i]*fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 30);

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
