import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

const viewer = document.querySelector("#pdf-viewer");
const canvas = document.querySelector("#pdf-canvas");
const context = canvas.getContext("2d");
const loading = document.querySelector("#loading");
const pageControls = document.querySelector("#page-controls");
const pageNumber = document.querySelector("#page-number");
const previousPage = document.querySelector("#previous-page");
const nextPage = document.querySelector("#next-page");
const fileName = document.querySelector("#file-name");
const emptyState = document.querySelector("#empty-state");
const waitingState = document.querySelector("#waiting-state");
const collectionCount = document.querySelector("#collection-count");
const rotationStatus = document.querySelector("#rotation-status");
const button = document.querySelector("#another-pdf");
const soundToggle = document.querySelector("#sound-toggle");
const beatLight = document.querySelector("#beat-light");
const bpmLabel = document.querySelector("#bpm-label");
const dynamicsLabel = document.querySelector("#dynamics-label");
const dynamicsToggle = document.querySelector("#dynamics-toggle");
const stopButton = document.querySelector("#stop-button");
const endSessionButton = document.querySelector("#end-session-button");
const startSessionButton = document.querySelector("#start-session-button");
const pdfCountdown = document.querySelector("#pdf-countdown");
const totalSessionCountdown = document.querySelector("#total-session-countdown");
const durationForm = document.querySelector("#duration-form");
const durationInput = document.querySelector("#duration-input");
const durationLabel = document.querySelector("#duration-label");
const totalSessionForm = document.querySelector("#total-session-form");
const totalSessionInput = document.querySelector("#total-session-input");
const totalSessionStatus = document.querySelector("#total-session-status");
const folderInput = document.querySelector("#folder-input");
const folderButton = document.querySelector("#folder-button");
const folderStatus = document.querySelector("#folder-status");
const practiceModeInput = document.querySelector("#practice-mode-input");
const practiceModeStatus = document.querySelector("#practice-mode-status");
const singlePdfPicker = document.querySelector("#single-pdf-picker");
const singlePdfInput = document.querySelector("#single-pdf-input");
const singlePdfStatus = document.querySelector("#single-pdf-status");
const timeSignatureForm = document.querySelector("#time-signature-form");
const timeSignatureInput = document.querySelector("#time-signature-input");
const timeSignatureStatus = document.querySelector("#time-signature-status");
const tempoRangeForm = document.querySelector("#tempo-range-form");
const minBpmInput = document.querySelector("#min-bpm-input");
const maxBpmInput = document.querySelector("#max-bpm-input");
const tempoRangeStatus = document.querySelector("#tempo-range-status");
const targetTempoForm = document.querySelector("#target-tempo-form");
const targetTempoInput = document.querySelector("#target-tempo-input");
const targetTempoStatus = document.querySelector("#target-tempo-status");
const tempoMethodForm = document.querySelector("#tempo-method-form");
const tempoMethodInput = document.querySelector("#tempo-method-input");
const tempoMethodStatus = document.querySelector("#tempo-method-status");
const sectionEditor = document.querySelector("#section-editor");
const openSectionEditorButton = document.querySelector("#open-section-editor");
const closeSectionEditorButton = document.querySelector("#close-section-editor");
const sectionSourceInput = document.querySelector("#section-source-input");
const sectionNameInput = document.querySelector("#section-name-input");
const addFragmentButton = document.querySelector("#add-fragment-button");
const sectionEditorCanvas = document.querySelector("#section-editor-canvas");
const sectionEditorContext = sectionEditorCanvas.getContext("2d");
const sectionEditorOverlay = document.querySelector("#section-editor-overlay");
const sectionEditorLoading = document.querySelector("#section-editor-loading");
const sectionEditorPageNumber = document.querySelector("#section-editor-page-number");
const sectionEditorPreviousPage = document.querySelector("#section-editor-previous-page");
const sectionEditorNextPage = document.querySelector("#section-editor-next-page");
const sectionFragmentList = document.querySelector("#section-fragment-list");
const saveSectionButton = document.querySelector("#save-section-button");
const exportSectionsButton = document.querySelector("#export-sections-button");
const sectionEditorStatus = document.querySelector("#section-editor-status");
let documentPdf;
let currentPage = 1;
let playlist = [];
let playlistIndex = 0;
let rotationTimer;
let countdownTimer;
let displayDurationSeconds = 60;
let currentDisplayDurationSeconds = displayDurationSeconds;
let totalSessionSeconds = null;
let sessionDurationPlan = [];
let audioContext;
let visualMetronomeTimer;
let currentBpm = 60;
let selectedFolderPdfs = [];
let selectedSinglePdf = null;
let practiceMode = "whole-piece";
let isStopped = true;
let sessionStarted = false;
let metronomeEnabled = true;
let beatsPerMeasure = 4;
let beatInMeasure = 0;
let minimumBpm = 60;
let maximumBpm = 120;
let targetTempo = Number(targetTempoInput.value);
let tempoMethod = "random";
let activeTempoMethod = "random";
let rampTimer;
let sectionElapsedMs = 0;
let sectionActiveSince = null;
let totalSessionElapsedMs = 0;
let totalSessionActiveSince = null;
let totalSessionTimer;
let totalSessionCountdownTimer;
let dynamicsEnabled = false;
let savedSections = [];
let editorPdf;
let editorSourceItem = null;
let editorPage = 1;
let draftFragments = [];
let editorIsDrawing = false;
let editorDragStart = null;
let editorSelection = null;
const defaultPracticeSettings = Object.freeze({
  minimumBpm,
  maximumBpm,
  timeSignature: timeSignatureInput.value.trim(),
  targetTempo,
});

const dynamicsChoices = ["Piano (p)", "Mezzo-piano (mp)", "Mezzo-forte (mf)", "Forte (f)", "Crescendo", "Decrescendo"];

