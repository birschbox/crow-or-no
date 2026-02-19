const config = {
  startDate:       "2026-04-01",
  endDate:         "2026-04-08",
  questionsPerDay: 5
};

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
let activeQuestions = [];

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
const endedEl     = document.getElementById("ended");
const revealCtaEl = document.getElementById("revealCta");
const nextBtn     = document.getElementById("nextBtn");

let shareButton;

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function initGame() {
  const today = getTodayString();

  if (today > config.endDate) {
    gameEl.classList.add("hidden");
    endedEl.classList.remove("hidden");
    return;
  }

  // Filter: skip backlog; skip date-assigned questions that don't match today
  const pool = questions.filter(q => {
    if (q.status === "backlog") return false;
    if (q.date && q.date !== today) return false;
    return true;
  });

  activeQuestions = pool.slice(0, config.questionsPerDay);

  if (activeQuestions.length === 0) {
    gameEl.classList.add("hidden");
    endedEl.classList.remove("hidden");
    return;
  }

  loadQuestion();
}

function loadQuestion() {
  const q = activeQuestions[currentQuestion];

  // Reset media
  imageEl.classList.add("hidden");
  audioEl.classList.add("hidden");
  explanationEl.textContent = "";
  feedbackEl.textContent = "";
  nextBtn.classList.add("hidden");
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

    progressEl.textContent = `Question ${currentQuestion + 1} of ${activeQuestions.length}`;

    questionEl.classList.remove("fade-out");
    questionEl.classList.add("fade-in");
  }, 200);
}

function setButtonsDisabled(disabled) {
  answerButtons.forEach(btn => btn.disabled = disabled);
}

function highlightAnswer(correctAnswer) {
  answerButtons.forEach(btn => {
    const btnAnswer = btn.getAttribute("onclick").includes("'crow'") ? "crow" : "no";
    if (btnAnswer === correctAnswer) {
      btn.classList.add("correct");
    } else {
      btn.classList.add("wrong");
    }
  });
}

function resetAnswerButtons() {
  answerButtons.forEach(btn => {
    btn.classList.remove("correct", "wrong");
  });
}

function submitAnswer(answer) {
  const q = activeQuestions[currentQuestion];
  const correct = q.answer;

  setButtonsDisabled(true);
  highlightAnswer(correct);

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
  nextBtn.classList.remove("hidden");
}

function advanceQuestion() {
  nextBtn.classList.add("hidden");
  currentQuestion++;
  setButtonsDisabled(false);
  resetAnswerButtons();

  if (currentQuestion < activeQuestions.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

const scoreTiers = [
  {
    score: 0,
    label: "Zero crows. Not even a pigeon.",
    cta: 'Maybe <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> can show you the way. 🐦‍⬛'
  },
  {
    score: 1,
    label: "You spotted one crow. A fluke.",
    cta: 'There\'s more to learn. Start at <a href="https://mplscitysc.com" target="_blank">mplscitysc.com</a>.'
  },
  {
    score: 2,
    label: "You know a crow exists. Progress.",
    cta: 'Keep going. <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> rewards curiosity.'
  },
  {
    score: 3,
    label: "Crow-curious. We respect it.",
    cta: 'Want to know more? The Crows play in Minneapolis. <a href="https://mplscitysc.com" target="_blank">mplscitysc.com</a>'
  },
  {
    score: 4,
    label: "Almost crow-certified.",
    cta: 'One more thing to learn: <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a>. See you April 1st.'
  },
  {
    score: 5,
    label: "Certified Crow Expert 🐦‍⬛",
    cta: 'You were made for this. <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> awaits.'
  }
];

function showResults() {
  gameEl.classList.add("hidden");
  resultsEl.classList.remove("hidden");

  const tier = scoreTiers.find(t => t.score === score) || scoreTiers[scoreTiers.length - 1];

  scoreTextEl.textContent = `${score} / ${activeQuestions.length} — ${tier.label}`;

  // Reset and hide CTA, then fade it in after a delay
  revealCtaEl.classList.add("hidden");
  revealCtaEl.classList.remove("show");
  revealCtaEl.innerHTML = tier.cta;

  setTimeout(() => {
    revealCtaEl.classList.remove("hidden");
    // Force reflow so the transition fires
    void revealCtaEl.offsetWidth;
    revealCtaEl.classList.add("show");
  }, 1800);

  createShareButton();
}

function createShareButton() {
  const shareText = `🐦‍⬛ ${score}/${activeQuestions.length}
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
  revealCtaEl.classList.add("hidden");
  revealCtaEl.classList.remove("show");
  resetAnswerButtons();
  gameEl.classList.remove("hidden");

  loadQuestion();
}

nextBtn.addEventListener("click", advanceQuestion);

document.addEventListener("keydown", (e) => {
  if (gameEl.classList.contains("hidden")) return;
  // After answering, Space/Enter advances
  if (!nextBtn.classList.contains("hidden")) {
    if (e.key === " " || e.key === "Enter") advanceQuestion();
    return;
  }
  if (answerButtons[0].disabled) return;
  if (e.key === "c" || e.key === "C") submitAnswer("crow");
  if (e.key === "n" || e.key === "N") submitAnswer("no");
});

initGame();
