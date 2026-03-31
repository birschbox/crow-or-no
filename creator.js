// ======================
//  STORAGE
// ======================

const QUESTIONS_KEY   = 'crow_questions';
const MESSAGES_KEY    = 'crow_celebration_messages';
const SCORE_TIERS_KEY = 'crow_score_tiers';

const DEFAULT_SCORE_TIERS = [
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
      "Perfect, again. We\'re starting to think you ARE a crow."
    ],
    cta: 'You were made for this. <a href="https://mplscitysc.com" target="_blank">Minneapolis City SC</a> awaits.'
  }
];

const DEFAULT_MESSAGES = [
  "Congratulations, ASS. You should be proud.",
  "Not bad for an ASS.",
  "The murder of crows salutes you, ASS.",
  "ASS has entered the record books. Truly a moment.",
  "Well played, ASS. The crows were watching.",
  "Remarkable performance, ASS. Simply remarkable."
];

let celebrationMessages = [];
let scoreTiers = [];

function persistQuestions() {
  localStorage.setItem(QUESTIONS_KEY, JSON.stringify(questions));
  showSaveIndicator();
}

function persistMessages() {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(celebrationMessages));
  showSaveIndicator();
}

function persistScoreTiers() {
  localStorage.setItem(SCORE_TIERS_KEY, JSON.stringify(scoreTiers));
  showSaveIndicator();
}

function loadQuestionsFromStorage() {
  try {
    const raw = localStorage.getItem(QUESTIONS_KEY);
    if (raw) questions = JSON.parse(raw);
  } catch (e) {
    questions = [];
  }
}

function loadMessagesFromStorage() {
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    celebrationMessages = raw ? JSON.parse(raw) : [...DEFAULT_MESSAGES];
  } catch (e) {
    celebrationMessages = [...DEFAULT_MESSAGES];
  }
}

function loadScoreTiersFromStorage() {
  try {
    const raw = localStorage.getItem(SCORE_TIERS_KEY);
    scoreTiers = raw ? JSON.parse(raw) : DEFAULT_SCORE_TIERS.map(t => ({ ...t, labels: [...t.labels] }));
  } catch (e) {
    scoreTiers = DEFAULT_SCORE_TIERS.map(t => ({ ...t, labels: [...t.labels] }));
  }
}

function showSaveIndicator() {
  const el = document.getElementById('saveIndicator');
  if (!el) return;
  el.textContent = 'Saved ✓';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.textContent = ''; }, 2000);
}

// ======================
//  STATE
// ======================

let questions    = [];   // in-memory question list
let editingIndex = -1;   // -1 = adding new; >= 0 = editing existing
let currentType  = 'text';
let currentAnswer = null;
let currentStatus = 'active';
let dragSrcIndex = null;

// ======================
//  DOM REFERENCES
// ======================

const typeSelector       = document.getElementById('typeSelector');
const answerSelector     = document.getElementById('answerSelector');
const contentLabel       = document.getElementById('contentLabel');
const contentInput       = document.getElementById('contentInput');
const contentUrl         = document.getElementById('contentUrl');
const explanationInput          = document.getElementById('explanationInput');
const explanationCorrectInput   = document.getElementById('explanationCorrectInput');
const explanationIncorrectInput = document.getElementById('explanationIncorrectInput');
const questionNameInput         = document.getElementById('questionNameInput');
const revealSection      = document.getElementById('revealSection');
const revealImageInput   = document.getElementById('revealImageInput');
const revealYoutubeInput = document.getElementById('revealYoutubeInput');
const revealCaptionInput = document.getElementById('revealCaptionInput');
const addQuestionBtn     = document.getElementById('addQuestionBtn');
const clearFormBtn       = document.getElementById('clearFormBtn');
const formError          = document.getElementById('formError');

const previewContent      = document.getElementById('previewContent');
const previewImage        = document.getElementById('previewImage');
const previewAudio        = document.getElementById('previewAudio');
const previewExplanation  = document.getElementById('previewExplanation');
const previewRevealBlock  = document.getElementById('previewRevealBlock');
const previewRevealImg    = document.getElementById('previewRevealImg');
const previewRevealCaption = document.getElementById('previewRevealCaption');
const previewBadge        = document.getElementById('previewBadge');