function showSetupView() {
  document.body.dataset.view = "setup";
}

function showPracticeView() {
  document.body.dataset.view = "practice";
}

function getActivePdfs() {
  if (practiceMode === "single-section") return selectedSinglePdf ? [selectedSinglePdf] : [];
  if (practiceMode === "saved-sections") return savedSections;
  return selectedFolderPdfs;
}

function populateSinglePdfPicker() {
  singlePdfInput.replaceChildren();
  savedSections.forEach((section, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = section.name;
    singlePdfInput.append(option);
  });
  singlePdfInput.disabled = !savedSections.length;
  selectedSinglePdf = savedSections[0] ?? null;
  singlePdfStatus.textContent = selectedSinglePdf ? "Selected: " + selectedSinglePdf.name : "Create or import saved sections first";
}

function updatePracticeModeUi() {
  const isSingle = practiceMode === "single-section";
  singlePdfPicker.hidden = !isSingle;
  // The setup layout uses flex, so set an inline display value as well as the
  // semantic hidden attribute. This guarantees the picker is absent outside
  // One section mode even if a browser stylesheet overrides [hidden].
  singlePdfPicker.style.display = isSingle ? "flex" : "none";
  const isSavedSections = practiceMode === "saved-sections";
  totalSessionForm.hidden = false;
  durationLabel.textContent = isSingle ? "Refresh tempo and dynamics every" : "Display each PDF for";
  button.firstChild.textContent = isSingle ? "Refresh now " : "Next now ";
  if (isSavedSections) {
    sessionDurationPlan = [];
    totalSessionForm.hidden = false;
    practiceModeStatus.textContent = savedSections.length
      ? savedSections.length + " saved section" + (savedSections.length === 1 ? "" : "s") + " ready"
      : "Create or import saved sections with the Section Editor";
  } else if (isSingle) {
    sessionDurationPlan = [];
    practiceModeStatus.textContent = "Repeat one saved section; tempo and dynamics refresh each interval";
    totalSessionStatus.textContent = totalSessionSeconds === null
      ? "Optional second timer"
      : "Total timer: " + Math.round(totalSessionSeconds / 60) + " minutes";
  } else {
    practiceModeStatus.textContent = selectedFolderPdfs.length
      ? selectedFolderPdfs.length + " full score PDF" + (selectedFolderPdfs.length === 1 ? "" : "s") + " ready"
      : "Choose a folder containing a full score PDF";
  }
}

function stopDynamicsPractice() {
  dynamicsLabel.hidden = true;
}

function startDynamicsPractice() {
  if (!dynamicsEnabled || !sessionStarted) {
    dynamicsLabel.hidden = true;
    return;
  }
  const choice = dynamicsChoices[Math.floor(Math.random() * dynamicsChoices.length)];
  dynamicsLabel.textContent = `Dynamics · ${choice}`;
  dynamicsLabel.hidden = false;
}

function parseTimeSignature(value) {
  const match = typeof value === "string" && value.trim().match(/^(\d+)\/(\d+)$/);
  const numerator = match && Number(match[1]);
  const denominator = match && Number(match[2]);
  const allowedDenominators = [1, 2, 4, 8, 16];
  if (!numerator || numerator > 32 || !allowedDenominators.includes(denominator)) return null;
  return { numerator, value: `${numerator}/${denominator}` };
}

const tempoMethodLabels = {
  random: "Random BPM",
  "half-target": "Half target",
  "build-up": "Build up",
};

function isTempoMethod(value) {
  return Object.prototype.hasOwnProperty.call(tempoMethodLabels, value);
}

function methodMayBuildUp() {
  return tempoMethod === "build-up";
}

function showBuildUpDurationError() {
  tempoMethodStatus.textContent = "Build up requires at least 60 seconds per PDF";
}

function calculateSessionDurations(pdfCount) {
  const baseDuration = Math.floor(totalSessionSeconds / pdfCount);
  const remainingSeconds = totalSessionSeconds % pdfCount;
  return Array.from({ length: pdfCount }, (_, index) => baseDuration + (index < remainingSeconds ? 1 : 0));
}

async function prepareSessionDurationPlan() {
  if (totalSessionSeconds === null || practiceMode === "single-section") {
    sessionDurationPlan = [];
    return true;
  }
  const pdfCount = getActivePdfs().length;
  if (!pdfCount) {
    totalSessionStatus.textContent = "Choose a folder with PDFs first";
    return false;
  }
  sessionDurationPlan = calculateSessionDurations(pdfCount);
  const shortestDuration = Math.min(...sessionDurationPlan);
  const longestDuration = Math.max(...sessionDurationPlan);
  totalSessionStatus.textContent = shortestDuration === longestDuration
    ? `${pdfCount} PDFs · ${shortestDuration}s each`
    : `${pdfCount} PDFs · ${shortestDuration}–${longestDuration}s each`;
  if (methodMayBuildUp() && shortestDuration < 60) {
    showBuildUpDurationError();
    return false;
  }
  return true;
}

function setCurrentTempo(tempo, method) {
  currentBpm = tempo;
  bpmLabel.textContent = `Metronome · ${currentBpm} BPM · ${method}`;
  if (sessionStarted) startVisualMetronome();
}

function updateTempoMethodStatus(prefix = "Active") {
  tempoMethodStatus.textContent = `${prefix}: ${tempoMethodLabels[activeTempoMethod]}`;
}

function resetSectionClock() {
  sectionElapsedMs = 0;
  sectionActiveSince = Date.now();
}

function pauseSectionClock() {
  if (sectionActiveSince === null) return;
  sectionElapsedMs += Date.now() - sectionActiveSince;
  sectionActiveSince = null;
}

function resumeSectionClock() {
  sectionActiveSince = Date.now();
}

