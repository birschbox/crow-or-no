const questions = [
  {
    type: "text",
    content: "Maximus Decimus Meridius",
    answer: "crow",
    explanation: "This character was played by Russell Crowe in Gladiator."
  },
  {
    type: "text",
    content: "Quote: 'Nevermore.'",
    answer: "no",
    explanation: "The quote refers to a raven, not a crow."
  },
  {
    type: "text",
    content: "A group of them is called a murder.",
    answer: "crow",
    explanation: "Correct — a group of crows is called a murder."
  }
];

let currentQuestion = 0;
let score = 0;
let resultsGrid = [];

const questionEl = document.getElementById("question");
const imageEl = document.getElementById("questionImage");
const audioEl = document.getElementById("questionAudio");
const explanationEl = document.getElementById("explanation");
const feedbackEl = document.getElementById("feedback");
const progressEl = document.getElementById("progress");
const gameEl = document.getElementById("game");
const resultsEl = document.getElementById("results");
const scoreTextEl = document.getElementById("scoreText");
const answerButtons = document.querySelectorAll(".buttons .btn");
const revealImageEl   = document.getElementById("revealImage");
const revealCaptionEl = document.getElementById("revealCaption");

let shareButton;

function loadQuestion() {
  const q = questions[currentQuestion];

  // Reset media
  imageEl.classList.add("hidden");
  audioEl.classList.add("hidden");
  explanationEl.textContent = "";
  feedbackEl.textContent = "";
  revealImageEl.classList.add("hidden");
  revealImageEl.src = "";
  revealCaptionEl.textContent = "";
  revealCaptionEl.classList.add("hidden");

  questionEl.textContent = "";
  questionEl.classList.remove("fade-in");
  questionEl.classList.add("fade-out");

  setTimeout(() => {
    if (q.type === "text") {
      questionEl.textContent = q.content;
    }

    if (q.type === "image") {
      imageEl.src = q.content;
      imageEl.classList.remove("hidden");
    }

    if (q.type === "audio") {
      audioEl.src = q.content;
      audioEl.classList.remove("hidden");
    }

    progressEl.textContent = `Question ${currentQuestion + 1} of ${questions.length}`;

    questionEl.classList.remove("fade-out");
    questionEl.classList.add("fade-in");
  }, 200);
}

function setButtonsDisabled(disabled) {
  answerButtons.forEach(btn => btn.disabled = disabled);
}

function submitAnswer(answer) {
  const q = questions[currentQuestion];
  const correct = q.answer;

  setButtonsDisabled(true);

  if (answer === correct) {
    score++;
    feedbackEl.textContent = "Correct 🐦‍⬛";
    resultsGrid.push("🐦‍⬛");
  } else {
    feedbackEl.textContent = "Wrong ❌";
    resultsGrid.push("❌");
  }

  explanationEl.textContent = q.explanation;

  if (q.revealImage) {
    revealImageEl.src = q.revealImage;
    revealImageEl.classList.remove("hidden");
  }
  if (q.revealCaption) {
    revealCaptionEl.textContent = q.revealCaption;
    revealCaptionEl.classList.remove("hidden");
  }

  feedbackEl.classList.add("show");

  setTimeout(() => {
    currentQuestion++;
    setButtonsDisabled(false);

    if (currentQuestion < questions.length) {
      loadQuestion();
    } else {
      showResults();
    }
  }, 1800); // longer to allow reading explanation
}

function showResults() {
  gameEl.classList.add("hidden");
  resultsEl.classList.remove("hidden");

  scoreTextEl.textContent = `${score} / ${questions.length}`;

  if (score === questions.length) {
    scoreTextEl.textContent += " — Certified Crow Expert 🐦‍⬛";
  }

  createShareButton();
}

function createShareButton() {
  const shareText = `Crow or No? 🐦‍⬛
${score}/${questions.length}
${resultsGrid.join("")}

Do you know crow?`;

  if (!shareButton) {
    shareButton = document.createElement("button");
    shareButton.className = "btn restart";
    shareButton.style.marginTop = "10px";
    resultsEl.appendChild(shareButton);
  }

  shareButton.textContent = "Share Results";

  shareButton.onclick = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Crow or No?",
        text: shareText
      });
    } else {
      await navigator.clipboard.writeText(shareText);
      shareButton.textContent = "Copied!";
      setTimeout(() => {
        shareButton.textContent = "Share Results";
      }, 1500);
    }
  };
}

function restartGame() {
  currentQuestion = 0;
  score = 0;
  resultsGrid = [];

  if (shareButton) {
    shareButton.remove();
    shareButton = null;
  }

  resultsEl.classList.add("hidden");
  gameEl.classList.remove("hidden");

  loadQuestion();
}

document.addEventListener("keydown", (e) => {
  if (gameEl.classList.contains("hidden")) return;
  if (answerButtons[0].disabled) return;
  if (e.key === "c" || e.key === "C") submitAnswer("crow");
  if (e.key === "n" || e.key === "N") submitAnswer("no");
});

loadQuestion();
