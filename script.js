const config = {
  startDate:       "2026-04-01",
  endDate:         "2026-04-08",
  questionsPerDay: 5
};

const QUESTIONS_FALLBACK = [
  {
    type: "text",
    content: "Maximus Decimus Meridius",
    answer: "crow",
    explanation: "This character was played by Russell Crowe in Gladiator.",
    status: "active"
  },
  {
    type: "text",
    content: "Quote: 'Nevermore.'",
    answer: "no",
    explanation: "The quote refers to a raven, not a crow.",
    status: "active"
  },
  {
    type: "text",
    content: "A group of them is called a murder.",
    answer: "crow",
    explanation: "Correct — a group of crows is called a murder.",
    status: "active"
  }
];

let questions = [];

let currentQuestion = 0;
let score = 0;
let resultsGrid = [];
let activeQuestions = [];

// Timer state
let startTime = null;
let elapsedSeconds = 0;

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
const timeDisplayEl   = document.getElementById("timeDisplay");
const assInputEl      = document.getElementById("assInput");
const saveScoreTrigger = document.getElementById("saveScoreTrigger");
const assEntryEl       = document.getElementById("assEntry");
const saveScoreBtn     = document.getElementById("saveScoreBtn");
const scoreSavedMsgEl  = document.getElementById("scoreSavedMsg");
const leaderboardToggleBtn = document.getElementById("leaderboardToggle");
const leaderboardPanelEl   = document.getElementById("leaderboardPanel");
const leaderboardListEl    = document.getElementById("leaderboardList");

let shareButton;

// ======================
//  PLAY COUNT (roasting)
// ======================

function getPlayCount() {
  return parseInt(localStorage.getItem("crow_play_count") || "0", 10);
}

function incrementPlayCount() {
  const count = getPlayCount() + 1;
  localStorage.setItem("crow_play_count", count);
  return count;
}

// ======================
//  TIMER
// ======================

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function startTimer() {
  startTime = Date.now();
}

function stopTimer() {
  if (!startTime) return;
  elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
  startTime = null;
}

// ======================
//  DATE HELPER
// ======================

function getTodayString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ======================
//  INIT
// ======================

async function initGame() {
  try {
    const res = await fetch('questions.json');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    questions = data.length > 0 ? data : QUESTIONS_FALLBACK;
  } catch (e) {
    questions = QUESTIONS_FALLBACK;
  }

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

// ======================
//  LOAD QUESTION
// ======================

function loadQuestion() {
  const q = activeQuestions[currentQuestion];

  // Start timer on first question
  if (currentQuestion === 0) {
    startTimer();
  }

  // Reset media
  imageEl.classList.add("hidden");
  audioEl.classList.add("hidden");
  explanationEl.textContent = "";
  feedbackEl.textContent = "";
  feedbackEl.classList.remove("show");
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

// ======================
//  ANSWER HANDLING
// ======================

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
    stopTimer();
    showResults();
  }
}

// ======================
//  SCORE TIERS
// ======================

const scoreTiers = [
  {
    score: 0,
    labels: [
      "Zero crows. Not even a pigeon.",
      "Still zero. The crows have forgotten you.",
      "Zero again. Are you okay?"
    ],
    cta: 'Maybe <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> can show you the way. 🐦‍⬛'
  },
  {
    score: 1,
    labels: [
      "You spotted one crow. A fluke.",
      "Back for more? Still just one. A consistent fluke.",
      "One crow, again. The crows are keeping score."
    ],
    cta: 'There\'s more to learn. Start at <a href="https://mplscitysc.com" target="_blank">mplscitysc.com</a>.'
  },
  {
    score: 2,
    labels: [
      "You know a crow exists. Progress.",
      "Back for more? Still 2/5. The crows remember.",
      "Two crows, three times. We respect the commitment."
    ],
    cta: 'Keep going. <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> rewards curiosity.'
  },
  {
    score: 3,
    labels: [
      "Crow-curious. We respect it.",
      "Back for more? 3/5 again. Crow-curious and persistent.",
      "Three crows, multiple tries. You are Crow-curious. Accept it."
    ],
    cta: 'Want to know more? The Crows play in Minneapolis. <a href="https://mplscitysc.com" target="_blank">mplscitysc.com</a>'
  },
  {
    score: 4,
    labels: [
      "Almost crow-certified.",
      "Back for more? Still one crow short. Agonizing.",
      "4/5 again. One crow keeps escaping you."
    ],
    cta: 'One more thing to learn: <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a>. See you April 1st.'
  },
  {
    score: 5,
    labels: [
      "Certified Crow Expert 🐦‍⬛",
      "Back for more? Perfect again. You are the crow.",
      "Perfect, again. We're starting to think you ARE a crow."
    ],
    cta: 'You were made for this. <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> awaits.'
  }
];

function getTierLabel(tier, playCount) {
  const labels = tier.labels;
  if (playCount <= 1) return labels[0];
  if (playCount === 2) return labels[1] || labels[0];
  return labels[2] || labels[1] || labels[0];
}

// ======================
//  RESULTS
// ======================