function getSectionElapsedMs() {
  return sectionElapsedMs + (sectionActiveSince === null ? 0 : Date.now() - sectionActiveSince);
}

function getSectionRemainingMs() {
  return Math.max(0, (currentDisplayDurationSeconds * 1000) - getSectionElapsedMs());
}

function hasTotalSessionLimit() {
  return practiceMode === "single-section" && totalSessionSeconds !== null;
}

function resetTotalSessionClock() {
  totalSessionElapsedMs = 0;
  totalSessionActiveSince = hasTotalSessionLimit() ? Date.now() : null;
}

function pauseTotalSessionClock() {
  if (totalSessionActiveSince === null) return;
  totalSessionElapsedMs += Date.now() - totalSessionActiveSince;
  totalSessionActiveSince = null;
}

function resumeTotalSessionClock() {
  if (hasTotalSessionLimit()) totalSessionActiveSince = Date.now();
}

function getTotalSessionRemainingMs() {
  return Math.max(0, (totalSessionSeconds * 1000) - (totalSessionElapsedMs + (totalSessionActiveSince === null ? 0 : Date.now() - totalSessionActiveSince)));
}

function clearTotalSessionTimers() {
  clearTimeout(totalSessionTimer);
  clearInterval(totalSessionCountdownTimer);
}

function startTotalSessionCountdown() {
  clearTotalSessionTimers();
  if (!hasTotalSessionLimit()) {
    totalSessionCountdown.textContent = "Total time: no limit";
    return;
  }
  const remainingMs = getTotalSessionRemainingMs();
  const endsAt = Date.now() + remainingMs;
  const updateTotalCountdown = () => {
    const secondsLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    totalSessionCountdown.textContent = "Total time: " + secondsLeft + "s left";
  };
  updateTotalCountdown();
  totalSessionCountdownTimer = setInterval(updateTotalCountdown, 250);
  totalSessionTimer = setTimeout(() => {
    if (sessionStarted && !isStopped) void completeRound();
  }, remainingMs);
}

function startBuildUp() {
  clearTimeout(rampTimer);
  const transitions = Math.ceil(currentDisplayDurationSeconds / 30) - 1;

  const scheduleTempo = () => {
    if (!sessionStarted || isStopped || activeTempoMethod !== "build-up") return;
    const elapsedMs = getSectionElapsedMs();
    const stepIndex = Math.min(transitions, Math.floor(elapsedMs / 30000));
    const progress = transitions > 0 ? stepIndex / transitions : 0;
    const nextTempo = Number((minimumBpm + ((maximumBpm - minimumBpm) * progress)).toFixed(1));
    setCurrentTempo(nextTempo, tempoMethodLabels["build-up"]);
    if (stepIndex >= transitions) return;
    const nextStepAtMs = (stepIndex + 1) * 30000;
    rampTimer = setTimeout(scheduleTempo, Math.max(1, nextStepAtMs - elapsedMs));
  };

  scheduleTempo();
}

function beginTempoMethod() {
  clearTimeout(rampTimer);
  activeTempoMethod = tempoMethod;
  updateTempoMethodStatus();
}

function applyTempoForNewPdf() {
  if (activeTempoMethod === "random") {
    setRandomTempo();
  } else if (activeTempoMethod === "half-target") {
    setCurrentTempo(Math.max(1, Math.round(targetTempo / 2)), tempoMethodLabels["half-target"]);
  } else if (activeTempoMethod === "build-up") {
    startBuildUp();
  }
}

function applyPracticeSettings(settings, source = "the defaults") {
  const timeSignature = parseTimeSignature(settings?.timeSignature);
  const minimum = settings?.minBpm;
  const maximum = settings?.maxBpm;
  const isValid = Number.isInteger(minimum) && Number.isInteger(maximum)
    && minimum >= 1 && maximum <= 300 && minimum <= maximum && timeSignature;

  if (!isValid) {
    minimumBpm = defaultPracticeSettings.minimumBpm;
    maximumBpm = defaultPracticeSettings.maximumBpm;
    beatsPerMeasure = parseTimeSignature(defaultPracticeSettings.timeSignature).numerator;
    minBpmInput.value = minimumBpm;
    maxBpmInput.value = maximumBpm;
    timeSignatureInput.value = defaultPracticeSettings.timeSignature;
    tempoRangeStatus.textContent = "Using default range";
    timeSignatureStatus.textContent = "Using default time signature";
    targetTempo = defaultPracticeSettings.targetTempo;
    targetTempoInput.value = targetTempo;
    targetTempoStatus.textContent = `Default target: ${targetTempo} BPM`;
    return false;
  }

  minimumBpm = minimum;
  maximumBpm = maximum;
  targetTempo = Number.isInteger(settings?.targetTempo) && settings.targetTempo >= 1 && settings.targetTempo <= 300
    ? settings.targetTempo
    : defaultPracticeSettings.targetTempo;
  targetTempoInput.value = targetTempo;
  targetTempoStatus.textContent = `${targetTempo} BPM from ${source}`;
  beatsPerMeasure = timeSignature.numerator;
  minBpmInput.value = minimum;
  maxBpmInput.value = maximum;
  timeSignatureInput.value = timeSignature.value;
  tempoRangeStatus.textContent = `${minimum}–${maximum} BPM from ${source}`;
  timeSignatureStatus.textContent = `${timeSignature.value} from ${source}`;
  return true;
}

function tick() {
  const isAccent = beatInMeasure === 0;
  beatInMeasure = (beatInMeasure + 1) % beatsPerMeasure;
  beatLight.classList.remove("beat");
  // Restart the visual animation on every beat.
  void beatLight.offsetWidth;
  beatLight.classList.add("beat");

  if (!metronomeEnabled || audioContext?.state !== "running") return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = isAccent ? 1100 : 880;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(isAccent ? 0.3 : 0.14, audioContext.currentTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.055);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.06);
}

