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
const explanationInput   = document.getElementById('explanationInput');
const revealSection      = document.getElementById('revealSection');
const revealImageInput   = document.getElementById('revealImageInput');
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
const codeOutput    = document.getElementById('codeOutput');
const codePre       = document.getElementById('codePre');
const copyBtn       = document.getElementById('copyBtn');
const copyFeedback  = document.getElementById('copyFeedback');
const statusSelector = document.getElementById('statusSelector');
const dateInput      = document.getElementById('dateInput');

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

function updateContentField() {
  if (currentType === 'text') {
    contentInput.classList.remove('hidden');
    contentUrl.classList.add('hidden');
    contentLabel.textContent = 'Question Text';
  } else if (currentType === 'image') {
    contentInput.classList.add('hidden');
    contentUrl.classList.remove('hidden');
    contentLabel.textContent = 'Image URL';
    contentUrl.placeholder = 'https://example.com/image.jpg';
  } else if (currentType === 'audio') {
    contentInput.classList.add('hidden');
    contentUrl.classList.remove('hidden');
    contentLabel.textContent = 'Audio URL';
    contentUrl.placeholder = 'https://example.com/audio.mp3';
  }
}

function updateRevealVisibility() {
  if (currentType === 'text') {
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
  }

  // Explanation
  previewExplanation.textContent = explanation;

  // Reveal block
  if (revealImg || revealCap) {
    if (revealImg) {
      previewRevealImg.src = revealImg;
      previewRevealImg.classList.remove('hidden');
    } else {
      previewRevealImg.classList.add('hidden');
    }
    previewRevealCaption.textContent = revealCap || '';
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
  [contentInput, contentUrl, explanationInput, revealImageInput, revealCaptionInput]
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

  const revealImg = revealImageInput.value.trim();
  const revealCap = revealCaptionInput.value.trim();
  const dateVal   = dateInput.value.trim();

  if (revealImg) obj.revealImage   = revealImg;
  if (revealCap) obj.revealCaption = revealCap;

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

  contentInput.value       = '';
  contentUrl.value         = '';
  explanationInput.value   = '';
  revealImageInput.value   = '';
  revealCaptionInput.value = '';
  dateInput.value          = '';

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
  explanationInput.value   = q.explanation;
  revealImageInput.value   = q.revealImage   || '';
  revealCaptionInput.value = q.revealCaption || '';

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

function deleteQuestion(index) {
  if (editingIndex === index) {
    clearForm();
  } else if (editingIndex > index) {
    editingIndex--;
  }
  questions.splice(index, 1);
  renderQuestionList();
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
  questionCount.textContent = questions.length;

  if (questions.length === 0) {
    questionList.innerHTML = '<p class="empty-state">No questions yet. Add one above.</p>';
    return;
  }

  questionList.innerHTML = '';

  questions.forEach((q, i) => {
    const item = document.createElement('div');
    item.className = 'question-item';
    item.draggable  = true;
    item.dataset.index = i;

    const preview = q.content.length > 55
      ? q.content.slice(0, 55) + '…'
      : q.content;

    const statusLabel = (q.status || 'active');
    const dateLabel   = q.date ? ` · ${q.date}` : '';

    item.innerHTML = `
      <span class="drag-handle" title="Drag to reorder">⠿</span>
      <span class="question-item-type">${q.type}</span>
      <span class="question-item-text">${escapeHtml(preview)}</span>
      <span class="question-item-answer">${q.answer.toUpperCase()}</span>
      <span class="question-item-type">${statusLabel}${dateLabel}</span>
      <button class="item-btn edit-btn" data-index="${i}">Edit</button>
      <button class="item-btn delete delete-btn" data-index="${i}">Delete</button>
    `;

    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover',  handleDragOver);
    item.addEventListener('drop',      handleDrop);
    item.addEventListener('dragend',   handleDragEnd);

    item.querySelector('.edit-btn').addEventListener('click', () => loadForEditing(i));
    item.querySelector('.delete-btn').addEventListener('click', () => deleteQuestion(i));

    questionList.appendChild(item);
  });
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
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.question-item').forEach(el => el.classList.remove('drag-over'));
  dragSrcIndex = null;
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

  addQuestionBtn.addEventListener('click', handleAddOrUpdate);
  clearFormBtn.addEventListener('click',   clearForm);
  generateBtn.addEventListener('click',    generateCode);
  copyBtn.addEventListener('click',        copyToClipboard);

  // Set initial field/visibility state
  updateContentField();
  updateRevealVisibility();
  updatePreview();
  renderQuestionList();
}

init();