const questionList  = document.getElementById('questionList');
const questionCount = document.getElementById('questionCount');
const generateBtn   = document.getElementById('generateBtn');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const codeOutput    = document.getElementById('codeOutput');
const codePre       = document.getElementById('codePre');
const copyBtn       = document.getElementById('copyBtn');
const copyFeedback  = document.getElementById('copyFeedback');
const statusSelector = document.getElementById('statusSelector');
const dateInput      = document.getElementById('dateInput');
const contentFileEl    = document.getElementById('contentFile');
const fileUploadRow    = document.getElementById('fileUploadRow');
const startSecondsRow  = document.getElementById('startSecondsRow');
const startSecondsInput = document.getElementById('startSecondsInput');
const endSecondsInput   = document.getElementById('endSecondsInput');
const zoomRow          = document.getElementById('zoomRow');
const zoomRevealToggle = document.getElementById('zoomRevealToggle');
const zoomOptions      = document.getElementById('zoomOptions');
const zoomLevelInput   = document.getElementById('zoomLevelInput');
const zoomOriginXInput = document.getElementById('zoomOriginXInput');
const zoomOriginYInput = document.getElementById('zoomOriginYInput');
const messageListEl    = document.getElementById('messageList');
const messageInputEl   = document.getElementById('messageInput');
const addMessageBtn    = document.getElementById('addMessageBtn');
const messageErrorEl   = document.getElementById('messageError');
const scoreTierListEl  = document.getElementById('scoreTierList');

// ======================
//  TYPE SELECTOR
// ======================

function initTypeSelector() {
  typeSelector.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      typeSelector.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
      updateContentField();
      updateRevealVisibility();
      updatePreview();
    });
  });
}

function extractYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&\s?#]+)/);
  return match ? match[1] : url;
}

function updateContentField() {
  contentInput.classList.add('hidden');
  contentUrl.classList.add('hidden');
  fileUploadRow.classList.add('hidden');
  startSecondsRow.classList.add('hidden');
  zoomRow.classList.add('hidden');

  if (currentType === 'text') {
    contentInput.classList.remove('hidden');
    contentLabel.textContent = 'Question Text';
  } else if (currentType === 'image') {
    contentUrl.classList.remove('hidden');
    fileUploadRow.classList.remove('hidden');
    zoomRow.classList.remove('hidden');
    contentFileEl.accept = 'image/*';
    contentLabel.textContent = 'Image URL';
    contentUrl.placeholder = 'https://example.com/image.jpg';
  } else if (currentType === 'audio') {
    contentUrl.classList.remove('hidden');
    fileUploadRow.classList.remove('hidden');
    contentFileEl.accept = 'audio/*';
    contentLabel.textContent = 'Audio URL';
    contentUrl.placeholder = 'https://example.com/audio.mp3';
  } else if (currentType === 'youtube') {
    contentUrl.classList.remove('hidden');
    startSecondsRow.classList.remove('hidden');
    contentLabel.textContent = 'YouTube URL';
    contentUrl.placeholder = 'https://www.youtube.com/watch?v=...';
  }
}

// ======================
//  ZOOM
// ======================

function initZoom() {
  zoomRevealToggle.addEventListener('change', () => {
    zoomOptions.classList.toggle('hidden', !zoomRevealToggle.checked);
  });

  [zoomLevelInput, zoomOriginXInput, zoomOriginYInput].forEach(el =>
    el.addEventListener('input', updatePreview)
  );

  // Click preview image to set zoom origin
  previewImage.addEventListener('click', (e) => {
    if (currentType !== 'image' || !zoomRevealToggle.checked) return;
    const rect = previewImage.getBoundingClientRect();
    zoomOriginXInput.value = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    zoomOriginYInput.value = Math.round(((e.clientY - rect.top)  / rect.height) * 100);
    updatePreview();
  });
}

// ======================
//  FILE UPLOAD
// ======================

function initFileUpload() {
  contentFileEl.addEventListener('change', () => {
    const file = contentFileEl.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      contentUrl.value = e.target.result;
      updatePreview();
    };
    reader.readAsDataURL(file);
  });
}

function updateRevealVisibility() {
  // YouTube reveals itself via the cover lift; all other types support a reveal
  if (currentType === 'youtube') {
    revealSection.classList.add('hidden');
  } else {
    revealSection.classList.remove('hidden');
  }
}