async function enableMetronome() {
  audioContext ??= new AudioContext();
  await audioContext.resume();
  metronomeEnabled = true;
  if (!isStopped) startVisualMetronome();
  soundToggle.textContent = "Sound off";
  soundToggle.classList.add("on");
}

async function disableMetronome() {
  metronomeEnabled = false;
  await audioContext?.suspend();
  soundToggle.textContent = "Sound on";
  soundToggle.classList.remove("on");
}

function startVisualMetronome() {
  clearInterval(visualMetronomeTimer);
  beatInMeasure = 0;
  tick();
  visualMetronomeTimer = setInterval(tick, 60000 / currentBpm);
}

async function completeRound() {
  if (targetTempo === null) {
    await finishSession();
    return;
  }

  clearTimeout(rotationTimer);
  clearInterval(countdownTimer);
  clearTimeout(rampTimer);
  clearTotalSessionTimers();
  stopDynamicsPractice();
  isStopped = true;
  sessionStarted = false;
  playlist = [];
  playlistIndex = 0;
  viewer.hidden = true;
  waitingState.hidden = false;
  emptyState.hidden = true;
  fileName.textContent = "Round complete";
  collectionCount.textContent = `Metronome continues at your target tempo of ${targetTempo} BPM.`;
  rotationStatus.textContent = "Round complete · Select End session to stop the metronome";
  pdfCountdown.textContent = "Section complete";
  totalSessionCountdown.textContent = "Total time complete";
  button.disabled = true;
  startSessionButton.textContent = "Session complete";
  startSessionButton.disabled = true;
  stopButton.disabled = true;
  endSessionButton.hidden = false;
  setCurrentTempo(targetTempo, "Target tempo");
  startVisualMetronome();
}

async function finishSession() {
  isStopped = true;
  sessionStarted = false;
  clearTimeout(rotationTimer);
  clearInterval(countdownTimer);
  clearTimeout(rampTimer);
  clearTotalSessionTimers();
  stopDynamicsPractice();
  clearInterval(visualMetronomeTimer);
  await audioContext?.suspend();
  playlist = [];
  playlistIndex = 0;
  viewer.hidden = true;
  waitingState.hidden = false;
  emptyState.hidden = true;
  fileName.textContent = "Session complete";
  collectionCount.textContent = "Every PDF in this round has been displayed.";
  rotationStatus.textContent = "Press Start session to begin a new round";
  pdfCountdown.textContent = "Round complete";
  totalSessionCountdown.textContent = "No session active";
  button.disabled = true;
  startSessionButton.textContent = "Start session";
  startSessionButton.disabled = false;
  stopButton.textContent = "Stop session";
  stopButton.classList.remove("resume");
  stopButton.disabled = true;
  endSessionButton.hidden = true;
  showSetupView();
}

function setRandomTempo() {
  const randomTempo = Math.floor(Math.random() * (maximumBpm - minimumBpm + 1)) + minimumBpm;
  setCurrentTempo(randomTempo, tempoMethodLabels.random);
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

async function startNewRound() {
  const activePdfs = getActivePdfs();
  if (!activePdfs.length) {
    playlist = [];
    playlistIndex = 0;
    return;
  }
  playlist = shuffle(activePdfs);
  playlistIndex = 0;
  if (totalSessionSeconds !== null && practiceMode !== "single-section") {
    if (sessionDurationPlan.length !== playlist.length) sessionDurationPlan = calculateSessionDurations(playlist.length);
    playlist = playlist.map((item, index) => ({ ...item, durationSeconds: sessionDurationPlan[index] }));
  }
}

function startCountdown() {
  if (isStopped) return;
  clearTimeout(rotationTimer);
  clearInterval(countdownTimer);
  const remainingMs = getSectionRemainingMs();
  const endsAt = Date.now() + remainingMs;
  const updateCountdown = () => {
    const secondsLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    rotationStatus.textContent = practiceMode === "single-section"
      ? "Tempo and dynamics refresh in " + secondsLeft + "s"
      : "Next PDF in " + secondsLeft + "s · " + (playlist.length - playlistIndex) + " remaining this round";
    pdfCountdown.textContent = "Section: " + secondsLeft + "s left";
  };
  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 250);
  rotationTimer = setTimeout(showNextPdf, remainingMs);
}

function refreshSinglePdfPractice() {
  resetSectionClock();
  applyTempoForNewPdf();
  startDynamicsPractice();
  startCountdown();
}

async function renderPage(page) {
  loading.hidden = false;
  canvas.hidden = true;
  const pdfPage = await documentPdf.getPage(page);
  const scale = Math.min(2, (viewer.clientWidth - 48) / pdfPage.getViewport({ scale: 1 }).width);
  const viewport = pdfPage.getViewport({ scale: Math.max(scale, 0.5) });
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  await pdfPage.render({ canvasContext: context, viewport }).promise;
  currentPage = page;
  pageNumber.textContent = `Page ${page} of ${documentPdf.numPages}`;
  previousPage.disabled = page === 1;
  nextPage.disabled = page === documentPdf.numPages;
  loading.hidden = true;
  canvas.hidden = false;
}

function getRelativePdfPath(item) {
  return item.path ?? item.file.webkitRelativePath.split("/").slice(1).join("/");
}

function refreshSectionSourceList() {
  sectionSourceInput.replaceChildren();
  selectedFolderPdfs.forEach((item, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = getRelativePdfPath(item);
    sectionSourceInput.append(option);
  });
  openSectionEditorButton.disabled = !selectedFolderPdfs.length;
}

