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
const stopButton = document.querySelector("#stop-button");
const endSessionButton = document.querySelector("#end-session-button");
const startSessionButton = document.querySelector("#start-session-button");
const pdfCountdown = document.querySelector("#pdf-countdown");
const durationForm = document.querySelector("#duration-form");
const durationInput = document.querySelector("#duration-input");
const folderInput = document.querySelector("#folder-input");
const folderButton = document.querySelector("#folder-button");
const folderStatus = document.querySelector("#folder-status");
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
let documentPdf;
let currentPage = 1;
let playlist = [];
let playlistIndex = 0;
let rotationTimer;
let countdownTimer;
let displayDurationSeconds = 60;
let audioContext;
let visualMetronomeTimer;
let currentBpm = 60;
let selectedFolderPdfs = [];
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
const defaultPracticeSettings = Object.freeze({
  minimumBpm,
  maximumBpm,
  timeSignature: timeSignatureInput.value.trim(),
  targetTempo,
});

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

function setCurrentTempo(tempo, method) {
  currentBpm = tempo;
  bpmLabel.textContent = `Metronome · ${currentBpm} BPM · ${method}`;
  if (sessionStarted) startVisualMetronome();
}

function updateTempoMethodStatus(prefix = "Active") {
  tempoMethodStatus.textContent = `${prefix}: ${tempoMethodLabels[activeTempoMethod]}`;
}

function startBuildUp() {
  const transitions = Math.ceil(displayDurationSeconds / 30) - 1;
  let stepIndex = 0;
  setCurrentTempo(minimumBpm, tempoMethodLabels["build-up"]);
  clearInterval(rampTimer);
  rampTimer = setInterval(() => {
    if (!sessionStarted || activeTempoMethod !== "build-up" || stepIndex >= transitions) return;
    stepIndex += 1;
    const progress = stepIndex / transitions;
    const nextTempo = Number((minimumBpm + ((maximumBpm - minimumBpm) * progress)).toFixed(1));
    setCurrentTempo(nextTempo, tempoMethodLabels["build-up"]);
  }, 30000);
}

function beginTempoMethod() {
  clearInterval(rampTimer);
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

async function loadBundledPracticeSettings() {
  try {
    const response = await fetch("/api/practice-settings", { cache: "no-store" });
    const result = await response.json();
    applyPracticeSettings(result.settings, "practice-settings.json");
  } catch {
    applyPracticeSettings(null);
  }
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
  clearInterval(rampTimer);
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
  pdfCountdown.textContent = "Target tempo";
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
  clearInterval(rampTimer);
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
  button.disabled = true;
  startSessionButton.textContent = "Start session";
  startSessionButton.disabled = false;
  stopButton.textContent = "Stop session";
  stopButton.classList.remove("resume");
  stopButton.disabled = true;
  endSessionButton.hidden = true;
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
  if (selectedFolderPdfs.length) {
    playlist = shuffle(selectedFolderPdfs);
    playlistIndex = 0;
    return;
  }
  // Build one complete shuffled round from the existing API. This means the
  // app also works while an already-running local server is still in use.
  const byPath = new Map();
  let expectedCount = 0;
  let attempts = 0;
  while (byPath.size < expectedCount || expectedCount === 0) {
    const response = await fetch("/api/random-pdf", { cache: "no-store" });
    const result = await response.json();
    if (!result.pdf) break;
    expectedCount = result.count;
    byPath.set(result.pdf, { pdf: result.pdf, name: result.name });
    attempts += 1;
    // A useful failure instead of an endless wait if the folder changes mid-round.
    if (attempts > Math.max(30, expectedCount * 20)) {
      throw new Error("Could not collect the PDF list");
    }
  }
  playlist = shuffle([...byPath.values()]);
  playlistIndex = 0;
}

function startCountdown() {
  if (isStopped) return;
  clearTimeout(rotationTimer);
  clearInterval(countdownTimer);
  const endsAt = Date.now() + displayDurationSeconds * 1000;
  const updateCountdown = () => {
    const secondsLeft = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
    rotationStatus.textContent = `Next PDF in ${secondsLeft}s · ${playlist.length - playlistIndex} remaining this round`;
    pdfCountdown.textContent = `${secondsLeft}s left`;
  };
  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 250);
  rotationTimer = setTimeout(showNextPdf, displayDurationSeconds * 1000);
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

async function showNextPdf() {
  if (isStopped) return;
  button.disabled = true;
  button.firstChild.textContent = "Loading… ";
  try {
    if (playlistIndex >= playlist.length && playlist.length) {
      await completeRound();
      return;
    }
    if (playlistIndex >= playlist.length) await startNewRound();
    const result = playlist[playlistIndex];
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
    const source = result.file
      ? { data: await result.file.arrayBuffer() }
      : encodeURI(result.pdf);
    documentPdf = await pdfjsLib.getDocument(source).promise;
    await renderPage(1);
    applyTempoForNewPdf();
    pageControls.hidden = false;
    fileName.textContent = result.name;
    collectionCount.textContent = `${playlist.length} PDF${playlist.length === 1 ? "" : "s"} in your collection · Round position ${playlistIndex + 1} of ${playlist.length}`;
    playlistIndex += 1;
    startCountdown();
  } catch (error) {
    fileName.textContent = "Couldn’t load your collection";
    collectionCount.textContent = "Make sure the local server is running, then try again.";
  } finally {
    button.disabled = isStopped;
    button.firstChild.textContent = "Next now ";
  }
}

startSessionButton.addEventListener("click", async () => {
  if (sessionStarted) return;
  if (!selectedFolderPdfs.length) await loadBundledPracticeSettings();
  if (methodMayBuildUp() && displayDurationSeconds < 60) {
    showBuildUpDurationError();
    return;
  }
  sessionStarted = true;
  isStopped = false;
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
stopButton.addEventListener("click", async () => {
  if (!isStopped) {
    isStopped = true;
    clearTimeout(rotationTimer);
    clearInterval(countdownTimer);
    button.disabled = true;
    stopButton.textContent = "Resume session";
    stopButton.classList.add("resume");
    endSessionButton.hidden = false;
    rotationStatus.textContent = "PDF rotation paused · Metronome continues";
    pdfCountdown.textContent = "PDF paused";
    return;
  }

  isStopped = false;
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
  startCountdown();
});
folderButton.addEventListener("click", () => folderInput.click());
folderInput.addEventListener("change", async () => {
  const selectedFiles = [...folderInput.files];
  selectedFolderPdfs = selectedFiles
    .filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))
    .map((file) => ({ file, name: file.name }));

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

  if (!selectedFolderPdfs.length) {
    folderStatus.textContent = "No PDFs found — using the bundled PDFs";
    playlist = [];
    playlistIndex = 0;
    clearTimeout(rotationTimer);
    clearInterval(countdownTimer);
    showNextPdf();
    return;
  }

  const folderName = selectedFolderPdfs[0].file.webkitRelativePath.split("/")[0];
  folderStatus.textContent = `${selectedFolderPdfs.length} PDFs from ${folderName}`;
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
previousPage.addEventListener("click", () => currentPage > 1 && renderPage(currentPage - 1));
nextPage.addEventListener("click", () => currentPage < documentPdf.numPages && renderPage(currentPage + 1));
rotationStatus.textContent = "Press Start session to begin";
viewer.hidden = true;
loading.hidden = true;
