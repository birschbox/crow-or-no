const config = {
  startDate:       "2026-04-01",
  endDate:         "2026-04-08",
  questionsPerDay: 5
};

// ======================
//  SUPABASE
// ======================

const SUPABASE_URL = "https://uxmpyhmvbthydjpqxudi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4bXB5aG12YnRoeWRqcHF4dWRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4OTM3MTksImV4cCI6MjA5MDQ2OTcxOX0.TETB3meJmd1Z1ERckNvdPx3z4-yvZhHympptPXvlOXM";

function sbHeaders(extra = {}) {
  return {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
    ...extra
  };
}

async function sbSubmitScore(initials, scoreVal, timeSecs, gameDate) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard`, {
    method: "POST",
    headers: sbHeaders({ "Prefer": "return=representation" }),
    body: JSON.stringify({ initials, score: scoreVal, time_secs: timeSecs, game_date: gameDate })
  });
  if (!res.ok) throw new Error("submit failed");
  const rows = await res.json();
  return rows[0];
}

async function sbFetchTop(gameDate, limit = 10) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/leaderboard?game_date=eq.${gameDate}&order=score.desc,time_secs.asc&limit=${limit}&select=initials,score,time_secs`,
    { headers: sbHeaders() }
  );
  if (!res.ok) throw new Error("fetch top failed");
  return res.json();
}

async function sbFetchRank(gameDate, scoreVal, timeSecs) {
  const base = `${SUPABASE_URL}/rest/v1/leaderboard`;
  const h = sbHeaders({ "Prefer": "count=exact" });
  const [r1, r2] = await Promise.all([
    fetch(`${base}?game_date=eq.${gameDate}&score=gt.${scoreVal}&select=id`, { headers: h }),
    fetch(`${base}?game_date=eq.${gameDate}&score=eq.${scoreVal}&time_secs=lt.${timeSecs}&select=id`, { headers: h })
  ]);
  const parseCount = r => parseInt(r.headers.get("Content-Range")?.split("/")[1] || "0");
  return parseCount(r1) + parseCount(r2) + 1;
}

const CELEBRATION_MESSAGES_FALLBACK = [
  "Congratulations, ASS. You should be proud.",
  "Not bad for an ASS.",
  "The murder of crows salutes you, ASS.",
  "ASS has entered the record books. Truly a moment.",
  "Well played, ASS. The crows were watching.",
  "Remarkable performance, ASS. Simply remarkable."
];

let celebrationMessages = [...CELEBRATION_MESSAGES_FALLBACK];
let mySubmittedEntry = null;
let mySubmittedRank  = null;

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
const revealImageEl      = document.getElementById("revealImage");
const revealYtContainerEl = document.getElementById("revealYtContainer");
const revealYtPlayerEl    = document.getElementById("revealYtPlayer");
const revealCaptionEl    = document.getElementById("revealCaption");
const endedEl     = document.getElementById("ended");
const revealCtaEl = document.getElementById("revealCta");
const nextBtn     = document.getElementById("nextBtn");
const timeDisplayEl    = document.getElementById("timeDisplay");
const saveScoreTrigger = document.getElementById("saveScoreTrigger");
const scoreSavedMsgEl  = document.getElementById("scoreSavedMsg");
const leaderboardToggleBtn = document.getElementById("leaderboardToggle");
const leaderboardPanelEl   = document.getElementById("leaderboardPanel");
const leaderboardListEl    = document.getElementById("leaderboardList");
const celebrationModalEl   = document.getElementById("celebrationModal");
const modalMessageEl       = document.getElementById("modalMessage");
const modalScoreEl         = document.getElementById("modalScore");
const modalTimeEl          = document.getElementById("modalTime");
const modalCloseBtnEl      = document.getElementById("modalCloseBtn");
const initialsInputEl      = document.getElementById("initialsInput");
const ytContainerEl        = document.getElementById("ytContainer");
const ytPlayerEl           = document.getElementById("ytPlayer");
const ytCoverEl            = document.getElementById("ytCover");
const ytPlayBtnEl          = document.getElementById("ytPlayBtn");
const zoomContainerEl      = document.getElementById("zoomContainer");
const zoomImageEl          = document.getElementById("zoomImage");

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
//  YOUTUBE HELPERS
// ======================

function extractYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\s?#]+)/);
  return match ? match[1] : url;
}

function loadYouTube(q) {
  const id = extractYouTubeId(q.content);
  let src = `https://www.youtube.com/embed/${id}?enablejsapi=1`;
  if (q.startSeconds) src += `&start=${q.startSeconds}`;
  if (q.endSeconds)   src += `&end=${q.endSeconds}`;
  ytPlayerEl.src = src;
  ytCoverEl.classList.remove("revealed");
  ytContainerEl.classList.remove("hidden");
}

function ytCommand(func) {
  ytPlayerEl.contentWindow?.postMessage(
    JSON.stringify({ event: "command", func, args: [] }), "*"
  );
}

function revealYouTube() {
  ytCoverEl.classList.add("revealed");
}

function resetYouTube() {
  ytCommand("pauseVideo");
  ytContainerEl.classList.add("hidden");
  ytPlayerEl.src = "";
}

// ======================
//  INIT
// ======================

async function initGame() {
  try {
    const res = await fetch('questions.json');
    if (!res.ok) throw new Error('fetch failed');
    const data = await res.json();
    if (Array.isArray(data)) {
      questions = data.length > 0 ? data : QUESTIONS_FALLBACK;
    } else {
      questions = data.questions?.length > 0 ? data.questions : QUESTIONS_FALLBACK;
      if (data.celebrationMessages?.length > 0) {
        celebrationMessages = data.celebrationMessages;
      }
      if (data.scoreTiers?.length > 0) {
        scoreTiers = data.scoreTiers;
      }
    }
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
  resetYouTube();
  zoomContainerEl.classList.add("hidden");
  zoomImageEl.src = "";
  zoomImageEl.classList.remove("revealed");
  explanationEl.textContent = "";
  feedbackEl.textContent = "";
  feedbackEl.classList.remove("show");
  nextBtn.classList.add("hidden");
  revealImageEl.classList.add("hidden");
  revealImageEl.src = "";
  revealYtContainerEl.classList.add("hidden");
  revealYtPlayerEl.src = "";
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
      if (q.zoomReveal) {
        zoomContainerEl.style.setProperty("--zoom-x", (q.zoomOriginX ?? 50) + "%");
        zoomContainerEl.style.setProperty("--zoom-y", (q.zoomOriginY ?? 50) + "%");
        zoomContainerEl.style.setProperty("--zoom-level", q.zoomLevel ?? 12);
        zoomImageEl.src = q.content;
        zoomContainerEl.classList.remove("hidden");
      } else {
        imageEl.src = q.content;
        imageEl.classList.remove("hidden");
      }
    }

    if (q.type === "audio") {
      audioEl.src = q.content;
      audioEl.classList.remove("hidden");
    }

    if (q.type === "youtube") {
      loadYouTube(q);
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

  if (q.type === "youtube") {
    revealYouTube();
  }

  if (q.type === "image" && q.zoomReveal) {
    zoomImageEl.classList.add("revealed");
  }

  if (q.revealYoutubeUrl) {
    const id = extractYouTubeId(q.revealYoutubeUrl);
    revealYtPlayerEl.src = `https://www.youtube.com/embed/${id}`;
    revealYtContainerEl.classList.remove("hidden");
  } else if (q.revealImage) {
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

let scoreTiers = [
  {
    score: 0,
    labels: [
      "Zero crows. Not even a feather.",
      "Still zero. The crows have forgotten you.",
      "Zero again. Are you okay?"
    ],
    cta: 'Maybe <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> can show you the way. 🐦‍⬛'
  },
  {
    score: 1,
    labels: [
      "One crow. Technically a start.",
      "Back for more? Still just one. The crows are not impressed.",
      "One crow, again. Consistent in your inconsistency."
    ],
    cta: 'There\'s more to learn. Start at <a href="https://mplscitysc.com" target="_blank">mplscitysc.com</a>.'
  },
  {
    score: 2,
    labels: [
      "Two crows. The birds are barely aware of you.",
      "Back for more? 2/10 again. The crows have noted this.",
      "Two crows, three times. The murder is unmoved."
    ],
    cta: 'Keep going. <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> rewards curiosity.'
  },
  {
    score: 3,
    labels: [
      "Three crows. A flicker of crow awareness.",
      "Back for more? 3/10 again. A flicker, persisting.",
      "Three crows, multiple tries. The flicker remains unignited."
    ],
    cta: 'Want to know more? The Crows play in Minneapolis. <a href="https://mplscitysc.com" target="_blank">mplscitysc.com</a>'
  },
  {
    score: 4,
    labels: [
      "Four crows. Below average, but the effort is noted.",
      "4/10 again. The crows respect the effort, not the score.",
      "Four crows, again. The crows are getting impatient."
    ],
    cta: 'The Crows want you to do better. <a href="https://mplscitysc.com" target="_blank">mplscitysc.com</a>'
  },
  {
    score: 5,
    labels: [
      "Five crows. Exactly average. The crows shrug.",
      "Back for more? Still 5/10. The crows continue to shrug.",
      "Five crows, three times. A perfectly mediocre commitment."
    ],
    cta: 'Right in the middle. <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> is anything but average.'
  },
  {
    score: 6,
    labels: [
      "Six crows. Above average. The murder takes notice.",
      "Back for more? 6/10 again. The murder is cautiously optimistic.",
      "Six crows, multiple tries. The murder has warmed to you."
    ],
    cta: 'Getting there. <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> sees your potential.'
  },
  {
    score: 7,
    labels: [
      "Seven crows. Crow-curious and capable.",
      "Back for more? 7/10 again. Dependably crow-aware.",
      "Seven crows, three times. The crows are starting to trust you."
    ],
    cta: 'You know the Crows. Now come see them. <a href="https://mplscitysc.com" target="_blank">mplscitysc.com</a>'
  },
  {
    score: 8,
    labels: [
      "Eight crows. Nearly crow-certified.",
      "Back for more? 8/10 again. Two crows keep escaping you.",
      "Eight crows, again. The same two crows are laughing at you."
    ],
    cta: 'So close. <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> doesn\'t miss either.'
  },
  {
    score: 9,
    labels: [
      "Nine crows. One slip. Agonizing.",
      "Back for more? 9/10 again. One crow haunts you.",
      "Nine crows, three times. That one crow lives rent-free in your head."
    ],
    cta: 'Almost a perfect murder. <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> awaits.'
  },
  {
    score: 10,
    labels: [
      "Certified Crow Expert. 🐦‍⬛",
      "Perfect again. You are the crow.",
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

  // Reset save score button
  if (saveScoreTrigger) {
    saveScoreTrigger.classList.remove("hidden");
    saveScoreTrigger.disabled = false;
  }
  if (scoreSavedMsgEl) scoreSavedMsgEl.textContent = "";
  mySubmittedEntry = null;
  mySubmittedRank  = null;

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

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function renderLeaderboard() {
  if (!leaderboardListEl) return;
  leaderboardListEl.innerHTML = '<p class="lb-empty">Loading...</p>';

  let entries;
  try {
    entries = await sbFetchTop(getTodayString(), 10);
  } catch (e) {
    leaderboardListEl.innerHTML = '<p class="lb-empty">Could not load scores.</p>';
    return;
  }

  if (entries.length === 0) {
    leaderboardListEl.innerHTML = '<p class="lb-empty">No scores yet. Be the first!</p>';
    return;
  }

  const myInTop = mySubmittedEntry && entries.some(
    e => e.initials === mySubmittedEntry.initials &&
         e.score    === mySubmittedEntry.score &&
         e.time_secs === mySubmittedEntry.time_secs
  );

  let html = entries.map((e, i) => {
    const isOwn = mySubmittedEntry &&
                  e.initials  === mySubmittedEntry.initials &&
                  e.score     === mySubmittedEntry.score &&
                  e.time_secs === mySubmittedEntry.time_secs;
    const youLabel = isOwn ? ' <span class="lb-you">⬅ You</span>' : '';
    return `
      <div class="lb-row ${i === 0 ? "lb-top" : ""}${isOwn ? " lb-own" : ""}">
        <span class="lb-rank">#${i + 1}</span>
        <span class="lb-name">${escapeHtml(e.initials)}${youLabel}</span>
        <span class="lb-score">${e.score}/${activeQuestions.length}</span>
        <span class="lb-time">${formatTime(e.time_secs)}</span>
      </div>
    `;
  }).join("");

  if (mySubmittedEntry && !myInTop && mySubmittedRank) {
    html += `
      <div class="lb-separator"></div>
      <div class="lb-row lb-own">
        <span class="lb-rank">#${mySubmittedRank}</span>
        <span class="lb-name">${escapeHtml(mySubmittedEntry.initials)} <span class="lb-you">⬅ You</span></span>
        <span class="lb-score">${mySubmittedEntry.score}/${activeQuestions.length}</span>
        <span class="lb-time">${formatTime(mySubmittedEntry.time_secs)}</span>
      </div>
    `;
  }

  leaderboardListEl.innerHTML = html;
}

// ======================
//  CELEBRATION MODAL
// ======================

function handleSaveScore() {
  if (!saveScoreTrigger) return;
  saveScoreTrigger.classList.add("hidden");
  showCelebrationModal();
}

function showCelebrationModal() {
  const msg = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
  modalMessageEl.textContent = msg;
  modalScoreEl.textContent = `${score} / ${activeQuestions.length}`;
  modalTimeEl.textContent = `⏱ ${formatTime(elapsedSeconds)}`;
  if (initialsInputEl) {
    initialsInputEl.value = "";
    initialsInputEl.focus();
  }
  celebrationModalEl.classList.remove("hidden");
}

async function closeCelebrationModal() {
  const initials = (initialsInputEl?.value.trim().toUpperCase() || "???").slice(0, 3);
  const modalBtn = document.getElementById("modalCloseBtn");

  if (modalBtn) { modalBtn.disabled = true; modalBtn.textContent = "Saving…"; }

  try {
    const gameDate = getTodayString();
    await sbSubmitScore(initials, score, elapsedSeconds, gameDate);
    mySubmittedEntry = { initials, score, time_secs: elapsedSeconds };
    mySubmittedRank  = await sbFetchRank(gameDate, score, elapsedSeconds);
  } catch (e) {
    // Submission failed — still close modal, just no leaderboard entry
    mySubmittedEntry = null;
    mySubmittedRank  = null;
  }

  celebrationModalEl.classList.add("hidden");
  if (modalBtn) { modalBtn.disabled = false; modalBtn.textContent = "🐦‍⬛ Save Score"; }
  if (scoreSavedMsgEl) scoreSavedMsgEl.textContent = "Score saved! 🐦‍⬛";
  renderLeaderboard();
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
  resetYouTube();
  gameEl.classList.remove("hidden");

  loadQuestion();
}

// ======================
//  EVENT LISTENERS
// ======================

nextBtn.addEventListener("click", advanceQuestion);

if (saveScoreTrigger) saveScoreTrigger.addEventListener("click", handleSaveScore);
if (leaderboardToggleBtn) leaderboardToggleBtn.addEventListener("click", toggleLeaderboard);
if (ytPlayBtnEl) ytPlayBtnEl.addEventListener("click", () => ytCommand("playVideo"));
if (modalCloseBtnEl) modalCloseBtnEl.addEventListener("click", closeCelebrationModal);
if (initialsInputEl) initialsInputEl.addEventListener("input", () => {
  initialsInputEl.value = initialsInputEl.value.toUpperCase();
});

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

initGame();