function renderDraftFragments() {
  sectionFragmentList.replaceChildren();
  draftFragments.forEach((fragment, index) => {
    const entry = document.createElement("li");
    entry.textContent = "Page " + fragment.page + " · fragment " + (index + 1);
    const moveEarlier = document.createElement("button");
    moveEarlier.type = "button";
    moveEarlier.textContent = "↑";
    moveEarlier.disabled = index === 0;
    moveEarlier.title = "Move earlier";
    moveEarlier.addEventListener("click", () => {
      [draftFragments[index - 1], draftFragments[index]] = [draftFragments[index], draftFragments[index - 1]];
      renderDraftFragments();
      drawEditorMarkers();
    });
    const moveLater = document.createElement("button");
    moveLater.type = "button";
    moveLater.textContent = "↓";
    moveLater.disabled = index === draftFragments.length - 1;
    moveLater.title = "Move later";
    moveLater.addEventListener("click", () => {
      [draftFragments[index], draftFragments[index + 1]] = [draftFragments[index + 1], draftFragments[index]];
      renderDraftFragments();
      drawEditorMarkers();
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      draftFragments.splice(index, 1);
      renderDraftFragments();
      renderEditorPage();
    });
    entry.append(moveEarlier, moveLater, remove);
    sectionFragmentList.append(entry);
  });
}

function drawEditorMarkers() {
  sectionEditorOverlay.replaceChildren();
  const sourcePath = editorSourceItem && getRelativePdfPath(editorSourceItem);
  const savedFragments = savedSections.flatMap((section) => {
    if (section.sourcePath !== sourcePath) return [];
    return section.fragments
      .filter((fragment) => fragment.page === editorPage)
      .map((fragment, index) => ({ fragment, sectionName: section.name, fragmentNumber: index + 1 }));
  });
  savedFragments.forEach(({ fragment, sectionName, fragmentNumber }) => {
    const marker = document.createElement("span");
    marker.className = "saved-section-marker";
    marker.style.left = (fragment.x * 100) + "%";
    marker.style.top = (fragment.y * 100) + "%";
    marker.style.width = (fragment.width * 100) + "%";
    marker.style.height = (fragment.height * 100) + "%";
    const label = document.createElement("span");
    label.className = "saved-section-label";
    label.textContent = sectionName;
    marker.append(label);
    marker.title = sectionName + " · saved fragment " + fragmentNumber;
    marker.setAttribute("aria-label", marker.title);
    sectionEditorOverlay.append(marker);
  });
  const pageFragments = draftFragments.filter((fragment) => fragment.page === editorPage);
  pageFragments.forEach((fragment, index) => {
    const marker = document.createElement("span");
    marker.className = "section-fragment-marker";
    marker.style.left = (fragment.x * 100) + "%";
    marker.style.top = (fragment.y * 100) + "%";
    marker.style.width = (fragment.width * 100) + "%";
    marker.style.height = (fragment.height * 100) + "%";
    marker.textContent = String(draftFragments.indexOf(fragment) + 1);
    sectionEditorOverlay.append(marker);
  });
}

async function renderEditorPage() {
  if (!editorPdf) return;
  sectionEditorLoading.hidden = false;
  const page = await editorPdf.getPage(editorPage);
  const baseViewport = page.getViewport({ scale: 1 });
  const width = Math.min(960, Math.max(320, sectionEditor.clientWidth - 48));
  const viewport = page.getViewport({ scale: width / baseViewport.width });
  sectionEditorCanvas.width = Math.floor(viewport.width);
  sectionEditorCanvas.height = Math.floor(viewport.height);
  await page.render({ canvasContext: sectionEditorContext, viewport }).promise;
  sectionEditorPageNumber.textContent = "Page " + editorPage + " of " + editorPdf.numPages;
  sectionEditorPreviousPage.disabled = editorPage === 1;
  sectionEditorNextPage.disabled = editorPage === editorPdf.numPages;
  sectionEditorLoading.hidden = true;
  drawEditorMarkers();
}

async function loadEditorSource() {
  editorSourceItem = selectedFolderPdfs[Number(sectionSourceInput.value)] ?? null;
  if (!editorSourceItem) return;
  sectionEditorStatus.textContent = "Loading " + editorSourceItem.name + "…";
  editorPdf = await pdfjsLib.getDocument({ data: await editorSourceItem.file.arrayBuffer() }).promise;
  editorPage = 1;
  editorIsDrawing = true;
  addFragmentButton.classList.add("active");
  addFragmentButton.textContent = "Drawing: drag on the page";
  await renderEditorPage();
  sectionEditorStatus.textContent = "Drag directly on the page to add a fragment in reading order.";
}

function normalizeEditorSelection(event) {
  const bounds = sectionEditorOverlay.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
  const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
  return { x, y };
}

async function renderSavedSection(section) {
  loading.hidden = false;
  canvas.hidden = true;
  const scale = 1.5;
  const padding = 18;
  const crops = [];
  for (const fragment of section.fragments) {
    const page = await documentPdf.getPage(fragment.page);
    const viewport = page.getViewport({ scale });
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = Math.floor(viewport.width);
    sourceCanvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: sourceCanvas.getContext("2d"), viewport }).promise;
    const crop = document.createElement("canvas");
    crop.width = Math.max(1, Math.round(sourceCanvas.width * fragment.width));
    crop.height = Math.max(1, Math.round(sourceCanvas.height * fragment.height));
    crop.getContext("2d").drawImage(sourceCanvas, Math.round(sourceCanvas.width * fragment.x), Math.round(sourceCanvas.height * fragment.y), crop.width, crop.height, 0, 0, crop.width, crop.height);
    crops.push(crop);
  }
  const outputWidth = Math.max(...crops.map((crop) => crop.width)) + (padding * 2);
  const outputHeight = crops.reduce((height, crop) => height + crop.height, padding * 2) + (Math.max(0, crops.length - 1) * padding);
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  context.fillStyle = "white";
  context.fillRect(0, 0, outputWidth, outputHeight);
  let y = padding;
  crops.forEach((crop) => {
    context.drawImage(crop, Math.round((outputWidth - crop.width) / 2), y);
    y += crop.height + padding;
  });
  loading.hidden = true;
  canvas.hidden = false;
}