// ======================
//  ANSWER SELECTOR
// ======================

function initAnswerSelector() {
  answerSelector.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      answerSelector.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAnswer = btn.dataset.answer;
      updatePreview();
    });
  });
}

// ======================
//  STATUS SELECTOR
// ======================

function initStatusSelector() {
  statusSelector.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      statusSelector.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentStatus = btn.dataset.status;
    });
  });
}

// ======================
//  LIVE PREVIEW
// ======================

function getActiveContent() {
  return currentType === 'text'
    ? contentInput.value.trim()
    : contentUrl.value.trim();
}

function updatePreview() {
  const content     = getActiveContent();
  const explanation = explanationInput.value.trim();
  const revealImg   = revealImageInput.value.trim();
  const revealYt    = revealYoutubeInput.value.trim();
  const revealCap   = revealCaptionInput.value.trim();

  // Reset media
  previewImage.classList.add('hidden');
  previewAudio.classList.add('hidden');
  previewContent.textContent = '';

  if (currentType === 'text') {
    previewContent.textContent = content || 'Your question will appear here';
  } else if (currentType === 'image') {
    if (content) {
      previewImage.src = content;
      previewImage.classList.remove('hidden');
      if (zoomRevealToggle.checked) {
        previewImage.style.cursor = 'crosshair';
        const x = zoomOriginXInput.value || 50;
        const y = zoomOriginYInput.value || 50;
        previewExplanation.textContent = `Zoom origin: ${x}%, ${y}% — click image to reposition`;
      } else {
        previewImage.style.cursor = '';
      }
    } else {
      previewContent.textContent = 'Enter an image URL above to preview';
    }
  } else if (currentType === 'audio') {
    if (content) {
      previewAudio.src = content;
      previewAudio.classList.remove('hidden');
    } else {
      previewContent.textContent = 'Enter an audio URL above to preview';
    }
  } else if (currentType === 'youtube') {
    const id = content ? extractYouTubeId(content) : null;
    if (id) {
      previewImage.src = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
      previewImage.classList.remove('hidden');
      previewContent.textContent = '▶ Audio only during question — video reveals on answer';
    } else {
      previewContent.textContent = 'Enter a YouTube URL above to preview';
    }
  }

  // Explanation
  previewExplanation.textContent = explanation;

  // Reveal block
  if (revealImg || revealYt || revealCap) {
    if (revealImg) {
      previewRevealImg.src = revealImg;
      previewRevealImg.classList.remove('hidden');
    } else {
      previewRevealImg.classList.add('hidden');
    }
    previewRevealCaption.textContent = revealYt
      ? `▶ YouTube reveal: ${revealYt}${revealCap ? '\n' + revealCap : ''}`
      : (revealCap || '');
    previewRevealBlock.classList.remove('hidden');
  } else {
    previewRevealBlock.classList.add('hidden');
  }

  // Answer badge
  previewBadge.textContent = currentAnswer
    ? 'Answer: ' + currentAnswer.charAt(0).toUpperCase() + currentAnswer.slice(1)
    : 'Answer: —';
}

function initLivePreview() {
  [contentInput, contentUrl, explanationInput, explanationCorrectInput, explanationIncorrectInput, revealImageInput, revealYoutubeInput, revealCaptionInput, startSecondsInput]
    .forEach(el => el.addEventListener('input', updatePreview));
}

// ======================
//  FORM VALIDATION
// ======================

function validateForm() {
  if (!getActiveContent()) return 'Content is required.';
  if (!currentAnswer)      return 'Please select an answer (Crow or No).';
  if (!explanationInput.value.trim()) return 'An explanation is required.';
  return null;
}

function showFormError(msg) {
  formError.textContent = msg;
}

function clearFormError() {
  formError.textContent = '';
}

// ======================
//  BUILD QUESTION OBJECT
// ======================

