// 상수 정의
const WORK_DURATION = 25 * 60;
const BREAK_DURATION = 5 * 60;
const CYCLES = 4;

// 상태 변수
let currentCycle = 0;
let isWorkPhase = true;
let timer;
let timeRemaining = WORK_DURATION;

// DOM 요소
const elements = {
    startButton: document.getElementById('start-button'),
    pauseButton: document.getElementById('pause-button'),
    resetButton: document.getElementById('reset-button'),
    minutesDisplay: document.getElementById('minutes'),
    secondsDisplay: document.getElementById('seconds'),
    taskInput: document.getElementById('task-input'),
    addTaskButton: document.getElementById('add-task-button'),
    tasksList: document.getElementById('tasks'),
    container: document.querySelector('.container')
};

// 오디오 요소
const sounds = {
    work: document.getElementById('work-sound'),
    break: document.getElementById('break-sound'),
    celebration: document.getElementById('celebration-sound')
};

// 이벤트 리스너 설정
elements.startButton.addEventListener('click', handleStart);
elements.pauseButton.addEventListener('click', handlePause);
elements.resetButton.addEventListener('click', handleReset);
elements.addTaskButton.addEventListener('click', addTask);
elements.taskInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        addTask();
    }
});

function handleStart() {
    if (!timer) {
        startTimer();
        updateButtonVisibility(false, true, true);
    }
}

function handlePause() {
    if (timer) {
        pauseTimer();
        elements.pauseButton.textContent = '재시작';
        elements.pauseButton.style.backgroundColor = '#ffcd6c';
        elements.pauseButton.style.color = '#000';
    } else {
        startTimer();
        elements.pauseButton.textContent = '일시정지';
        elements.pauseButton.style.backgroundColor = ''; // 원래 색상으로 복원
        elements.pauseButton.style.color = '';
    }
}

function handleReset() {
    if (confirm("타이머를 리셋하시겠습니까?\n리셋 시, 현재 타이머가 초기화됩니다.")) {
        resetTimer();
    }
}

function toggleBreakTimeBody(isBreakTime) {
    if (isBreakTime) {
        document.body.classList.add('break-time-body');
    } else {
        document.body.classList.remove('break-time-body');
    }
}

function startTimer() {
    if (!timer) {
        timer = setInterval(() => {
            timeRemaining--;
            updateDisplay();
            if (timeRemaining <= 0) {
                clearInterval(timer);
                timer = null;
                handlePhaseChange();
            }
        }, 1000);
        playSound(sounds.work);
    }
    toggleBreakTimeBody(false);
}

function pauseTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
        toggleBreakTimeBody(true);
    }
}

function resetTimer() {
    clearInterval(timer);
    timer = null;
    currentCycle = 0;
    isWorkPhase = true;
    timeRemaining = WORK_DURATION;
    updateDisplay();
    resetUIState();
}

function updateDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    elements.minutesDisplay.textContent = padZero(minutes);
    elements.secondsDisplay.textContent = padZero(seconds);
}

function padZero(num) {
    return num < 10 ? '0' + num : num;
}

function handlePhaseChange() {
    if (isWorkPhase) {
        currentCycle++;
        if (currentCycle < CYCLES) {
            switchToBreak();
        } else {
            completePomodoro();
        }
    } else {
        switchToWork();
    }
}

function switchToBreak() {
    isWorkPhase = false;
    timeRemaining = BREAK_DURATION;
    elements.container.classList.add('break-time');
    toggleBreakTimeBody(true);
    startTimer();
}

function switchToWork() {
    isWorkPhase = true;
    timeRemaining = WORK_DURATION;
    elements.container.classList.remove('break-time');
    toggleBreakTimeBody(false);
    startTimer();
}

function completePomodoro() {
    playSound(sounds.celebration);
    setTimeout(() => {
        alert("포모도로 세션이 완료되었습니다!");
        resetTimer();
    }, 100);
}

function playSound(sound) {
    const soundInstance = new Audio(sound.src);
    soundInstance.play();
}

function addTask() {
    const taskText = elements.taskInput.value.trim();
    if (taskText !== "") {
        const li = createTaskElement(taskText);
        elements.tasksList.appendChild(li);
        elements.taskInput.value = '';
        elements.taskInput.focus();
    }
}

function createTaskElement(taskText) {
    const li = document.createElement('li');
    li.textContent = taskText;
    li.className = 'task-item'; // ID 대신 클래스 사용
    const deleteButton = createDeleteButton(() => li.remove());
    li.appendChild(deleteButton);
    return li;
}

function createDeleteButton(onClickHandler) {
    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.addEventListener('click', onClickHandler);
    return deleteButton;
}

function resetUIState() {
    elements.container.classList.remove('break-time');
    toggleBreakTimeBody(false);
    updateButtonVisibility(true, false, false);
}

function updateButtonVisibility(start, pause, reset) {
    elements.startButton.style.display = start ? 'inline-block' : 'none';
    elements.pauseButton.style.display = pause ? 'inline-block' : 'none';
    elements.resetButton.style.display = reset ? 'inline-block' : 'none';
}

updateDisplay();

new Sortable(elements.tasksList, {
    animation: 150,
    ghostClass: 'sortable-ghost',
});