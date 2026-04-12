const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");

const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answer-buttons");

const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("total-questions");

const scoreSpan = document.getElementById("score");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");

const resultMessage = document.getElementById("result-message");
const progressBar = document.getElementById("progress");

/* QUESTIONS */
const quizQuestions = [
  {
    question: "What part of a website matters most to you?",
    answers: [
      { text: "How smoothly it works", type: "developer" },
      { text: "How beautiful it looks", type: "designer" },
      { text: "How users behave on it", type: "analyst" },
      { text: "How successful it becomes", type: "manager" },
    ],
  },
  {
    question: "Which tool would you choose first?",
    answers: [
      { text: "VS Code", type: "developer" },
      { text: "Figma", type: "designer" },
      { text: "Excel", type: "analyst" },
      { text: "Trello", type: "manager" },
    ],
  },
  {
    question: "A project deadline is near. What do you do?",
    answers: [
      { text: "Fix bugs quickly", type: "developer" },
      { text: "Polish the interface", type: "designer" },
      { text: "Track progress metrics", type: "analyst" },
      { text: "Organize the team", type: "manager" },
    ],
  },
  {
    question: "What sounds most satisfying?",
    answers: [
      { text: "Solving a coding bug", type: "developer" },
      { text: "Creating a clean design", type: "designer" },
      { text: "Finding useful insights", type: "analyst" },
      { text: "Leading a successful launch", type: "manager" },
    ],
  },
  {
    question: "Pick a weekend activity:",
    answers: [
      { text: "Build a side project", type: "developer" },
      { text: "Design a brand logo", type: "designer" },
      { text: "Study trends and charts", type: "analyst" },
      { text: "Plan a startup idea", type: "manager" },
    ],
  },
  {
    question: "How do you solve problems?",
    answers: [
      { text: "Through logic and coding", type: "developer" },
      { text: "Through creativity", type: "designer" },
      { text: "Through research and data", type: "analyst" },
      { text: "Through teamwork and planning", type: "manager" },
    ],
  },
  {
    question: "What would your desk most likely have?",
    answers: [
      { text: "Laptop with code open", type: "developer" },
      { text: "Sketches and color palettes", type: "designer" },
      { text: "Reports and dashboards", type: "analyst" },
      { text: "Planner and sticky notes", type: "manager" },
    ],
  },
  {
    question: "What motivates you most?",
    answers: [
      { text: "Building useful products", type: "developer" },
      { text: "Making things look amazing", type: "designer" },
      { text: "Discovering patterns", type: "analyst" },
      { text: "Making ideas succeed", type: "manager" },
    ],
  },
  {
    question: "Which title sounds coolest?",
    answers: [
      { text: "Software Developer", type: "developer" },
      { text: "UI/UX Designer", type: "designer" },
      { text: "Data Analyst", type: "analyst" },
      { text: "Product Manager", type: "manager" },
    ],
  },
  {
    question: "If starting a startup, your role would be:",
    answers: [
      { text: "Build the product", type: "developer" },
      { text: "Design the experience", type: "designer" },
      { text: "Analyze growth numbers", type: "analyst" },
      { text: "Lead the vision", type: "manager" },
    ],
  },
];

/* QUIZ STATE */
let currentQuestionIndex = 0;
let answersDisabled = false;

let scores = {
  developer: 0,
  designer: 0,
  analyst: 0,
  manager: 0,
};

totalQuestionsSpan.textContent = quizQuestions.length;
maxScoreSpan.textContent = quizQuestions.length;

/* EVENTS */
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

/* START */
function startQuiz() {
  currentQuestionIndex = 0;

  scores = {
    developer: 0,
    designer: 0,
    analyst: 0,
    manager: 0,
  };

  scoreSpan.textContent = 0;

  startScreen.classList.remove("active");
  resultScreen.classList.remove("active");
  quizScreen.classList.add("active");

  showQuestion();
}

/* SHOW QUESTION */
function showQuestion() {
  answersDisabled = false;

  const currentQuestion = quizQuestions[currentQuestionIndex];

  currentQuestionSpan.textContent = currentQuestionIndex + 1;

  const progressPercent = (currentQuestionIndex / quizQuestions.length) * 100;

  progressBar.style.width = progressPercent + "%";

  questionText.textContent = currentQuestion.question;

  answersContainer.innerHTML = "";

  currentQuestion.answers.forEach((answer) => {
    const button = document.createElement("button");

    button.innerText = answer.text;
    button.classList.add("answer-btn");

    button.dataset.type = answer.type;

    button.addEventListener("click", selectAnswer);

    answersContainer.appendChild(button);
  });
}

/* SELECT ANSWER */
function selectAnswer(e) {
  if (answersDisabled) return;

  answersDisabled = true;

  const selectedButton = e.target;
  const selectedType = selectedButton.dataset.type;

  scores[selectedType]++;

  selectedButton.classList.add("correct");

  scoreSpan.textContent = currentQuestionIndex + 1;

  setTimeout(() => {
    currentQuestionIndex++;

    if (currentQuestionIndex < quizQuestions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, 700);
}

/* RESULTS */
function showResults() {
  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");

  let topType = Object.keys(scores).reduce((a, b) =>
    scores[a] > scores[b] ? a : b,
  );

  finalScoreSpan.textContent = scores[topType];

  if (topType === "developer") {
    resultMessage.textContent =
      "Software Developer - You love coding and solving problems!";
  } else if (topType === "designer") {
    resultMessage.textContent =
      "UI/UX Designer - You are creative and love visuals!";
  } else if (topType === "analyst") {
    resultMessage.textContent =
      "Data Analyst - You enjoy patterns and insights!";
  } else {
    resultMessage.textContent =
      "Product Manager - You lead ideas and strategy!";
  }
}

/* RESTART */
function restartQuiz() {
  resultScreen.classList.remove("active");
  startQuiz();
}