function buildQuestionObject() {
  const obj = {
    type:        currentType,
    content:     getActiveContent(),
    answer:      currentAnswer,
    explanation: explanationInput.value.trim()
  };

  const expCorrect   = explanationCorrectInput.value.trim();
  const expIncorrect = explanationIncorrectInput.value.trim();
  if (expCorrect)   obj.explanationCorrect   = expCorrect;
  if (expIncorrect) obj.explanationIncorrect = expIncorrect;

  const nameVal = questionNameInput.value.trim();
  if (nameVal) obj.name = nameVal;

  const revealImg = revealImageInput.value.trim();
  const revealYt  = revealYoutubeInput.value.trim();
  const revealCap = revealCaptionInput.value.trim();
  const dateVal   = dateInput.value.trim();

  if (revealImg) obj.revealImage      = revealImg;
  if (revealYt)  obj.revealYoutubeUrl = revealYt;
  if (revealCap) obj.revealCaption    = revealCap;

  if (currentType === 'youtube') {
    const start = parseInt(startSecondsInput.value, 10);
    const end   = parseInt(endSecondsInput.value, 10);
    if (start > 0) obj.startSeconds = start;
    if (end   > 0) obj.endSeconds   = end;
  }

  if (currentType === 'image' && zoomRevealToggle.checked) {
    obj.zoomReveal   = true;
    obj.zoomLevel    = parseInt(zoomLevelInput.value, 10) || 12;
    obj.zoomOriginX  = parseInt(zoomOriginXInput.value, 10) ?? 50;
    obj.zoomOriginY  = parseInt(zoomOriginYInput.value, 10) ?? 50;
  }

  obj.status = currentStatus;
  if (dateVal) obj.date = dateVal;

  return obj;
}

// ======================
//  ADD / UPDATE
// ======================

function handleAddOrUpdate() {
  clearFormError();

  const error = validateForm();
  if (error) {
    showFormError(error);
    return;
  }

  const q = buildQuestionObject();

  if (editingIndex === -1) {
    questions.push(q);
  } else {
    questions[editingIndex] = q;
    editingIndex = -1;
    addQuestionBtn.textContent = 'Add to List';
  }

  clearForm();
  renderQuestionList();
  persistQuestions();
}

// ======================
//  CLEAR FORM
// ======================

function clearForm() {
  currentType   = 'text';
  currentAnswer = null;
  editingIndex  = -1;

  typeSelector.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  typeSelector.querySelector('[data-type="text"]').classList.add('active');

  answerSelector.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));

  currentStatus = 'active';
  statusSelector.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
  statusSelector.querySelector('[data-status="active"]').classList.add('active');

  contentInput.value              = '';
  contentUrl.value                = '';
  explanationInput.value          = '';
  explanationCorrectInput.value   = '';
  explanationIncorrectInput.value = '';
  questionNameInput.value         = '';
  revealImageInput.value   = '';
  revealYoutubeInput.value = '';
  revealCaptionInput.value = '';
  dateInput.value          = '';
  startSecondsInput.value  = '';
  endSecondsInput.value    = '';
  zoomRevealToggle.checked = false;
  zoomOptions.classList.add('hidden');
  zoomLevelInput.value   = '12';
  zoomOriginXInput.value = '50';
  zoomOriginYInput.value = '50';

  addQuestionBtn.textContent = 'Add to List';

  clearFormError();
  updateContentField();
  updateRevealVisibility();
  updatePreview();
}

// ======================
//  LOAD FOR EDITING
// ======================

function loadForEditing(index) {
  const q = questions[index];
  editingIndex = index;

  // Type
  currentType = q.type;
  typeSelector.querySelectorAll('.type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.type === q.type);
  });
  updateContentField();
  updateRevealVisibility();

  // Content
  if (q.type === 'text') {
    contentInput.value = q.content;
  } else {
    contentUrl.value = q.content;
  }

  // Answer
  currentAnswer = q.answer;
  answerSelector.querySelectorAll('.type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.answer === q.answer);
  });

  // Explanation, reveal & scheduling
  explanationInput.value          = q.explanation;
  explanationCorrectInput.value   = q.explanationCorrect   || '';
  explanationIncorrectInput.value = q.explanationIncorrect || '';
  questionNameInput.value         = q.name || '';
  revealImageInput.value   = q.revealImage      || '';
  revealYoutubeInput.value = q.revealYoutubeUrl || '';
  revealCaptionInput.value = q.revealCaption    || '';
  startSecondsInput.value  = q.startSeconds || '';
  endSecondsInput.value    = q.endSeconds   || '';
  zoomRevealToggle.checked = !!q.zoomReveal;
  zoomOptions.classList.toggle('hidden', !q.zoomReveal);
  zoomLevelInput.value   = q.zoomLevel   ?? 12;
  zoomOriginXInput.value = q.zoomOriginX ?? 50;
  zoomOriginYInput.value = q.zoomOriginY ?? 50;

  currentStatus = q.status || 'active';
  statusSelector.querySelectorAll('.type-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.status === currentStatus);
  });
  dateInput.value = q.date || '';

  addQuestionBtn.textContent = 'Update Question';
  clearFormError();
  updatePreview();

  // Scroll back up to form
  typeSelector.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ======================