async function showNextPdf() {
  if (isStopped) return;
  button.disabled = true;
  button.firstChild.textContent = "Loading… ";
  try {
    if (playlistIndex >= playlist.length && playlist.length) {
      if (practiceMode === "single-section") {
        refreshSinglePdfPractice();
        return;
      }
      await completeRound();
      return;
    }
    if (playlistIndex >= playlist.length) await startNewRound();
    const result = playlist[playlistIndex];
    currentDisplayDurationSeconds = result?.durationSeconds ?? displayDurationSeconds;
    if (!result) {
      viewer.hidden = true;
      waitingState.hidden = true;
      emptyState.hidden = false;
      fileName.textContent = "Your collection is empty";
      collectionCount.textContent = "";
      rotationStatus.textContent = "";
      pdfCountdown.textContent = "No PDF selected";
      return;
    }
    waitingState.hidden = true;
    emptyState.hidden = true;
    viewer.hidden = false;
    pageControls.hidden = true;
    loading.hidden = false;
    canvas.hidden = true;
    // PDF.js renders into a canvas, avoiding the browser's unreliable native PDF plugin.
    const sourceFile = result.sourceFile ?? result.file;
    const source = sourceFile ? { data: await sourceFile.arrayBuffer() } : encodeURI(result.pdf);
    documentPdf = await pdfjsLib.getDocument(source).promise;
    if (result.type === "saved-section") {
      await renderSavedSection(result);
    } else {
      await renderPage(1);
    }
    resetSectionClock();
    applyTempoForNewPdf();
    startDynamicsPractice();
    pageControls.hidden = result.type === "saved-section";
    fileName.textContent = result.name;
    collectionCount.textContent = practiceMode === "single-section"
      ? "One section · tempo and dynamics refresh every interval"
      : practiceMode === "saved-sections"
        ? playlist.length + " saved section" + (playlist.length === 1 ? "" : "s") + " · Round position " + (playlistIndex + 1) + " of " + playlist.length
        : playlist.length + " PDF" + (playlist.length === 1 ? "" : "s") + " in your collection · Round position " + (playlistIndex + 1) + " of " + playlist.length;
    playlistIndex += 1;
    startCountdown();
  } catch (error) {
    console.error("Practice Randomizer load error", error);
    fileName.textContent = "Couldn’t load your collection";
    const detail = error instanceof Error && error.message ? error.message : "Unknown PDF rendering error";
    collectionCount.textContent = "Try choosing the folder again, then start a new session.";
    rotationStatus.textContent = "Load error: " + detail;
  } finally {
    button.disabled = isStopped;
    button.firstChild.textContent = practiceMode === "single-section" ? "Refresh now " : "Next now ";
  }
}

