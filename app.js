let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswer = null;
let timer;
let timeLeft = 15 * 60; // 15 minutes
let student = { name: "", whatsapp: "", email: "" };

// Load quiz data
fetch("quiz-data.json")
  .then(res => res.json())
  .then(data => {
    questions = shuffleArray(data).slice(0, 30); // select 30 random
  })
  .catch(err => console.error("Error loading quiz:", err));

// Shuffle utility
function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Student form submission
document.getElementById("infoForm").addEventListener("submit", function (e) {
  e.preventDefault();
  student.name = document.getElementById("studentName").value.trim();
  student.whatsapp = document.getElementById("studentWhatsapp").value.trim();
  student.email = document.getElementById("studentEmail").value.trim();

  document.getElementById("student-info").classList.add("hidden");
  document.getElementById("quiz-container").classList.remove("hidden");

  startTimer();
  showQuestion();
});

// Timer function
function startTimer() {
  const timerDisplay = document.getElementById("timer");

  timer = setInterval(() => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;
    timerDisplay.textContent = `⏰ ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timer);
      showResults();
    }
  }, 1000);
}

// Display question
function showQuestion() {
  const q = questions[currentQuestionIndex];
  const qNum = document.getElementById("question-number");
  const qText = document.getElementById("question-text");
  const options = document.getElementById("options-container");
  const nextBtn = document.getElementById("nextBtn");

  qNum.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
  qText.textContent = q.question;
  options.innerHTML = "";
  nextBtn.style.display = "none";
  selectedAnswer = null;

  for (const [key, value] of Object.entries(q.options)) {
    const optDiv = document.createElement("div");
    optDiv.className = "option";
    optDiv.textContent = `${key}. ${value}`;
    optDiv.onclick = () => selectOption(key, optDiv);
    options.appendChild(optDiv);
  }
}

// Select an answer
function selectOption(key, element) {
  document.querySelectorAll(".option").forEach(opt => opt.classList.remove("selected"));
  element.classList.add("selected");
  selectedAnswer = key;
  document.getElementById("nextBtn").style.display = "block";
}

// Next question
document.getElementById("nextBtn").addEventListener("click", () => {
  if (!selectedAnswer) return;
  const correct = questions[currentQuestionIndex].correctOption;
  if (selectedAnswer === correct) score++;

  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
});

// Show results
function showResults() {
  clearInterval(timer);
  document.getElementById("quiz-container").classList.add("hidden");
  const resultContainer = document.getElementById("result-container");
  const scoreText = document.getElementById("score-text");
  const timeText = document.getElementById("time-text");

  resultContainer.classList.remove("hidden");
  let minutesUsed = 15 - Math.floor(timeLeft / 60);
  scoreText.textContent = `${student.name}, you scored ${score} out of ${questions.length} (${Math.round((score / questions.length) * 100)}%)`;
  timeText.textContent = `Time used: ${minutesUsed} minute(s)`;

  // Configure email summary button
  const emailBtn = document.getElementById("emailBtn");
  const summary = `
  Student Name: ${student.name}
  WhatsApp: ${student.whatsapp}
  Email: ${student.email}
  Score: ${score}/${questions.length}
  Percentage: ${Math.round((score / questions.length) * 100)}%
  Time Used: ${minutesUsed} minute(s)
  `;

  emailBtn.onclick = () => {
    const subject = encodeURIComponent("Programming Logic Quiz Summary");
    const body = encodeURIComponent(summary);
    window.location.href = `mailto:fruebiadisinde2017@gmail.com?subject=${subject}&body=${body}`;
  };
}