//  DELETE
// ======================

let pendingDeleteIndex = -1;

function deleteQuestion(index) {
  pendingDeleteIndex = index;
  document.getElementById('deleteModal').classList.remove('hidden');
}

function closeDeleteModal() {
  pendingDeleteIndex = -1;
  document.getElementById('deleteModal').classList.add('hidden');
}

function confirmArchive() {
  if (pendingDeleteIndex < 0) return;
  questions[pendingDeleteIndex].status = 'archived';
  if (editingIndex === pendingDeleteIndex) {
    currentStatus = 'archived';
    statusSelector.querySelectorAll('.type-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.status === 'archived');
    });
  }
  closeDeleteModal();
  renderQuestionList();
  persistQuestions();
}

function confirmDelete() {
  if (pendingDeleteIndex < 0) return;
  const index = pendingDeleteIndex;
  if (editingIndex === index) {
    clearForm();
  } else if (editingIndex > index) {
    editingIndex--;
  }
  questions.splice(index, 1);
  closeDeleteModal();
  renderQuestionList();
  persistQuestions();
}

// ======================
//  RENDER LIST
// ======================

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderQuestionList() {
  const active   = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.status !== 'archived');
  const archived = questions.map((q, i) => ({ q, i })).filter(({ q }) => q.status === 'archived');

  questionCount.textContent = active.length;

  if (questions.length === 0) {
    questionList.innerHTML = '<p class="empty-state">No questions yet. Add one above.</p>';
    return;
  }

  questionList.innerHTML = '';

  const renderItem = ({ q, i }) => {
    const item = document.createElement('div');
    item.className = 'question-item' + (q.status === 'archived' ? ' archived-item' : '');
    item.draggable  = q.status !== 'archived';
    item.dataset.index = i;

    const preview = q.name
      ? q.name
      : (q.content.length > 55 ? q.content.slice(0, 55) + '…' : q.content);

    const statusLabel = (q.status || 'active');
    const dateLabel   = q.date ? ` · ${q.date}` : '';

    item.innerHTML = `
      <span class="drag-handle" title="Drag to reorder" style="${q.status === 'archived' ? 'opacity:0.2;cursor:default' : ''}">⠿</span>
      <span class="question-item-type">${q.type}</span>
      <span class="question-item-text">${escapeHtml(preview)}</span>
      <span class="question-item-answer">${q.answer.toUpperCase()}</span>
      <span class="question-item-type">${statusLabel}${dateLabel}</span>
      <button class="item-btn edit-btn" data-index="${i}">Edit</button>
      <button class="item-btn delete delete-btn" data-index="${i}">Delete</button>
    `;

    if (q.status !== 'archived') {
      item.addEventListener('dragstart', handleDragStart);
      item.addEventListener('dragover',  handleDragOver);
      item.addEventListener('drop',      handleDrop);
      item.addEventListener('dragend',   handleDragEnd);
    }

    item.querySelector('.edit-btn').addEventListener('click', () => loadForEditing(i));
    item.querySelector('.delete-btn').addEventListener('click', () => deleteQuestion(i));

    questionList.appendChild(item);
  };

  active.forEach(renderItem);

  if (archived.length > 0) {
    const divider = document.createElement('p');
    divider.className = 'empty-state';
    divider.style.cssText = 'margin-top:16px;margin-bottom:4px;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;opacity:0.3';
    divider.textContent = `Archive (${archived.length})`;
    questionList.appendChild(divider);
    archived.forEach(renderItem);
  }
}

// ======================
//  DRAG AND DROP
// ======================