startSessionButton.addEventListener("click", async () => {
  if (sessionStarted) return;
  if (!getActivePdfs().length) {
    folderStatus.textContent = practiceMode === "single-section"
      ? "Choose a saved section before starting"
      : "Choose a folder containing PDFs before starting";
    folderButton.focus();
    return;
  }
  if (!(await prepareSessionDurationPlan())) return;
  if ((practiceMode === "single-section" || totalSessionSeconds === null) && methodMayBuildUp() && displayDurationSeconds < 60) {
    showBuildUpDurationError();
    return;
  }
  sessionStarted = true;
  isStopped = false;
  resetTotalSessionClock();
  startTotalSessionCountdown();
  showPracticeView();
  playlist = [];
  playlistIndex = 0;
  startSessionButton.textContent = "Session running";
  startSessionButton.disabled = true;
  stopButton.disabled = false;
  endSessionButton.hidden = true;
  if (metronomeEnabled) await enableMetronome();
  beginTempoMethod();
  showNextPdf();
});
button.addEventListener("click", showNextPdf);
soundToggle.addEventListener("click", () => {
  if (metronomeEnabled) return disableMetronome();
  return enableMetronome();
});
dynamicsToggle.addEventListener("click", () => {
  dynamicsEnabled = !dynamicsEnabled;
  dynamicsToggle.textContent = dynamicsEnabled ? "Dynamics on" : "Dynamics off";
  dynamicsToggle.classList.toggle("on", dynamicsEnabled);
  startDynamicsPractice();
});
stopButton.addEventListener("click", async () => {
  if (!isStopped) {
    isStopped = true;
    clearTimeout(rotationTimer);
    clearInterval(countdownTimer);
    pauseSectionClock();
    pauseTotalSessionClock();
    clearTimeout(rampTimer);
    clearTotalSessionTimers();
    totalSessionCountdown.textContent = "Total time: paused";
    button.disabled = true;
    stopButton.textContent = "Resume session";
    stopButton.classList.add("resume");
    endSessionButton.hidden = false;
    rotationStatus.textContent = "PDF rotation paused · Metronome continues";
    pdfCountdown.textContent = "Section: paused";
    return;
  }

  isStopped = false;
  resumeSectionClock();
  resumeTotalSessionClock();
  startTotalSessionCountdown();
  if (activeTempoMethod === "build-up") startBuildUp();
  button.disabled = false;
  stopButton.textContent = "Stop session";
  stopButton.classList.remove("resume");
  endSessionButton.hidden = true;
  startCountdown();
});
endSessionButton.addEventListener("click", finishSession);
durationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const requestedDuration = Number(durationInput.value);
  if (!Number.isInteger(requestedDuration) || requestedDuration < 1 || requestedDuration > 3600) {
    durationInput.focus();
    return;
  }
  if (requestedDuration < 60 && methodMayBuildUp()) {
    showBuildUpDurationError();
    durationInput.focus();
    return;
  }
  displayDurationSeconds = requestedDuration;
  if (practiceMode !== "single-section") {
    totalSessionSeconds = null;
    sessionDurationPlan = [];
    totalSessionStatus.textContent = "Using manual duration";
  } else {
    totalSessionStatus.textContent = totalSessionSeconds === null
      ? "Set total time for a second timer"
      : "Total timer: " + Math.round(totalSessionSeconds / 60) + " minutes";
  }
  startCountdown();
});
totalSessionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (sessionStarted) {
    totalSessionStatus.textContent = "End the current session before changing its total time";
    return;
  }
  const requestedMinutes = Number(totalSessionInput.value);
  if (!Number.isFinite(requestedMinutes) || requestedMinutes < 1 || requestedMinutes > 1440) {
    totalSessionStatus.textContent = "Use 1–1,440 minutes";
    totalSessionInput.focus();
    return;
  }
  totalSessionSeconds = Math.round(requestedMinutes * 60);
  if (practiceMode === "single-section") {
    sessionDurationPlan = [];
    totalSessionStatus.textContent = "Total timer: " + Math.round(totalSessionSeconds / 60) + " minutes";
    return;
  }
  if (!(await prepareSessionDurationPlan())) return;
  durationInput.value = Math.floor(totalSessionSeconds / (sessionDurationPlan.length || 1));
});
practiceModeInput.addEventListener("change", async () => {
  if (sessionStarted) return;
  practiceMode = practiceModeInput.value;
  updatePracticeModeUi();
  if (practiceMode !== "single-section" && totalSessionSeconds !== null) await prepareSessionDurationPlan();
});
singlePdfInput.addEventListener("change", () => {
  selectedSinglePdf = savedSections[Number(singlePdfInput.value)] ?? null;
  singlePdfStatus.textContent = selectedSinglePdf ? "Selected: " + selectedSinglePdf.name : "Choose a saved section";
});
folderButton.addEventListener("click", () => folderInput.click());
folderInput.addEventListener("change", async () => {
  const selectedFiles = [...folderInput.files];
  selectedFolderPdfs = selectedFiles
    .filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))
    .map((file) => ({ file, name: file.name, path: file.webkitRelativePath.split("/").slice(1).join("/") }));

  const settingsFile = selectedFiles.find((file) => {
    const pathParts = file.webkitRelativePath.split("/");
    return file.name === "practice-settings.json" && pathParts.length === 2;
  });
  let settings = null;
  if (settingsFile) {
    try {
      settings = JSON.parse(await settingsFile.text());
    } catch {
      settings = null;
    }
  }
  applyPracticeSettings(settings, "practice-settings.json");
  const sectionsFile = selectedFiles.find((file) => {
    const pathParts = file.webkitRelativePath.split("/");
    return file.name === "practice-sections.json" && pathParts.length === 2;
  });
  savedSections = [];
  if (sectionsFile) {
    try {
      const savedData = JSON.parse(await sectionsFile.text());
      savedSections = (Array.isArray(savedData.sections) ? savedData.sections : []).map((section) => {
        const sourceFile = selectedFolderPdfs.find((item) => item.path === section.source);
        const fragments = Array.isArray(section.fragments) ? section.fragments.filter((fragment) => Number.isInteger(fragment.page) && fragment.page >= 1 && ["x", "y", "width", "height"].every((key) => Number.isFinite(fragment[key])) && fragment.x >= 0 && fragment.y >= 0 && fragment.width > 0 && fragment.height > 0 && fragment.x + fragment.width <= 1 && fragment.y + fragment.height <= 1) : [];
        return sourceFile && typeof section.name === "string" && fragments.length ? { type: "saved-section", name: section.name, sourcePath: section.source, sourceFile: sourceFile.file, fragments } : null;
      }).filter(Boolean);
    } catch {
      savedSections = [];
    }
  }
  populateSinglePdfPicker();
  refreshSectionSourceList();
  updatePracticeModeUi();
  if (totalSessionSeconds !== null && practiceMode !== "single-section") await prepareSessionDurationPlan();

  if (!selectedFolderPdfs.length) {
    folderStatus.textContent = "No PDFs found — choose another folder";
    playlist = [];
    playlistIndex = 0;
    clearTimeout(rotationTimer);
    clearInterval(countdownTimer);
    return;
  }

  const folderName = selectedFolderPdfs[0].file.webkitRelativePath.split("/")[0];
  folderStatus.textContent = selectedFolderPdfs.length + " full score PDF" + (selectedFolderPdfs.length === 1 ? "" : "s") + " from " + folderName;
  if (savedSections.length) sectionEditorStatus.textContent = savedSections.length + " saved section" + (savedSections.length === 1 ? "" : "s") + " imported from practice-sections.json";
  playlist = [];
  playlistIndex = 0;
  clearTimeout(rotationTimer);
  clearInterval(countdownTimer);
  showNextPdf();
});
timeSignatureForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const match = timeSignatureInput.value.trim().match(/^(\d+)\/(\d+)$/);
  const numerator = match && Number(match[1]);
  const denominator = match && Number(match[2]);
  const allowedDenominators = [1, 2, 4, 8, 16];
  if (!numerator || numerator > 32 || !allowedDenominators.includes(denominator)) {
    timeSignatureStatus.textContent = "Use 1–32 / 1, 2, 4, 8, or 16";
    timeSignatureInput.focus();
    return;
  }
  beatsPerMeasure = numerator;
  timeSignatureInput.value = `${numerator}/${denominator}`;
  timeSignatureStatus.textContent = `First beat accented every ${numerator} beats`;
  if (!isStopped) startVisualMetronome();
});
tempoRangeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const minimum = Number(minBpmInput.value);
  const maximum = Number(maxBpmInput.value);
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 1 || maximum > 300 || minimum > maximum) {
    tempoRangeStatus.textContent = "Use whole numbers from 1–300, low to high";
    minBpmInput.focus();
    return;
  }
  minimumBpm = minimum;
  maximumBpm = maximum;
  tempoRangeStatus.textContent = `${minimum}–${maximum} BPM, inclusive`;
});
targetTempoForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const requestedTarget = Number(targetTempoInput.value);
  if (!Number.isInteger(requestedTarget) || requestedTarget < 1 || requestedTarget > 300) {
    targetTempoStatus.textContent = "Use a whole number from 1–300";
    targetTempoInput.focus();
    return;
  }
  targetTempo = requestedTarget;
  targetTempoStatus.textContent = `Target: ${targetTempo} BPM`;
});
tempoMethodForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!isTempoMethod(tempoMethodInput.value)) return;
  tempoMethod = tempoMethodInput.value;
  if (methodMayBuildUp() && displayDurationSeconds < 60) {
    showBuildUpDurationError();
    return;
  }
  activeTempoMethod = tempoMethod;
  tempoMethodStatus.textContent = `Next session: ${tempoMethodLabels[tempoMethod]}`;
});
openSectionEditorButton.addEventListener("click", async () => {
  sectionEditor.hidden = false;
  refreshSectionSourceList();
  if (!editorSourceItem) await loadEditorSource();
});
closeSectionEditorButton.addEventListener("click", () => { sectionEditor.hidden = true; });
sectionSourceInput.addEventListener("change", async () => {
  draftFragments = [];
  renderDraftFragments();
  await loadEditorSource();
});
addFragmentButton.addEventListener("click", () => {
  if (!editorPdf) return;
  editorIsDrawing = !editorIsDrawing;
  addFragmentButton.classList.toggle("active", editorIsDrawing);
  addFragmentButton.textContent = editorIsDrawing ? "Drawing: drag on the page" : "Add fragment";
  sectionEditorStatus.textContent = editorIsDrawing ? "Drag a rectangle around the next fragment." : "Add fragments in reading order, then save the section.";
});
sectionEditorOverlay.addEventListener("pointerdown", (event) => {
  if (!editorIsDrawing) return;
  event.preventDefault();
  editorDragStart = normalizeEditorSelection(event);
  sectionEditorOverlay.setPointerCapture(event.pointerId);
  editorSelection = document.createElement("span");
  editorSelection.className = "section-editor-selection";
  sectionEditorOverlay.append(editorSelection);
});
sectionEditorOverlay.addEventListener("pointermove", (event) => {
  if (!editorDragStart || !editorSelection) return;
  const point = normalizeEditorSelection(event);
  const x = Math.min(editorDragStart.x, point.x);
  const y = Math.min(editorDragStart.y, point.y);
  editorSelection.style.left = (x * 100) + "%";
  editorSelection.style.top = (y * 100) + "%";
  editorSelection.style.width = (Math.abs(point.x - editorDragStart.x) * 100) + "%";
  editorSelection.style.height = (Math.abs(point.y - editorDragStart.y) * 100) + "%";
});
sectionEditorOverlay.addEventListener("pointerup", (event) => {
  if (!editorDragStart) return;
  const point = normalizeEditorSelection(event);
  const x = Math.min(editorDragStart.x, point.x);
  const y = Math.min(editorDragStart.y, point.y);
  const width = Math.abs(point.x - editorDragStart.x);
  const height = Math.abs(point.y - editorDragStart.y);
  editorSelection?.remove();
  editorSelection = null;
  editorDragStart = null;
  if (width < 0.01 || height < 0.01) return;
  draftFragments.push({ page: editorPage, x, y, width, height });
  renderDraftFragments();
  drawEditorMarkers();
  sectionEditorStatus.textContent = draftFragments.length + " fragment" + (draftFragments.length === 1 ? "" : "s") + " added. Continue or save the section.";
});
saveSectionButton.addEventListener("click", () => {
  const name = sectionNameInput.value.trim();
  if (!name || !editorSourceItem || !draftFragments.length) {
    sectionEditorStatus.textContent = "Enter a name and add at least one fragment before saving.";
    return;
  }
  savedSections.push({ type: "saved-section", name, sourcePath: getRelativePdfPath(editorSourceItem), sourceFile: editorSourceItem.file, fragments: draftFragments.map((fragment) => ({ ...fragment })) });
  sectionNameInput.value = "";
  draftFragments = [];
  renderDraftFragments();
  drawEditorMarkers();
  updatePracticeModeUi();
  sectionEditorStatus.textContent = name + " saved. Download the JSON when you are ready.";
});
exportSectionsButton.addEventListener("click", () => {
  if (!savedSections.length) {
    sectionEditorStatus.textContent = "Save at least one saved section first.";
    return;
  }
  const data = { version: 1, sections: savedSections.map((section) => ({ name: section.name, source: section.sourcePath, fragments: section.fragments })) };
  const download = document.createElement("a");
  download.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" }));
  download.download = "practice-sections.json";
  download.click();
  setTimeout(() => URL.revokeObjectURL(download.href), 0);
  sectionEditorStatus.textContent = "Downloaded practice-sections.json — place it in the folder you chose.";
});
sectionEditorPreviousPage.addEventListener("click", () => { if (editorPage > 1) { editorPage -= 1; renderEditorPage(); } });
sectionEditorNextPage.addEventListener("click", () => { if (editorPdf && editorPage < editorPdf.numPages) { editorPage += 1; renderEditorPage(); } });
previousPage.addEventListener("click", () => currentPage > 1 && renderPage(currentPage - 1));
nextPage.addEventListener("click", () => currentPage < documentPdf.numPages && renderPage(currentPage + 1));
updatePracticeModeUi();
rotationStatus.textContent = "Choose the folder containing the score to begin";
viewer.hidden = true;
loading.hidden = true;
