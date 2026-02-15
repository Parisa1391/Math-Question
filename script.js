const GameState = {
    mode: '',
    score: 0,
    lives: 3,
    timeLeft: 0,
    maxTime: 0,
    correctAnswer: 0,
    timerObj: null
};

// بارگذاری رکوردها
const loadBestScores = () => {
    document.getElementById('best-easy').innerText = localStorage.getItem('math_easy') || 0;
    document.getElementById('best-med').innerText = localStorage.getItem('math_med') || 0;
    document.getElementById('best-hard').innerText = localStorage.getItem('math_hard') || 0;
};

// شروع بازی
function initGame(selectedMode) {
    GameState.mode = selectedMode;
    GameState.score = 0;
    GameState.lives = 3;
    GameState.maxTime = (selectedMode === 'easy') ? 25 : (selectedMode === 'med') ? 20 : 15;
    
    document.getElementById('current-score').innerText = "0";
    document.getElementById('lives-display').innerText = "❤️❤️❤️";
    
    showScreen('game-screen');
    generateNewQuestion();
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

// موتور تولید سوالات (پایه اول تا نهم)
function generateNewQuestion() {
    let q = "";
    let ans = 0;
    const m = GameState.mode;

    if (m === 'easy') { // پایه اول تا سوم
        let a = rand(1, 20), b = rand(1, 20);
        if (Math.random() > 0.5) { q = `${a} + ${b}`; ans = a + b; }
        else { q = `${Math.max(a,b)} - ${Math.min(a,b)}`; ans = Math.max(a,b) - Math.min(a,b); }
    } 
    else if (m === 'med') { // پایه چهارم تا ششم
        let a = rand(2, 12), b = rand(2, 12);
        let op = rand(1, 3);
        if (op === 1) { q = `${a} × ${b}`; ans = a * b; }
        else if (op === 2) { let p = a * b; q = `${p} ÷ ${a}`; ans = b; }
        else { 
            let c = rand(1, 10);
            q = `${a} + ${b} - ${c}`; ans = a + b - c;
        }
    } 
    else { // پایه هفتم تا نهم (سخت)
        let type = rand(1, 4);
        if (type === 1) { // توان
            let base = rand(2, 9);
            q = `${base}²`; ans = base * base;
        } else if (type === 2) { // اعداد منفی
            let a = rand(-10, 10), b = rand(-10, 10);
            q = `(${a}) + (${b})`; ans = a + b;
        } else if (type === 3) { // معادله ساده
            let x = rand(2, 6);
            let b = rand(1, 10);
            let res = 2 * x + b;
            q = `2x + ${b} = ${res} ⇒ x`; ans = x;
        } else { // رادیکال
            let roots = [4, 9, 16, 25, 36, 49, 64, 81, 100];
            let r = roots[rand(0, 8)];
            q = `√${r}`; ans = Math.sqrt(r);
        }
    }

    GameState.correctAnswer = ans;
    document.getElementById('math-question').innerText = q + " = ?";
    createAnswerButtons(ans);
    startTimer();
}

function createAnswerButtons(correct) {
    let choices = new Set([correct]);
    while (choices.size < 4) {
        choices.add(correct + rand(-5, 10));
    }
    
    const grid = document.getElementById('answers-grid');
    grid.innerHTML = "";
    Array.from(choices).sort(() => Math.random() - 0.5).forEach(val => {
        let btn = document.createElement('button');
        btn.className = 'ans-btn';
        btn.innerText = val;
        btn.onclick = () => checkAnswer(val);
        grid.appendChild(btn);
    });
}

function checkAnswer(val) {
    if (val === GameState.correctAnswer) {
        GameState.score += (GameState.mode === 'hard' ? 30 : GameState.mode === 'med' ? 20 : 10);
        document.getElementById('current-score').innerText = GameState.score;
        generateNewQuestion();
    } else {
        GameState.lives--;
        updateLivesUI();
        if (GameState.lives <= 0) endGame("فرصت تمام شد!");
        else {
            // انیمیشن خطا
            document.querySelector('.question-area').style.borderColor = "red";
            setTimeout(() => document.querySelector('.question-area').style.borderColor = "", 300);
        }
    }
}

function startTimer() {
    clearInterval(GameState.timerObj);
    GameState.timeLeft = GameState.maxTime;
    const line = document.getElementById('timer-line');
    
    GameState.timerObj = setInterval(() => {
        GameState.timeLeft -= 0.1;
        let prc = (GameState.timeLeft / GameState.maxTime) * 100;
        line.style.width = prc + "%";
        
        if (GameState.timeLeft <= 0) {
            clearInterval(GameState.timerObj);
            endGame("زمان تمام شد!");
        }
    }, 100);
}

function updateLivesUI() {
    let h = "";
    for(let i=0; i<GameState.lives; i++) h += "❤️";
    document.getElementById('lives-display').innerText = h;
}

function endGame(msg) {
    clearInterval(GameState.timerObj);
    showScreen('over-screen');
    document.getElementById('over-title').innerText = msg;
    document.getElementById('final-score').innerText = GameState.score;
    
    // ذخیره رکورد
    let key = "math_" + GameState.mode;
    let oldBest = localStorage.getItem(key) || 0;
    if (GameState.score > oldBest) {
        localStorage.setItem(key, GameState.score);
    }
}

function toggleHelp(show) {
    document.getElementById('help-modal').style.display = show ? 'flex' : 'none';
}

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

loadBestScores();