function handleDragStart(e) {
  dragSrcIndex = parseInt(e.currentTarget.dataset.index);
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  document.querySelectorAll('.question-item').forEach(el => el.classList.remove('drag-over'));
  e.currentTarget.classList.add('drag-over');
}

function handleDrop(e) {
  e.preventDefault();
  const dropIndex = parseInt(e.currentTarget.dataset.index);
  if (dropIndex === dragSrcIndex) return;

  const moved = questions.splice(dragSrcIndex, 1)[0];
  questions.splice(dropIndex, 0, moved);

  // Adjust editingIndex if it was affected by the reorder
  if (editingIndex === dragSrcIndex) {
    editingIndex = dropIndex;
  } else if (editingIndex > dragSrcIndex && editingIndex <= dropIndex) {
    editingIndex--;
  } else if (editingIndex < dragSrcIndex && editingIndex >= dropIndex) {
    editingIndex++;
  }

  renderQuestionList();
  persistQuestions();
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.question-item').forEach(el => el.classList.remove('drag-over'));
  dragSrcIndex = null;
}

// ======================
//  CELEBRATION MESSAGES
// ======================

function renderMessageList() {
  if (!messageListEl) return;

  if (celebrationMessages.length === 0) {
    messageListEl.innerHTML = '<p class="empty-state">No messages yet.</p>';
    return;
  }

  messageListEl.innerHTML = '';
  celebrationMessages.forEach((msg, i) => {
    const item = document.createElement('div');
    item.className = 'question-item';
    item.innerHTML = `
      <span class="question-item-text">${escapeHtml(msg)}</span>
      <button class="item-btn delete msg-delete-btn" data-index="${i}">Delete</button>
    `;
    item.querySelector('.msg-delete-btn').addEventListener('click', () => {
      celebrationMessages.splice(i, 1);
      renderMessageList();
      persistMessages();
    });
    messageListEl.appendChild(item);
  });
}

function handleAddMessage() {
  const text = messageInputEl.value.trim();
  if (!text) {
    messageErrorEl.textContent = 'Message cannot be empty.';
    return;
  }
  messageErrorEl.textContent = '';
  celebrationMessages.push(text);
  messageInputEl.value = '';
  renderMessageList();
  persistMessages();
}

// ======================
//  SCORE TIERS
// ======================

