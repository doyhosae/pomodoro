// 포모도로 설정 변수
const workDuration = 25 * 60; // 25분을 초로 변환
const breakDuration = 5 * 60; // 5분을 초로 변환
const cycles = 4; // 4회 반복
let currentCycle = 0; // 현재 몇 번째 사이클인지 저장

let isWorkPhase = true; // 작업 단계인지 휴식 단계인지
let timer;
let timeRemaining = workDuration; // 남은 시간을 저장할 변수
let isPaused = true; // 타이머가 일시정지 상태인지 추적

// HTML 요소 참조
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task-button');
const tasksList = document.getElementById('tasks');

// 오디오 요소 참조
const workSound = document.getElementById('work-sound');
const breakSound = document.getElementById('break-sound');

// 타이머 시작 및 일시정지
startButton.addEventListener('click', () => {
    if (isPaused) {
        startTimer();
    } else {
        pauseTimer();
    }
    isPaused = !isPaused;
    startButton.textContent = isPaused ? 'Start' : 'Pause';
});

// 타이머 리셋
resetButton.addEventListener('click', () => {
    const userConfirmed = confirm("타이머를 리셋하시겠습니까? 리셋하면 진행 중인 타이머가 초기화됩니다.");
    if (userConfirmed) {
        resetTimer();
    }
});

// 작업 추가
addTaskButton.addEventListener('click', addTask);

function startTimer() {
    timer = setInterval(() => {
        timeRemaining--;
        updateDisplay(timeRemaining);

        if (timeRemaining <= 0) {
            clearInterval(timer);

            if (isWorkPhase) {
                currentCycle++;
                if (currentCycle < cycles) {
                    isWorkPhase = false; // 휴식 단계로 전환
                    timeRemaining = breakDuration;
                    breakSound.play(); // 휴식 사운드 재생
                    startTimer();
                } else {
                    alert("포모도로 세션이 완료되었습니다!");
                    resetTimer();
                }
            } else {
                isWorkPhase = true; // 작업 단계로 전환
                timeRemaining = workDuration;
                workSound.play(); // 작업 사운드 재생
                startTimer();
            }
        }
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
}

function updateDisplay(timeRemaining) {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    minutesDisplay.textContent = minutes < 10 ? '0' + minutes : minutes;
    secondsDisplay.textContent = seconds < 10 ? '0' + seconds : seconds;
}

function resetTimer() {
    clearInterval(timer);
    timer = null;
    currentCycle = 0;
    isWorkPhase = true;
    isPaused = true;
    startButton.textContent = 'Start';
    timeRemaining = workDuration;
    updateDisplay(timeRemaining);
}

function addTask() {
    const taskText = taskInput.value.trim();
    if (taskText !== "") {
        const li = document.createElement('li');
        li.textContent = taskText;
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', () => li.remove());
        li.appendChild(deleteButton);
        tasksList.appendChild(li);
        taskInput.value = '';
    }
}

// 초기 화면 설정
updateDisplay(timeRemaining);

// Sortable.js를 사용하여 Tasks 리스트의 드래그 앤 드롭 기능 활성화
new Sortable(tasksList, {
    animation: 150, // 드래그 시 애니메이션 효과 시간 (밀리초)
    ghostClass: 'sortable-ghost', // 드래그 중인 아이템에 적용될 클래스
});