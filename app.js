let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let timerInterval;
let timeLeft = 15 * 60; // 15 minutes

// Load JSON data
async function loadQuizData() {
  const response = await fetch('quiz-data.json');
  const data = await response.json();
  quizData = shuffle(data).slice(0, 30);
}

// Restore quiz if available
window.onload = () => {
  const savedState = JSON.parse(localStorage.getItem('quizState'));
  if (savedState && savedState.inProgress) {
    if (confirm('Resume your previous quiz session?')) {
      restoreState(savedState);
      return;
    } else {
      localStorage.removeItem('quizState');
    }
  }
};

// Start button
document.getElementById('start-btn').addEventListener('click', async () => {
  const name = document.getElementById('name').value.trim();
  const whatsapp = document.getElementById('whatsapp').value.trim();
  const email = document.getElementById('email').value.trim();
  const course = document.getElementById('course').value;

  if (!name || !whatsapp || !email || !course) {
    alert('Please fill in all fields before starting.');
    return;
  }

  await loadQuizData();

  const userData = { name, whatsapp, email, course };
  localStorage.setItem('userData', JSON.stringify(userData));

  document.getElementById('user-form').classList.add('hidden');
  document.getElementById('quiz-section').classList.remove('hidden');
  document.getElementById('courseDisplay').textContent = `Course: ${course}`;

  startTimer();
  showQuestion();
});

// Show a question
function showQuestion() {
  const questionContainer = document.getElementById('question-container');
  const progressBar = document.getElementById('progressBar');
  const questionObj = quizData[currentQuestionIndex];
  selectedAnswer = null;

  const progressPercent = ((currentQuestionIndex + 1) / quizData.length) * 100;
  progressBar.style.width = `${progressPercent}%`;

  questionContainer.style.opacity = 0;
  setTimeout(() => {
    // Render question text and image
    let imageHTML = '';
    if (questionObj.image) {
      imageHTML = `<img src="${questionObj.image}" class="question-image" alt="Flowchart">`;
    }

    questionContainer.innerHTML = `
      <h5>Question ${currentQuestionIndex + 1} of ${quizData.length}</h5>
      <p>${questionObj.question}</p>
      ${imageHTML}
      ${Object.entries(questionObj.options)
        .map(([key, val]) => `
          <div class="option" onclick="selectOption('${key}')">${val}</div>
        `).join('')}
    `;
    questionContainer.style.opacity = 1;
  }, 200);
}


// Select answer
function selectOption(option) {
  selectedAnswer = option;
  document.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
  const index = Object.keys(quizData[currentQuestionIndex].options).indexOf(option);
  if (index !== -1) {
    document.querySelectorAll('.option')[index].classList.add('selected');
  }
  saveState();
}

// Next question
document.getElementById('next-btn').addEventListener('click', () => {
  if (!selectedAnswer) {
    alert('Please select an answer before continuing.');
    return;
  }

  if (selectedAnswer === quizData[currentQuestionIndex].correctOption) {
    score++;
  }

  currentQuestionIndex++;

  if (currentQuestionIndex < quizData.length) {
    showQuestion();
  } else {
    endQuiz();
  }
  saveState();
});

// End quiz
function endQuiz() {
  clearInterval(timerInterval);
  document.getElementById('quiz-section').classList.add('hidden');
  document.getElementById('result-section').classList.remove('hidden');
  document.getElementById('score').textContent = `You scored ${score} out of ${quizData.length}!`;

  localStorage.removeItem('quizState');
  localStorage.setItem('quizResult', JSON.stringify({ score, total: quizData.length }));
}

// Timer
function startTimer() {
  timerInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      alert("Time's up!");
      endQuiz();
    }
    timeLeft--;
    saveState();
  }, 1000);
}

// Shuffle helper
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Save current quiz progress
function saveState() {
  const state = {
    inProgress: true,
    quizData,
    currentQuestionIndex,
    score,
    timeLeft,
    selectedAnswer,
    userData: JSON.parse(localStorage.getItem('userData'))
  };
  localStorage.setItem('quizState', JSON.stringify(state));
}

// Restore quiz from saved state
function restoreState(savedState) {
  quizData = savedState.quizData;
  currentQuestionIndex = savedState.currentQuestionIndex;
  score = savedState.score;
  timeLeft = savedState.timeLeft;
  selectedAnswer = savedState.selectedAnswer;

  const { name, email, whatsapp, course } = savedState.userData;
  document.getElementById('name').value = name;
  document.getElementById('email').value = email;
  document.getElementById('whatsapp').value = whatsapp;
  document.getElementById('course').value = course;

  document.getElementById('user-form').classList.add('hidden');
  document.getElementById('quiz-section').classList.remove('hidden');
  document.getElementById('courseDisplay').textContent = `Course: ${course}`;

  showQuestion();
  startTimer();
}

// Restart quiz
function restartQuiz() {
  localStorage.removeItem('quizState');
  localStorage.removeItem('quizResult');
  location.reload();
}

// Email summary
document.getElementById('sendEmail').addEventListener('click', () => {
  const userData = JSON.parse(localStorage.getItem('userData'));
  const summary = `Student: ${userData.name}\nCourse: ${userData.course}\nEmail: ${userData.email}\nScore: ${score}/${quizData.length}`;

  window.open(`mailto:fruebiadisinde2017@gmail.com?subject=Quiz Summary&body=${encodeURIComponent(summary)}`);
  alert('Summary email prepared!');
});