function renderScoreTierList() {
  if (!scoreTierListEl) return;
  scoreTierListEl.innerHTML = '';

  scoreTiers.forEach((tier, i) => {
    const card = document.createElement('div');
    card.className = 'question-item';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'stretch';
    card.style.gap = '10px';
    card.style.padding = '14px';

    const labelDescriptions = ['1st play', '2nd play', '3rd+ play'];

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <strong style="font-size:1rem">Score: ${tier.score}</strong>
        <button class="item-btn delete tier-delete-btn" data-index="${i}">Delete</button>
      </div>
      ${tier.labels.map((lbl, li) => `
        <div>
          <label class="field-label" style="font-size:0.75rem;margin-bottom:4px">${labelDescriptions[li]}</label>
          <input class="creator-input tier-label-input" data-tier="${i}" data-label="${li}"
                 value="${escapeHtml(lbl)}" style="width:100%;box-sizing:border-box">
        </div>
      `).join('')}
      <div>
        <label class="field-label" style="font-size:0.75rem;margin-bottom:4px">CTA <span style="font-weight:400;opacity:0.6">(supports HTML)</span></label>
        <textarea class="creator-input tier-cta-input" data-tier="${i}"
                  rows="2" style="width:100%;box-sizing:border-box;resize:vertical">${escapeHtml(tier.cta)}</textarea>
      </div>
    `;

    card.querySelector('.tier-delete-btn').addEventListener('click', () => {
      scoreTiers.splice(i, 1);
      // Renumber scores
      scoreTiers.forEach((t, idx) => { t.score = idx; });
      renderScoreTierList();
      persistScoreTiers();
    });

    card.querySelectorAll('.tier-label-input').forEach(input => {
      input.addEventListener('input', () => {
        const ti = parseInt(input.dataset.tier);
        const li = parseInt(input.dataset.label);
        scoreTiers[ti].labels[li] = input.value;
        persistScoreTiers();
      });
    });

    card.querySelector('.tier-cta-input').addEventListener('input', e => {
      const ti = parseInt(e.target.dataset.tier);
      scoreTiers[ti].cta = e.target.value;
      persistScoreTiers();
    });

    scoreTierListEl.appendChild(card);
  });

  // Add tier button
  const addBtn = document.createElement('button');
  addBtn.className = 'btn secondary';
  addBtn.textContent = `+ Add Score ${scoreTiers.length}`;
  addBtn.style.marginTop = '8px';
  addBtn.addEventListener('click', () => {
    scoreTiers.push({
      score: scoreTiers.length,
      labels: ['', '', ''],
      cta: ''
    });
    renderScoreTierList();
    persistScoreTiers();
  });
  scoreTierListEl.appendChild(addBtn);
}

// ======================
//  CODE GENERATION
// ======================

function jsString(str) {
  const escaped = str
    .replace(/\\/g, '\\\\')
    .replace(/'/g,  "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '');
  return `'${escaped}'`;
}

function generateCode() {
  if (questions.length === 0) {
    codePre.textContent = '// No questions to generate yet.';
    codeOutput.classList.remove('hidden');
    return;
  }

  const lines = ['const questions = ['];

  questions.forEach((q, i) => {
    const isLast    = i === questions.length - 1;
    const hasReveal = !!(q.revealImage || q.revealCaption);
    const hasDate   = !!q.date;
    // status always present; date, revealImage, revealCaption are optional
    const hasAfterExplanation = hasReveal || true; // status always follows

    lines.push('  {');
    lines.push(`    type: ${jsString(q.type)},`);
    lines.push(`    content: ${jsString(q.content)},`);
    lines.push(`    answer: ${jsString(q.answer)},`);
    lines.push(`    explanation: ${jsString(q.explanation)},`);

    if (q.revealImage) {
      const hasCaption = !!q.revealCaption;
      lines.push(`    revealImage: ${jsString(q.revealImage)}${hasCaption ? ',' : ','}`);
    }
    if (q.revealCaption) {
      lines.push(`    revealCaption: ${jsString(q.revealCaption)},`);
    }

    lines.push(`    status: ${jsString(q.status || 'active')}${hasDate ? ',' : ''}`);
    if (hasDate) {
      lines.push(`    date: ${jsString(q.date)}`);
    }

    lines.push('  }' + (isLast ? '' : ','));
  });

  lines.push('];');

  codePre.textContent = lines.join('\n');
  codeOutput.classList.remove('hidden');
  codeOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ======================
//  COPY TO CLIPBOARD
// ======================

function copyToClipboard() {
  const text = codePre.textContent;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showCopyFeedback();
    }).catch(() => {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity  = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showCopyFeedback();
}

function exportJson() {
  const payload = { questions, celebrationMessages, scoreTiers };
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'questions.json';
  a.click();
  URL.revokeObjectURL(url);
}

function showCopyFeedback() {
  copyFeedback.textContent = 'Copied to clipboard!';
  setTimeout(() => { copyFeedback.textContent = ''; }, 2000);
}

// ======================
//  INIT
// ======================

function init() {
  initTypeSelector();
  initAnswerSelector();
  initStatusSelector();
  initLivePreview();

  addQuestionBtn.addEventListener('click',   handleAddOrUpdate);
  clearFormBtn.addEventListener('click',    clearForm);
  exportJsonBtn.addEventListener('click',   exportJson);
  generateBtn.addEventListener('click',     generateCode);
  copyBtn.addEventListener('click',         copyToClipboard);
  addMessageBtn.addEventListener('click',   handleAddMessage);
  document.getElementById('archiveConfirmBtn').addEventListener('click', confirmArchive);
  document.getElementById('deleteConfirmBtn').addEventListener('click',  confirmDelete);
  document.getElementById('deleteCancelBtn').addEventListener('click',   closeDeleteModal);
  document.getElementById('deleteModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDeleteModal();
  });

  // Load any previously saved data
  loadQuestionsFromStorage();
  loadMessagesFromStorage();
  loadScoreTiersFromStorage();
  initZoom();
  initFileUpload();

  // Set initial field/visibility state
  updateContentField();
  updateRevealVisibility();
  updatePreview();
  renderQuestionList();
  renderMessageList();
  renderScoreTierList();
}

init();