function showResults() {
  const playCount = incrementPlayCount();

  gameEl.classList.add("hidden");
  resultsEl.classList.remove("hidden");

  const tier = scoreTiers.find(t => t.score === score) || scoreTiers[scoreTiers.length - 1];
  const label = getTierLabel(tier, playCount);

  scoreTextEl.textContent = `${score} / ${activeQuestions.length} — ${label}`;

  // Show time
  if (timeDisplayEl) {
    timeDisplayEl.textContent = `⏱ ${formatTime(elapsedSeconds)}`;
    timeDisplayEl.classList.remove("hidden");
  }

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

  // Reset ASS input section
  if (saveScoreTrigger) {
    saveScoreTrigger.classList.remove("hidden");
    saveScoreTrigger.disabled = false;
  }
  if (assEntryEl) assEntryEl.classList.add("hidden");
  if (assInputEl) {
    assInputEl.value = "";
    assInputEl.classList.remove("saved");
  }
  if (saveScoreBtn) saveScoreBtn.disabled = false;
  if (scoreSavedMsgEl) scoreSavedMsgEl.textContent = "";

  // Collapse leaderboard
  if (leaderboardPanelEl) leaderboardPanelEl.classList.add("hidden");

  createShareButton();
  renderLeaderboard();
}

// ======================
//  SHARE
// ======================

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

// ======================
//  LEADERBOARD
// ======================

const LEADERBOARD_KEY = "crow_leaderboard";
const MAX_ENTRIES = 5;

function getLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || "[]");
  } catch (e) {
    return [];
  }
}

function saveLeaderboard(entries) {
  localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(entries));
}

function addLeaderboardEntry(name, scoreVal, timeVal) {
  const entries = getLeaderboard();
  entries.push({ name, score: scoreVal, time: timeVal });

  // Sort: higher score first, then lower time
  entries.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.time - b.time;
  });

  // Keep top 5
  const trimmed = entries.slice(0, MAX_ENTRIES);
  saveLeaderboard(trimmed);
  return trimmed;
}

function renderLeaderboard() {
  if (!leaderboardListEl) return;
  const entries = getLeaderboard();

  if (entries.length === 0) {
    leaderboardListEl.innerHTML = '<p class="lb-empty">No scores yet. Be the first!</p>';
    return;
  }

  leaderboardListEl.innerHTML = entries.map((e, i) => `
    <div class="lb-row ${i === 0 ? "lb-top" : ""}">
      <span class="lb-rank">${i + 1}</span>
      <span class="lb-name">${e.name}</span>
      <span class="lb-score">${e.score}/${activeQuestions.length}</span>
      <span class="lb-time">${formatTime(e.time)}</span>
    </div>
  `).join("");
}

// Enforce ASS-only input
function initAssInput() {
  if (!assInputEl) return;

  assInputEl.addEventListener("input", () => {
    assInputEl.value = "ASS";
  });

  assInputEl.addEventListener("focus", () => {
    assInputEl.value = "ASS";
  });
}

function revealAssEntry() {
  if (!saveScoreTrigger || !assEntryEl) return;
  saveScoreTrigger.classList.add("hidden");
  assInputEl.value = "ASS";
  assEntryEl.classList.remove("hidden");
  assInputEl.focus();
}

function handleSaveScore() {
  if (!saveScoreBtn) return;
  addLeaderboardEntry("ASS", score, elapsedSeconds);
  saveScoreBtn.disabled = true;
  if (assEntryEl) assEntryEl.classList.add("hidden");
  if (scoreSavedMsgEl) scoreSavedMsgEl.textContent = "Score saved! 🐦‍⬛";

  // Re-render leaderboard if it's open
  if (leaderboardPanelEl && !leaderboardPanelEl.classList.contains("hidden")) {
    renderLeaderboard();
  }
}

function toggleLeaderboard() {
  if (!leaderboardPanelEl) return;
  const isHidden = leaderboardPanelEl.classList.contains("hidden");
  if (isHidden) {
    renderLeaderboard();
    leaderboardPanelEl.classList.remove("hidden");
    leaderboardToggleBtn.textContent = "🏆 Hide Scores";
  } else {
    leaderboardPanelEl.classList.add("hidden");
    leaderboardToggleBtn.textContent = "🏆 High Scores";
  }
}

// ======================
//  RESTART
// ======================

function restartGame() {
  currentQuestion = 0;
  score = 0;
  resultsGrid = [];
  elapsedSeconds = 0;
  startTime = null;

  if (shareButton) {
    shareButton.remove();
    shareButton = null;
  }

  resultsEl.classList.add("hidden");
  revealCtaEl.classList.add("hidden");
  revealCtaEl.classList.remove("show");
  if (timeDisplayEl) timeDisplayEl.classList.add("hidden");
  resetAnswerButtons();
  gameEl.classList.remove("hidden");

  loadQuestion();
}

// ======================
//  EVENT LISTENERS
// ======================

nextBtn.addEventListener("click", advanceQuestion);

if (saveScoreTrigger) saveScoreTrigger.addEventListener("click", revealAssEntry);
if (saveScoreBtn) saveScoreBtn.addEventListener("click", handleSaveScore);
if (leaderboardToggleBtn) leaderboardToggleBtn.addEventListener("click", toggleLeaderboard);

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

// ======================
//  BOOT
// ======================

initAssInput();
initGame();
