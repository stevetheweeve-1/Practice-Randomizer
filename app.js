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
const roundPosition = document.querySelector("#round-position");
const rotationStatus = document.querySelector("#rotation-status");
const button = document.querySelector("#another-pdf");
const volumeToggle = document.querySelector("#volume-toggle");
const metronomeVolumeInput = document.querySelector("#metronome-volume");
const metronomeVolumeValue = document.querySelector("#metronome-volume-value");
const accentToggle = document.querySelector("#accent-toggle");
const beatLight = document.querySelector("#beat-light");
const bpmLabel = document.querySelector("#bpm-label");
const dynamicsLabel = document.querySelector("#dynamics-label");
const dynamicsToggle = document.querySelector("#dynamics-toggle");
const stopButton = document.querySelector("#stop-button");
const endSessionButton = document.querySelector("#end-session-button");
const startSessionButton = document.querySelector("#start-session-button");
const pdfCountdown = document.querySelector("#pdf-countdown");
const totalSessionCountdown = document.querySelector("#total-session-countdown");
const durationStatus = document.querySelector("#duration-status");
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
const clickPatternInputs = document.querySelectorAll('input[name="click-pattern"]');
const twoClicksOption = document.querySelector("#two-clicks-option");
const everyBeatLabel = document.querySelector("#every-beat-label");
const beatsPerBarInput = document.querySelector("#beats-per-bar-input");
const noteValueInput = document.querySelector("#note-value-input");
const timeSignatureStatus = document.querySelector("#time-signature-status");
const minBpmInput = document.querySelector("#min-bpm-input");
const maxBpmInput = document.querySelector("#max-bpm-input");
const tempoRangeStatus = document.querySelector("#tempo-range-status");
const targetTempoInput = document.querySelector("#target-tempo-input");
const targetTempoStatus = document.querySelector("#target-tempo-status");
const tempoMethodInput = document.querySelector("#tempo-method-input");
const tempoMethodStatus = document.querySelector("#tempo-method-status");
const tempoAnchorControl = document.querySelector("#tempo-anchor-control");
const tempoAnchorInput = document.querySelector("#tempo-anchor-input");
const sectionEditor = document.querySelector("#section-editor");
const openSectionEditorButton = document.querySelector("#open-section-editor");
const closeSectionEditorButton = document.querySelector("#close-section-editor");
const sectionSourceInput = document.querySelector("#section-source-input");
const sectionSourceStatus = document.querySelector("#section-source-status");
const editSectionInput = document.querySelector("#edit-section-input");
const cancelSectionButton = document.querySelector("#cancel-section-button");
const deleteSectionButton = document.querySelector("#delete-section-button");
const sectionNameInput = document.querySelector("#section-name-input");
const addFragmentButton = document.querySelector("#add-fragment-button");
const sectionEditorCanvas = document.querySelector("#section-editor-canvas");
const sectionEditorContext = sectionEditorCanvas.getContext("2d");
const sectionEditorOverlay = document.querySelector("#section-editor-overlay");
const sectionEditorLoading = document.querySelector("#section-editor-loading");
const sectionEditorPageNumber = document.querySelector("#section-editor-page-number");
const sectionEditorPreviousPage = document.querySelector("#section-editor-previous-page");
const sectionEditorNextPage = document.querySelector("#section-editor-next-page");
const sectionOverlayLegend = document.querySelector("#section-overlay-legend");
const sectionFragmentList = document.querySelector("#section-fragment-list");
const saveSectionButton = document.querySelector("#save-section-button");
const exportSectionsButton = document.querySelector("#export-sections-button");
const sectionEditorStatus = document.querySelector("#section-editor-status");
const openPracticeHistoryButton = document.querySelector("#open-practice-history");
const closePracticeHistoryButton = document.querySelector("#close-practice-history");
const practiceHistoryPanel = document.querySelector("#practice-history");
const practiceHistoryStatus = document.querySelector("#practice-history-status");
const practiceHistoryToday = document.querySelector("#practice-history-today");
const practiceHistoryWeek = document.querySelector("#practice-history-week");
const practiceHistoryMonth = document.querySelector("#practice-history-month");
const practiceHistoryBreakdown = document.querySelector("#practice-history-breakdown");
const practiceHistoryCount = document.querySelector("#practice-history-count");
const practiceHistoryRecent = document.querySelector("#practice-history-recent");
const exportPracticeHistoryButton = document.querySelector("#export-practice-history");
const importPracticeHistoryInput = document.querySelector("#import-practice-history-input");
const clearPracticeHistoryButton = document.querySelector("#clear-practice-history");
const optionsPanel = document.querySelector(".options-panel");
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
let metronomeGain;
let metronomeVolume = volumeToGain(Number(metronomeVolumeInput.value));
let visualMetronomeTimer = null;
let currentBpm = 60;
let manualTempoOverride = false;
const liveTempoControl = document.querySelector("#live-tempo-control");
const liveTempoInput = document.querySelector("#live-tempo-input");
const resumeTempoMethodButton = document.querySelector("#resume-tempo-method");
const liveTempoStatus = document.querySelector("#live-tempo-status");
let selectedFolderPdfs = [];
let selectedSinglePdf = null;
let practiceMode = "saved-sections";
let isStopped = true;
let sessionStarted = false;
let metronomeEnabled = true;
let accentEnabled = accentToggle.checked;
let beatsPerMeasure = 4;
let beatDenominator = 4;
let clickPattern = "beat";
let beatInMeasure = 0;
let minimumBpm = 60;
let maximumBpm = 120;
let targetTempo = Number(targetTempoInput.value);
let tempoMethod = "target";
let activeTempoMethod = "target";
let useAnchorTempos = false;
let activeUseAnchorTempos = false;
let rampTimer;
let sectionElapsedMs = 0;
let sectionActiveSince = null;
let totalSessionElapsedMs = 0;
let totalSessionActiveSince = null;
let totalSessionTimer;
let totalSessionCountdownTimer;
let dynamicsEnabled = false;
let savedSections = [];
let selectedSections = new Set();
const selectedSectionsPicker = document.querySelector("#selected-sections-picker");
const selectedSectionsList = document.querySelector("#selected-sections-list");
const selectedSectionsOrder = document.querySelector("#selected-sections-order");
const selectedSectionsCount = document.querySelector("#selected-sections-count");
let editorPdf;
let editorSourceItem = null;
let editorPage = 1;
let draftFragments = [];
let editingSection = null;
let fragmentGesture = null;
let editorBaseline = "";
let editorIsDrawing = false;
let editorDragStart = null;
let editorSelection = null;
const practiceHistoryDatabaseName = "practice-randomizer-history";
const practiceHistoryStoreName = "sessions";
const practiceHistoryFallbackKey = "practice-randomizer-history-v1";
let practiceHistoryDatabasePromise;
let activePracticeHistorySession = null;
let activePracticeHistoryItem = null;
let practiceHistoryClearConfirmationPending = false;
let practiceHistoryClearConfirmationTimer;
const defaultPracticeSettings = Object.freeze({
  minimumBpm,
  maximumBpm,
  timeSignature: `${beatsPerBarInput.value}/${noteValueInput.value}`,
  targetTempo,
});

const dynamicsChoices = ["Piano (p)", "Mezzo-piano (mp)", "Mezzo-forte (mf)", "Forte (f)", "Crescendo", "Decrescendo"];
const savedSectionOverlayPalette = [
  { fill: "#80a99c44", border: "#08744357", label: "#80a99c44" },
  { fill: "#78a8c744", border: "#1f638857", label: "#78a8c744" },
  { fill: "#aa91c544", border: "#67458c57", label: "#aa91c544" },
  { fill: "#d4a15d44", border: "#925a1f57", label: "#d4a15d44" },
  { fill: "#cf849144", border: "#8f3d4a57", label: "#cf849144" },
  { fill: "#75af9c44", border: "#1f705b57", label: "#75af9c44" },
];

const practiceModeLabels = {
  "whole-piece": "Full score",
  "saved-sections": "Saved sections (random)",
  "saved-sections-ordered": "Saved sections",
  "saved-sections-selected": "Selected sections",
  "saved-sections-reverse": "Saved sections (reversed)",
  "single-section": "One section",
};

function createPracticeHistoryId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function requestAsPromise(request) {
  return new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result), { once: true });
    request.addEventListener("error", () => reject(request.error), { once: true });
  });
}

function openPracticeHistoryDatabase() {
  if (!globalThis.indexedDB) return Promise.reject(new Error("IndexedDB is unavailable"));
  if (practiceHistoryDatabasePromise) return practiceHistoryDatabasePromise;
  practiceHistoryDatabasePromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(practiceHistoryDatabaseName, 1);
    request.addEventListener("upgradeneeded", () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(practiceHistoryStoreName)) {
        database.createObjectStore(practiceHistoryStoreName, { keyPath: "id" });
      }
    });
    request.addEventListener("success", () => resolve(request.result), { once: true });
    request.addEventListener("error", () => reject(request.error), { once: true });
  });
  return practiceHistoryDatabasePromise;
}

function getFallbackPracticeHistory() {
  try {
    const sessions = JSON.parse(localStorage.getItem(practiceHistoryFallbackKey) ?? "[]");
    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

function setFallbackPracticeHistory(sessions) {
  localStorage.setItem(practiceHistoryFallbackKey, JSON.stringify(sessions));
}

async function getPracticeHistorySessions() {
  try {
    const database = await openPracticeHistoryDatabase();
    const transaction = database.transaction(practiceHistoryStoreName, "readonly");
    const sessions = await requestAsPromise(transaction.objectStore(practiceHistoryStoreName).getAll());
    return sessions.sort((a, b) => new Date(b.endedAt ?? b.startedAt) - new Date(a.endedAt ?? a.startedAt));
  } catch {
    return getFallbackPracticeHistory().sort((a, b) => new Date(b.endedAt ?? b.startedAt) - new Date(a.endedAt ?? a.startedAt));
  }
}

async function savePracticeHistorySession(session) {
  try {
    const database = await openPracticeHistoryDatabase();
    const transaction = database.transaction(practiceHistoryStoreName, "readwrite");
    transaction.objectStore(practiceHistoryStoreName).put(session);
    await new Promise((resolve, reject) => {
      transaction.addEventListener("complete", resolve, { once: true });
      transaction.addEventListener("error", () => reject(transaction.error), { once: true });
      transaction.addEventListener("abort", () => reject(transaction.error), { once: true });
    });
  } catch {
    const sessions = getFallbackPracticeHistory();
    const index = sessions.findIndex((item) => item.id === session.id);
    if (index >= 0) sessions[index] = session;
    else sessions.push(session);
    setFallbackPracticeHistory(sessions);
  }
}

async function clearPracticeHistorySessions() {
  try {
    const database = await openPracticeHistoryDatabase();
    const transaction = database.transaction(practiceHistoryStoreName, "readwrite");
    transaction.objectStore(practiceHistoryStoreName).clear();
    await new Promise((resolve, reject) => {
      transaction.addEventListener("complete", resolve, { once: true });
      transaction.addEventListener("error", () => reject(transaction.error), { once: true });
      transaction.addEventListener("abort", () => reject(transaction.error), { once: true });
    });
  } catch {}
  localStorage.removeItem(practiceHistoryFallbackKey);
}

function formatPracticeDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(totalSeconds || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m`;
  return seconds ? "<1m" : "0m";
}

function getStartOfLocalDay(daysAgo = 0) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

function getSessionActiveSeconds(session) {
  return Number.isFinite(session.activeSeconds) ? session.activeSeconds : 0;
}

function getPracticeHistoryBreakdown(sessions) {
  const scores = new Map();
  sessions.forEach((session) => {
    const name = session.scoreName ?? "Practice session";
    const current = scores.get(name) ?? { name, seconds: 0 };
    current.seconds += getSessionActiveSeconds(session);
    scores.set(name, current);
  });
  return [...scores.values()].sort((a, b) => b.seconds - a.seconds).slice(0, 3);
}

function getPracticeHistoryItemLabel(item, tempoMethod) {
  const name = item.name ?? "Untitled";
  if (!["target", "half-target", "build-up"].includes(tempoMethod)) return name;
  const tempos = [...new Set((item.tempoEvents ?? [])
    .map((event) => Number(event.bpm))
    .filter((tempo) => Number.isFinite(tempo)))];
  return tempos.length ? `${name} (${tempos.join(" → ")} BPM)` : name;
}

function getPracticeHistoryTempoSummary(session) {
  const tempoMethod = session.settings?.tempoMethod;
  if (!["target", "half-target", "build-up"].includes(tempoMethod)) return "";
  const tempos = [...new Set((session.items ?? []).flatMap((item) => item.tempoEvents ?? [])
    .map((event) => Number(event.bpm))
    .filter((tempo) => Number.isFinite(tempo)))];
  return tempos.length ? ` · ${tempos.join(" → ")} BPM` : "";
}

async function renderPracticeHistory() {
  practiceHistoryStatus.textContent = "Loading practice history…";
  const sessions = await getPracticeHistorySessions();
  const todayStart = getStartOfLocalDay();
  const weekStart = getStartOfLocalDay(6);
  const monthStart = getStartOfLocalDay(29);
  const totalSince = (start) => sessions
    .filter((session) => new Date(session.startedAt) >= start)
    .reduce((total, session) => total + getSessionActiveSeconds(session), 0);

  practiceHistoryToday.textContent = formatPracticeDuration(totalSince(todayStart));
  practiceHistoryWeek.textContent = formatPracticeDuration(totalSince(weekStart));
  practiceHistoryMonth.textContent = formatPracticeDuration(totalSince(monthStart));
  practiceHistoryCount.textContent = `${sessions.length} saved session${sessions.length === 1 ? "" : "s"}`;
  practiceHistoryStatus.textContent = sessions.length
    ? "Practice history is stored only in this browser."
    : "No completed sessions yet. Start practicing to build your history.";

  practiceHistoryBreakdown.replaceChildren();
  const breakdown = getPracticeHistoryBreakdown(sessions.filter((session) => new Date(session.startedAt) >= monthStart));
  if (breakdown.length) {
    const text = document.createElement("p");
    text.textContent = "Most-practiced scores this month: " + breakdown
      .map((item) => `${item.name} (${formatPracticeDuration(item.seconds)})`).join(" · ");
    practiceHistoryBreakdown.append(text);
  }

  practiceHistoryRecent.replaceChildren();
  sessions.slice(0, 10).forEach((session) => {
    const entry = document.createElement("li");
    const details = document.createElement("div");
    const score = document.createElement("strong");
    score.textContent = session.scoreName ?? "Practice session";
    const summary = document.createElement("span");
    const itemCount = session.items?.length ?? 0;
    const tempoMethod = session.settings?.tempoMethod;
    summary.textContent = ` ${practiceModeLabels[session.practiceMode] ?? session.practiceMode ?? "Practice"} · ${tempoMethodLabels[tempoMethod] ?? tempoMethod ?? "Tempo not recorded"}${getPracticeHistoryTempoSummary(session)}`;
    details.append(score, summary);
    const itemNames = [...new Set((session.items ?? []).map((item) => item.name).filter(Boolean))].slice(0, 3);
    const shouldShowPracticedItems = ["whole-piece", "saved-sections-selected", "single-section"].includes(session.practiceMode);
    if (shouldShowPracticedItems && itemNames.length) {
      const items = document.createElement("span");
      const itemLabels = (session.items ?? [])
        .filter((item, index, collection) => item.name && collection.findIndex((candidate) => candidate.name === item.name) === index)
        .slice(0, 3)
        .map((item) => getPracticeHistoryItemLabel(item, tempoMethod));
      items.textContent = ` Practiced: ${itemLabels.join(" · ")}${itemCount > itemLabels.length ? " · …" : ""}`;
      details.append(items);
    }
    const timing = document.createElement("div");
    const date = document.createElement("time");
    const startedAt = new Date(session.startedAt);
    date.dateTime = session.startedAt;
    date.textContent = Number.isNaN(startedAt.valueOf()) ? "Unknown date" : startedAt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    const duration = document.createElement("span");
    duration.textContent = ` ${formatPracticeDuration(getSessionActiveSeconds(session))}`;
    timing.append(date, duration);
    entry.append(details, timing);
    practiceHistoryRecent.append(entry);
  });
}

function getPracticeHistoryScoreName() {
  const firstPdf = selectedFolderPdfs[0];
  if (!firstPdf) return "Practice session";
  return firstPdf.file.webkitRelativePath.split("/")[0] || firstPdf.name;
}

function beginPracticeHistorySession() {
  activePracticeHistorySession = {
    id: createPracticeHistoryId(),
    startedAt: new Date().toISOString(),
    endedAt: null,
    status: "active",
    activeSeconds: 0,
    scoreName: getPracticeHistoryScoreName(),
    practiceMode,
    settings: {
      minimumBpm,
      maximumBpm,
      targetTempo,
      timeSignature: `${beatsPerMeasure}/${beatDenominator}`,
      tempoMethod: activeTempoMethod,
      dynamicsEnabled,
    },
    items: [],
  };
  activePracticeHistoryItem = null;
}

function startPracticeHistoryItem(result) {
  if (!activePracticeHistorySession) return;
  activePracticeHistoryItem = {
    name: result.name,
    sourcePath: result.sourcePath ?? result.path ?? result.name,
    type: result.type ?? "score",
    startedAt: new Date().toISOString(),
    endedAt: null,
    activeSeconds: 0,
    dynamics: dynamicsLabel.hidden ? null : dynamicsLabel.textContent.replace("Dynamics · ", ""),
    tempoEvents: [{ seconds: 0, bpm: currentBpm, method: activeTempoMethod }],
  };
  activePracticeHistorySession.items.push(activePracticeHistoryItem);
}

function recordPracticeHistoryTempo(tempo, method) {
  if (!activePracticeHistoryItem) return;
  const seconds = Math.max(0, Math.round(getSectionElapsedMs() / 1000));
  const previous = activePracticeHistoryItem.tempoEvents.at(-1);
  if (previous?.bpm === tempo && previous?.method === method) return;
  activePracticeHistoryItem.tempoEvents.push({ seconds, bpm: tempo, method });
}

function finalizePracticeHistoryItem() {
  if (!activePracticeHistoryItem) return;
  activePracticeHistoryItem.activeSeconds = Math.max(0, Math.round(getSectionElapsedMs() / 1000));
  activePracticeHistoryItem.endedAt = new Date().toISOString();
  activePracticeHistoryItem = null;
}

async function finalizePracticeHistorySession(status) {
  if (!activePracticeHistorySession) return;
  finalizePracticeHistoryItem();
  const session = activePracticeHistorySession;
  activePracticeHistorySession = null;
  if (!session.items.length) return;
  session.endedAt = new Date().toISOString();
  session.status = status;
  session.activeSeconds = session.items.reduce((total, item) => total + (Number(item.activeSeconds) || 0), 0);
  await savePracticeHistorySession(session);
  if (!practiceHistoryPanel.hidden) await renderPracticeHistory();
}

function showSetupView() {
  document.body.dataset.view = "setup";
}

function showPracticeView() {
  document.body.dataset.view = "practice";
}

function isSavedSectionsMode() {
  return ["saved-sections", "saved-sections-ordered", "saved-sections-reverse", "saved-sections-selected"].includes(practiceMode);
}

function getActivePdfs() {
  if (practiceMode === "single-section") return selectedSinglePdf ? [selectedSinglePdf] : [];
  if (practiceMode === "saved-sections-selected") return savedSections.filter(section => selectedSections.has(section));
  if (isSavedSectionsMode()) return savedSections;
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

let singleBuildUpTiming = false;
let previousDisplayDurationSeconds = displayDurationSeconds;

function usesSinglePracticeTiming() {
  return practiceMode === "single-section" || practiceMode === "whole-piece";
}

function updateDurationControl() {
  const isSingleBuildUp = usesSinglePracticeTiming() && tempoMethod === "build-up";
  if (isSingleBuildUp !== singleBuildUpTiming) {
    if (isSingleBuildUp) {
      previousDisplayDurationSeconds = displayDurationSeconds;
      displayDurationSeconds = 30;
    } else {
      displayDurationSeconds = previousDisplayDurationSeconds;
    }
    durationInput.value = displayDurationSeconds;
    durationStatus.textContent = "";
    singleBuildUpTiming = isSingleBuildUp;
  }
  durationLabel.textContent = isSingleBuildUp
    ? "Increase metronome speed every"
    : usesSinglePracticeTiming() ? "Refresh tempo and dynamics every" : "Display each section for";
  const calculatedInterval = isSingleBuildUp && tempoAnchorInput.checked;
  durationInput.readOnly = calculatedInterval;
  durationInput.step = calculatedInterval ? "any" : "1";
  if (calculatedInterval) {
    durationInput.value = totalSessionSeconds === null ? "" : Number((totalSessionSeconds / 3).toFixed(3));
    durationStatus.textContent = totalSessionSeconds === null ? "Set a total session time" : "Calculated from total session time";
  } else if (isSingleBuildUp) {
    durationInput.value = displayDurationSeconds;
    durationStatus.textContent = "";
  }
}

function updatePracticeModeUi() {
  const isSelected = practiceMode === "saved-sections-selected";
  selectedSectionsPicker.hidden = !isSelected;
  if (isSelected) refreshSelectedSections();
  if (!sessionStarted) startSessionButton.disabled = isSelected && !getActivePdfs().length;
  const isSingle = practiceMode === "single-section";
  singlePdfPicker.hidden = !isSingle;
  // The setup layout uses flex, so set an inline display value as well as the
  // semantic hidden attribute. This guarantees the picker is absent outside
  // One section mode even if a browser stylesheet overrides [hidden].
  singlePdfPicker.style.display = isSingle ? "flex" : "none";
  const isSavedSections = isSavedSectionsMode();
  totalSessionForm.hidden = false;
  updateDurationControl();
  button.firstChild.textContent = usesSinglePracticeTiming() ? "Refresh now " : "Next now ";
  if (isSavedSections) {
    sessionDurationPlan = [];
    totalSessionForm.hidden = false;
    practiceModeStatus.textContent = savedSections.length
      ? savedSections.length + " saved section" + (savedSections.length === 1 ? "" : "s") + " ready"
      : "Create or import saved sections with the Section Editor";
    if (isSelected) practiceModeStatus.textContent = getActivePdfs().length
      ? getActivePdfs().length + " selected sections · " + selectedSectionsOrder.selectedOptions[0].textContent.toLowerCase() + " order"
      : "Select at least one section";
  } else if (usesSinglePracticeTiming()) {
    sessionDurationPlan = [];
    practiceModeStatus.textContent = isSingle
      ? "Repeat one saved section; tempo and dynamics refresh each interval"
      : "Tempo and dynamics refresh each interval";
    totalSessionStatus.textContent = totalSessionSeconds === null
      ? "Optional second timer"
      : "Total timer: " + Math.round(totalSessionSeconds / 60) + " minutes";
  } else {
    practiceModeStatus.textContent = selectedFolderPdfs.length
      ? selectedFolderPdfs.length + " full score PDF" + (selectedFolderPdfs.length === 1 ? "" : "s") + " ready"
      : "Choose a folder containing a full score PDF";
  }
}

function refreshSelectedSections() {
  selectedSectionsList.replaceChildren();
  let group;
  let sourcePath;
  getOrderedSections(savedSections).forEach(section => {
    if (!group || sourcePath !== section.sourcePath) {
      sourcePath = section.sourcePath;
      group = document.createElement("fieldset");
      const legend = document.createElement("legend");
      legend.textContent = sourcePath;
      group.append(legend);
      selectedSectionsList.append(group);
    }
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedSections.has(section);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) selectedSections.add(section);
      else selectedSections.delete(section);
      selectionChanged();
    });
    label.append(checkbox, document.createTextNode(section.name));
    group.append(label);
  });
  selectedSectionsCount.textContent = savedSections.filter(section => selectedSections.has(section)).length
    + " of " + savedSections.length + " selected";
}

async function selectionChanged() {
  playlist = [];
  playlistIndex = 0;
  sessionDurationPlan = [];
  updatePracticeModeUi();
  if (totalSessionSeconds !== null && getActivePdfs().length) await prepareSessionDurationPlan();
  else if (totalSessionSeconds !== null) totalSessionStatus.textContent = "Select at least one section";
}

selectedSectionsOrder.addEventListener("change", selectionChanged);

document.querySelector("#select-all-sections").addEventListener("click", () => {
  selectedSections = new Set(savedSections);
  selectionChanged();
});
document.querySelector("#clear-selected-sections").addEventListener("click", () => {
  selectedSections.clear();
  selectionChanged();
});

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
  const allowedDenominators = [2, 4, 8];
  if (!Number.isInteger(numerator) || numerator < 1 || numerator > 32 || !allowedDenominators.includes(denominator)) return null;
  return { numerator, denominator, value: `${numerator}/${denominator}` };
}

const tempoMethodLabels = {
  random: "Random BPM",
  "build-up": "Build up",
  "half-target": "Half target",
  target: "Target",
};

function isTempoMethod(value) {
  return Object.prototype.hasOwnProperty.call(tempoMethodLabels, value);
}

function methodMayBuildUp() {
  return tempoMethod === "build-up";
}

function methodSupportsAnchorTempos(method = tempoMethod) {
  return method === "random" || method === "build-up";
}

function hasValidAnchorTempos() {
  return targetTempo >= minimumBpm && targetTempo <= maximumBpm;
}

function getTempoMethodDescription(method, useAnchors) {
  const label = tempoMethodLabels[method];
  return useAnchors && methodSupportsAnchorTempos(method) ? label + " · min / target / max" : label;
}

function updateTempoAnchorUi() {
  const supportsAnchors = methodSupportsAnchorTempos();
  tempoAnchorControl.hidden = !supportsAnchors;
  tempoAnchorControl.style.display = supportsAnchors ? "flex" : "none";
  if (!supportsAnchors) tempoAnchorInput.checked = false;
  useAnchorTempos = supportsAnchors && tempoAnchorInput.checked;
}

function showBuildUpDurationError() {
  tempoMethodStatus.textContent = usesSinglePracticeTiming()
    ? "Build up requires a total session time of at least 1 minute"
    : "Build up requires at least 60 seconds per PDF";
}

function calculateSessionDurations(pdfCount) {
  const baseDuration = Math.floor(totalSessionSeconds / pdfCount);
  const remainingSeconds = totalSessionSeconds % pdfCount;
  return Array.from({ length: pdfCount }, (_, index) => baseDuration + (index < remainingSeconds ? 1 : 0));
}

async function prepareSessionDurationPlan() {
  if (totalSessionSeconds === null || usesSinglePracticeTiming()) {
    sessionDurationPlan = [];
    return true;
  }
  const pdfCount = getActivePdfs().length;
  if (!pdfCount) {
    totalSessionStatus.textContent = practiceMode === "saved-sections-selected"
      ? "Select at least one section" : "Choose a folder with PDFs first";
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
  durationInput.value = shortestDuration;
  durationStatus.textContent = shortestDuration === longestDuration
    ? `${shortestDuration}s per interval`
    : `${shortestDuration}–${longestDuration}s per interval`;
  return true;
}

function setCurrentTempo(tempo, method) {
  currentBpm = tempo;
  bpmLabel.textContent = `Metronome · ${currentBpm} BPM · ${method}`;
  recordPracticeHistoryTempo(currentBpm, method);
  if (sessionStarted || visualMetronomeTimer !== null) startVisualMetronome();
  updateLiveTempoUi();
}

function updateLiveTempoUi() {
  liveTempoControl.hidden = visualMetronomeTimer === null;
  liveTempoInput.value = currentBpm;
  resumeTempoMethodButton.hidden = !manualTempoOverride;
  liveTempoStatus.textContent = manualTempoOverride ? "Manual tempo" : "";
}

function applyManualTempo(value) {
  if (visualMetronomeTimer === null) return;
  const tempo = Number(value);
  if (!String(value).trim() || !Number.isFinite(tempo) || tempo < 1 || tempo > 300) {
    liveTempoInput.value = currentBpm;
    liveTempoStatus.textContent = "Enter a BPM from 1 to 300";
    return;
  }
  manualTempoOverride = true;
  clearTimeout(rampTimer);
  setCurrentTempo(tempo, "Manual tempo");
}

liveTempoInput.addEventListener("change", () => applyManualTempo(liveTempoInput.value));
liveTempoInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    applyManualTempo(liveTempoInput.value);
  }
});
resumeTempoMethodButton.addEventListener("click", () => {
  manualTempoOverride = false;
  if (!sessionStarted) setCurrentTempo(targetTempo, "Target tempo");
  else {
    applyTempoForNewPdf();
    if (isStopped) clearTimeout(rampTimer);
  }
  updateLiveTempoUi();
});

function updateTempoMethodStatus(prefix = "Active") {
  tempoMethodStatus.textContent = `${prefix}: ${getTempoMethodDescription(activeTempoMethod, activeUseAnchorTempos)}`;
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
  return totalSessionSeconds !== null;
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

function getTotalSessionElapsedMs() {
  return totalSessionElapsedMs + (totalSessionActiveSince === null ? 0 : Date.now() - totalSessionActiveSince);
}

function getTotalSessionRemainingMs() {
  return Math.max(0, (totalSessionSeconds * 1000) - getTotalSessionElapsedMs());
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
  if (manualTempoOverride) return;
  clearTimeout(rampTimer);
  const usesSessionClock = usesSinglePracticeTiming();
  const durationSeconds = usesSessionClock ? totalSessionSeconds : currentDisplayDurationSeconds;
  const getElapsedMs = usesSessionClock ? getTotalSessionElapsedMs : getSectionElapsedMs;
  if (activeUseAnchorTempos) {
    const tempos = [minimumBpm, targetTempo, maximumBpm];
    const stageDurationMs = (durationSeconds * 1000) / tempos.length;
    const scheduleAnchorTempo = () => {
      if (!sessionStarted || isStopped || activeTempoMethod !== "build-up") return;
      const elapsedMs = getElapsedMs();
      const stageIndex = Math.min(tempos.length - 1, Math.floor(elapsedMs / stageDurationMs));
      setCurrentTempo(tempos[stageIndex], getTempoMethodDescription("build-up", true));
      if (stageIndex >= tempos.length - 1) return;
      const nextStageAtMs = (stageIndex + 1) * stageDurationMs;
      rampTimer = setTimeout(scheduleAnchorTempo, Math.max(1, nextStageAtMs - elapsedMs));
    };
    scheduleAnchorTempo();
    return;
  }
  const stepMs = usesSessionClock ? displayDurationSeconds * 1000 : 30000;
  const transitions = Math.ceil(durationSeconds * 1000 / stepMs) - 1;

  const scheduleTempo = () => {
    if (!sessionStarted || isStopped || activeTempoMethod !== "build-up") return;
    const elapsedMs = getElapsedMs();
    const stepIndex = Math.min(transitions, Math.floor(elapsedMs / stepMs));
    const progress = transitions > 0 ? stepIndex / transitions : 0;
    const nextTempo = Number((minimumBpm + ((maximumBpm - minimumBpm) * progress)).toFixed(1));
    setCurrentTempo(nextTempo, tempoMethodLabels["build-up"]);
    if (stepIndex >= transitions) return;
    const nextStepAtMs = (stepIndex + 1) * stepMs;
    rampTimer = setTimeout(scheduleTempo, Math.max(1, nextStepAtMs - elapsedMs));
  };

  scheduleTempo();
}

function beginTempoMethod() {
  manualTempoOverride = false;
  clearTimeout(rampTimer);
  activeTempoMethod = tempoMethod;
  activeUseAnchorTempos = useAnchorTempos;
  updateTempoMethodStatus();
}

function applyTempoForNewPdf() {
  if (manualTempoOverride) return;
  if (activeTempoMethod === "random") {
    setRandomTempo();
  } else if (activeTempoMethod === "half-target") {
    setCurrentTempo(Math.max(1, Math.round(targetTempo / 2)), tempoMethodLabels["half-target"]);
  } else if (activeTempoMethod === "build-up") {
    startBuildUp();
  } else if (activeTempoMethod === "target") {
    setCurrentTempo(targetTempo, tempoMethodLabels.target);
  }
}

document.querySelector("#download-practice-settings").addEventListener("click", () => {
  const status = document.querySelector("#practice-settings-download-status");
  const minBpm = Number(minBpmInput.value);
  const maxBpm = Number(maxBpmInput.value);
  const target = Number(targetTempoInput.value);
  const signature = parseTimeSignature(beatsPerBarInput.value + "/" + noteValueInput.value);
  const invalidBpm = input => !Number.isInteger(input) || input < 1 || input > 300;
  const invalidInput = invalidBpm(minBpm) ? minBpmInput
    : invalidBpm(maxBpm) ? maxBpmInput
    : minBpm > maxBpm ? minBpmInput
    : invalidBpm(target) ? targetTempoInput
    : !signature ? beatsPerBarInput : null;
  if (invalidInput) {
    status.textContent = "Use whole-number BPM values from 1–300, minimum no greater than maximum, and a valid time signature.";
    invalidInput.focus();
    return;
  }
  const settings = { minBpm, maxBpm, timeSignature: signature.value, targetTempo: target };
  const download = document.createElement("a");
  const url = URL.createObjectURL(new Blob([JSON.stringify(settings, null, 2) + "\n"], { type: "application/json" }));
  download.href = url;
  download.download = "practice-settings.json";
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  status.textContent = "Downloaded practice-settings.json — place it in your score folder, replacing the previous file if present.";
});

function applyPracticeSettings(settings, source = "the defaults") {
  const timeSignature = parseTimeSignature(settings?.timeSignature);
  const minimum = settings?.minBpm;
  const maximum = settings?.maxBpm;
  const isValid = Number.isInteger(minimum) && Number.isInteger(maximum)
    && minimum >= 1 && maximum <= 300 && minimum <= maximum && timeSignature;

  if (!isValid) {
    minimumBpm = defaultPracticeSettings.minimumBpm;
    maximumBpm = defaultPracticeSettings.maximumBpm;
    const defaultSignature = parseTimeSignature(defaultPracticeSettings.timeSignature);
    beatsPerMeasure = defaultSignature.numerator;
    beatDenominator = defaultSignature.denominator;
    updateClickPatternOptions();
    minBpmInput.value = minimumBpm;
    maxBpmInput.value = maximumBpm;
    beatsPerBarInput.value = beatsPerMeasure;
    noteValueInput.value = beatDenominator;
    tempoRangeStatus.textContent = "Using default range";
    timeSignatureStatus.textContent = `${beatsPerMeasure}/${beatDenominator}`;
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
  beatDenominator = timeSignature.denominator;
  updateClickPatternOptions();
  minBpmInput.value = minimum;
  maxBpmInput.value = maximum;
  beatsPerBarInput.value = beatsPerMeasure;
  noteValueInput.value = beatDenominator;
  tempoRangeStatus.textContent = `${minimum}–${maximum} BPM from ${source}`;
  timeSignatureStatus.textContent = timeSignature.value;
  return true;
}

function updateClickPatternOptions() {
  const isSixEight = beatsPerMeasure === 6 && beatDenominator === 8;
  const supportsTwo = beatsPerMeasure % 4 === 0 || isSixEight;
  const noteNames = { 2: "half", 4: "quarter", 8: "eighth" };
  everyBeatLabel.textContent = `Every ${noteNames[beatDenominator]} note`;
  twoClicksOption.disabled = !supportsTwo;
  if (!supportsTwo && clickPattern === "two") {
    clickPattern = "beat";
    clickPatternInputs.forEach((input) => { input.checked = input.value === clickPattern; });
  }
}

function getBeatsPerClick() {
  if (clickPattern === "bar") return beatsPerMeasure;
  if (clickPattern === "two") return beatsPerMeasure / 2;
  return 1;
}

function volumeToGain(percent) {
  // Equal slider steps represent equal decibel changes, with zero fully muted.
  if (percent === 0) return 0;
  const decibels = -40 * (1 - percent / 100);
  return 10 ** (decibels / 20);
}

function tick() {
  const isAccent = accentEnabled && beatInMeasure === 0;
  beatInMeasure = (beatInMeasure + getBeatsPerClick()) % beatsPerMeasure;
  beatLight.classList.remove("beat");
  // Restart the visual animation on every beat.
  void beatLight.offsetWidth;
  beatLight.classList.add("beat");

  if (!metronomeEnabled || audioContext?.state !== "running") return;

  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.frequency.value = isAccent ? 1100 : 880;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(isAccent ? 1.0 : 0.8, audioContext.currentTime + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.055);
  oscillator.connect(gain).connect(metronomeGain);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.06);
}

async function enableMetronome() {
  audioContext ??= new AudioContext();
  if (!metronomeGain) {
    metronomeGain = audioContext.createGain();
    metronomeGain.gain.value = metronomeVolume;
    metronomeGain.connect(audioContext.destination);
  }
  await audioContext.resume();
  metronomeEnabled = true;
  if (!isStopped) startVisualMetronome();
  volumeToggle.textContent = "Volume";
  volumeToggle.setAttribute("aria-pressed", "false");
  volumeToggle.title = "Mute metronome";
}

async function disableMetronome() {
  metronomeEnabled = false;
  await audioContext?.suspend();
  volumeToggle.textContent = "Muted";
  volumeToggle.setAttribute("aria-pressed", "true");
  volumeToggle.title = "Unmute metronome";
}

function startVisualMetronome() {
  clearInterval(visualMetronomeTimer);
  beatInMeasure = 0;
  tick();
  visualMetronomeTimer = setInterval(tick, (60000 / currentBpm) * (4 / beatDenominator) * getBeatsPerClick());
  updateLiveTempoUi();
}

async function showFullScoreAtSessionEnd() {
  const fullScore = selectedFolderPdfs[0];
  if (!fullScore) return false;

  try {
    waitingState.hidden = true;
    emptyState.hidden = true;
    viewer.hidden = false;
    pageControls.hidden = false;
    loading.hidden = false;
    canvas.hidden = true;
    documentPdf = await pdfjsLib.getDocument({ data: await fullScore.file.arrayBuffer() }).promise;
    await renderPage(1);
    fileName.textContent = fullScore.name;
    return true;
  } catch (error) {
    console.error("Practice Randomizer full score load error", error);
    viewer.hidden = true;
    waitingState.hidden = false;
    return false;
  }
}

async function completeRound() {
  if (targetTempo === null) {
    await finishSession("completed");
    return;
  }

  await finalizePracticeHistorySession("completed");
  clearTimeout(rotationTimer);
  clearInterval(countdownTimer);
  clearTimeout(rampTimer);
  clearTotalSessionTimers();
  stopDynamicsPractice();
  isStopped = true;
  sessionStarted = false;
  playlist = [];
  playlistIndex = 0;
  const isFullScoreVisible = await showFullScoreAtSessionEnd();
  if (!isFullScoreVisible) fileName.textContent = "Round complete";
  collectionCount.textContent = isFullScoreVisible
    ? `Full score displayed · Metronome continues at your target tempo of ${targetTempo} BPM.`
    : `Metronome continues at your target tempo of ${targetTempo} BPM.`;
  rotationStatus.textContent = "Round complete · Select End session to stop the metronome";
  roundPosition.textContent = "Round complete";
  pdfCountdown.textContent = "Section complete";
  totalSessionCountdown.textContent = "Total time complete";
  button.disabled = true;
  startSessionButton.textContent = "Session complete";
  startSessionButton.disabled = true;
  stopButton.disabled = true;
  endSessionButton.hidden = false;
  manualTempoOverride = false;
  setCurrentTempo(targetTempo, "Target tempo");
  startVisualMetronome();
}

async function finishSession(status = "ended") {
  await finalizePracticeHistorySession(status);
  isStopped = true;
  sessionStarted = false;
  clearTimeout(rotationTimer);
  clearInterval(countdownTimer);
  clearTimeout(rampTimer);
  clearTotalSessionTimers();
  stopDynamicsPractice();
  clearInterval(visualMetronomeTimer);
  visualMetronomeTimer = null;
  manualTempoOverride = false;
  updateLiveTempoUi();
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
  roundPosition.textContent = "";
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
  const availableTempos = activeUseAnchorTempos
    ? [...new Set([minimumBpm, targetTempo, maximumBpm])]
    : null;
  const randomTempo = availableTempos
    ? availableTempos[Math.floor(Math.random() * availableTempos.length)]
    : Math.floor(Math.random() * (maximumBpm - minimumBpm + 1)) + minimumBpm;
  setCurrentTempo(randomTempo, getTempoMethodDescription("random", activeUseAnchorTempos));
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function compareFragmentPositions(a, b) {
  if (a.page !== b.page) return a.page - b.page;
  // Hand-drawn crops of the same score line rarely share an exact top edge.
  // Treat small vertical differences as one line and read left to right.
  const sameLineTolerance = Math.min(a.height, b.height) / 4;
  if (Math.abs(a.y - b.y) <= sameLineTolerance) return a.x - b.x || a.y - b.y;
  return a.y - b.y;
}

function getOrderedSections(sections) {
  // Use the earliest fragment, even when fragments were added out of order.
  const firstFragment = (section) => section.fragments.reduce((first, fragment) =>
    compareFragmentPositions(fragment, first) < 0 ? fragment : first);
  return [...sections].sort((a, b) =>
    a.sourcePath.localeCompare(b.sourcePath, undefined, { numeric: true })
    || compareFragmentPositions(firstFragment(a), firstFragment(b)));
}

async function startNewRound() {
  const activePdfs = getActivePdfs();
  if (!activePdfs.length) {
    playlist = [];
    playlistIndex = 0;
    return;
  }
  const selectedOrder = practiceMode === "saved-sections-selected" ? selectedSectionsOrder.value : null;
  if (practiceMode === "saved-sections-ordered" || practiceMode === "saved-sections-reverse"
    || selectedOrder === "score" || selectedOrder === "reverse") {
    playlist = getOrderedSections(activePdfs);
    if (practiceMode === "saved-sections-reverse" || selectedOrder === "reverse") playlist.reverse();
  } else {
    playlist = shuffle(activePdfs);
  }
  playlistIndex = 0;
  if (totalSessionSeconds !== null && !usesSinglePracticeTiming()) {
    if (sessionDurationPlan.length !== playlist.length) sessionDurationPlan = calculateSessionDurations(playlist.length);
    playlist = playlist.map((item, index) => ({ ...item, durationSeconds: sessionDurationPlan[index] }));
  }
}

function getCurrentTempoRemainingMs() {
  if (!usesSinglePracticeTiming()) return getSectionRemainingMs();
  if (activeTempoMethod === "build-up") {
    const durationMs = totalSessionSeconds * 1000;
    const elapsedMs = getTotalSessionElapsedMs();
    const stageMs = activeUseAnchorTempos ? durationMs / 3 : displayDurationSeconds * 1000;
    const nextChangeMs = (Math.floor(elapsedMs / stageMs) + 1) * stageMs;
    return Math.max(0, Math.min(durationMs, nextChangeMs) - elapsedMs);
  }
  if (activeTempoMethod === "target" || activeTempoMethod === "half-target") {
    return hasTotalSessionLimit() ? getTotalSessionRemainingMs() : null;
  }
  return getSectionRemainingMs();
}

function startCountdown() {
  if (isStopped) return;
  clearTimeout(rotationTimer);
  clearInterval(countdownTimer);
  const remainingMs = getSectionRemainingMs();
  const endsAt = Date.now() + remainingMs;
  const updateCountdown = () => {
    const tempoRemainingMs = usesSinglePracticeTiming()
      ? getCurrentTempoRemainingMs()
      : Math.max(0, endsAt - Date.now());
    const secondsLeft = Math.ceil(tempoRemainingMs / 1000);
    rotationStatus.textContent = "";
    pdfCountdown.textContent = tempoRemainingMs === null
      ? "Section: current tempo · no time limit"
      : "Section: " + secondsLeft + (usesSinglePracticeTiming() ? "s at current tempo" : "s left");
  };
  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 250);
  rotationTimer = setTimeout(showNextPdf, remainingMs);
}

function refreshSinglePdfPractice() {
  resetSectionClock();
  // The session-wide Build up continues independently of refresh intervals.
  if (activeTempoMethod !== "build-up") applyTempoForNewPdf();
  startDynamicsPractice();
  const currentItem = practiceMode === "single-section" ? selectedSinglePdf : playlist[playlistIndex - 1];
  if (currentItem) startPracticeHistoryItem(currentItem);
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
  selectedFolderPdfs.forEach((item) => {
    const sourcePath = getRelativePdfPath(item);
    const option = document.createElement("option");
    option.value = sourcePath;
    option.textContent = sourcePath;
    sectionSourceInput.append(option);
  });
  if (editorSourceItem) sectionSourceInput.value = getRelativePdfPath(editorSourceItem);
  const sourcePath = sectionSourceInput.value;
  sectionSourceStatus.textContent = sourcePath
    ? "Selected source: " + sourcePath
    : "Choose a source PDF to edit.";
  openSectionEditorButton.disabled = !selectedFolderPdfs.length;
}

function editorSnapshot() {
  return JSON.stringify({ name: sectionNameInput.value, fragments: draftFragments });
}

function confirmDiscardSection() {
  return editorSnapshot() === editorBaseline || (!draftFragments.length && !sectionNameInput.value)
    || window.confirm("Discard unsaved section changes?");
}

function confirmDiscardSectionForExport() {
  if (editorSnapshot() === editorBaseline || (!draftFragments.length && !sectionNameInput.value)) return true;
  sectionEditorStatus.textContent = "Save or cancel your section changes before downloading.";
  return false;
}

function refreshEditableSections() {
  editSectionInput.replaceChildren(new Option("New section", ""));
  savedSections.forEach((section, index) => {
    if (section.sourcePath === getRelativePdfPath(editorSourceItem)) {
      editSectionInput.append(new Option(section.name, String(index)));
    }
  });
  editSectionInput.value = editingSection ? String(savedSections.indexOf(editingSection)) : "";
}

async function selectEditorSection(section) {
  editingSection = section;
  sectionNameInput.value = section?.name ?? "";
  draftFragments = section ? section.fragments.map(fragment => ({ ...fragment })) : [];
  editorIsDrawing = !section;
  addFragmentButton.classList.toggle("active", editorIsDrawing);
  addFragmentButton.textContent = editorIsDrawing ? "Drawing: drag on the page" : "Add fragment";
  saveSectionButton.textContent = section ? "Save changes" : "Save section";
  deleteSectionButton.disabled = !section;
  editorBaseline = editorSnapshot();
  refreshEditableSections();
  renderDraftFragments();
  if (section) editorPage = draftFragments[0].page;
  await renderEditorPage();
}

function renderDraftFragments() {
  sectionFragmentList.replaceChildren();
  draftFragments.forEach((fragment, index) => {
    const entry = document.createElement("li");
    entry.textContent = "Page " + fragment.page + " · fragment " + (index + 1);
    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      draftFragments.splice(index, 1);
      renderDraftFragments();
      renderEditorPage();
    });
    entry.append(remove);
    sectionFragmentList.append(entry);
  });
}

function getSavedSectionsForSource(sourcePath) {
  return savedSections
    .map((section, index) => ({ section, color: savedSectionOverlayPalette[index % savedSectionOverlayPalette.length] }))
    .filter(({ section }) => section.sourcePath === sourcePath);
}

function renderSavedSectionLegend(sourceSections) {
  sectionOverlayLegend.replaceChildren();
  sectionOverlayLegend.hidden = !sourceSections.length;
  sectionOverlayLegend.style.display = sourceSections.length ? "flex" : "none";
  sourceSections.forEach(({ section, color }) => {
    const item = document.createElement("span");
    item.className = "section-overlay-legend-item";
    const swatch = document.createElement("span");
    swatch.className = "section-overlay-legend-swatch";
    swatch.style.setProperty("--overlay-fill", color.fill);
    swatch.style.setProperty("--overlay-border", color.border);
    swatch.setAttribute("aria-hidden", "true");
    item.append(swatch, section.name);
    sectionOverlayLegend.append(item);
  });
}

function drawEditorMarkers() {
  sectionEditorOverlay.replaceChildren();
  const sourcePath = editorSourceItem && getRelativePdfPath(editorSourceItem);
  const sourceSections = getSavedSectionsForSource(sourcePath);
  renderSavedSectionLegend(sourceSections);
  const savedFragments = sourceSections.flatMap(({ section, color }) => {
    return (section === editingSection ? [] : section.fragments)
      .filter((fragment) => fragment.page === editorPage)
      .map((fragment, index) => ({ fragment, sectionName: section.name, fragmentNumber: index + 1, color }));
  });
  savedFragments.forEach(({ fragment, sectionName, fragmentNumber, color }) => {
    const marker = document.createElement("span");
    marker.className = "saved-section-marker";
    marker.style.setProperty("--overlay-fill", color.fill);
    marker.style.setProperty("--overlay-border", color.border);
    marker.style.setProperty("--overlay-label", color.label);
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
    marker.style.pointerEvents = editorIsDrawing ? "none" : "auto";
    marker.addEventListener("pointerdown", async (event) => {
      event.stopPropagation();
      if (!confirmDiscardSection()) return;
      const section = sourceSections.find(item => item.section.fragments.includes(fragment)).section;
      await selectEditorSection(section);
    });
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
    marker.dataset.fragmentIndex = String(draftFragments.indexOf(fragment));
    if (!editorIsDrawing) {
      marker.classList.add("editable-fragment");
      for (const edge of ["n", "s", "e", "w", "ne", "nw", "se", "sw"]) {
        const handle = document.createElement("span");
        handle.className = "fragment-handle handle-" + edge;
        handle.dataset.edge = edge;
        marker.append(handle);
      }
    }
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
  const sourcePath = sectionSourceInput.value;
  editorSourceItem = selectedFolderPdfs.find((item) => getRelativePdfPath(item) === sourcePath) ?? null;
  if (!editorSourceItem) {
    sectionSourceStatus.textContent = "Could not find the selected source PDF.";
    return;
  }
  sectionSourceStatus.textContent = "Editing source: " + sourcePath;
  sectionEditorStatus.textContent = "Loading " + sourcePath + "…";
  editorPdf = await pdfjsLib.getDocument({ data: await editorSourceItem.file.arrayBuffer() }).promise;
  editorPage = 1;
  editorIsDrawing = true;
  addFragmentButton.classList.add("active");
  addFragmentButton.textContent = "Drawing: drag on the page";
  await renderEditorPage();
  await selectEditorSection(null);
  sectionEditorStatus.textContent = "Choose a saved section to edit, or draw a new section.";
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
  finalizePracticeHistoryItem();
  button.disabled = true;
  button.firstChild.textContent = "Loading… ";
  try {
    if (playlistIndex >= playlist.length && playlist.length) {
      if (usesSinglePracticeTiming() && playlist.length === 1) {
        refreshSinglePdfPractice();
        return;
      }
      if (usesSinglePracticeTiming()) {
        playlistIndex = 0;
      } else {
        await completeRound();
        return;
      }
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
      roundPosition.textContent = "";
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
    if (!usesSinglePracticeTiming()) manualTempoOverride = false;
    applyTempoForNewPdf();
    startDynamicsPractice();
    startPracticeHistoryItem(result);
    pageControls.hidden = result.type === "saved-section";
    fileName.textContent = result.name;
    collectionCount.textContent = "";
    roundPosition.textContent = usesSinglePracticeTiming() && playlist.length === 1
      ? ""
      : "Round position " + (playlistIndex + 1) + " of " + playlist.length;
    playlistIndex += 1;
    startCountdown();
  } catch (error) {
    console.error("Practice Randomizer load error", error);
    fileName.textContent = "Couldn’t load your collection";
    const detail = error instanceof Error && error.message ? error.message : "Unknown PDF rendering error";
    collectionCount.textContent = "Try choosing the folder again, then start a new session.";
    roundPosition.textContent = "";
    rotationStatus.textContent = "Load error: " + detail;
  } finally {
    button.disabled = isStopped;
    button.firstChild.textContent = usesSinglePracticeTiming() ? "Refresh now " : "Next now ";
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
  if (useAnchorTempos && !hasValidAnchorTempos()) {
    tempoMethodStatus.textContent = "Target tempo must be within the BPM range when using min, target, and max only";
    targetTempoInput.focus();
    return;
  }
  if (methodMayBuildUp() && (usesSinglePracticeTiming()
    ? totalSessionSeconds === null || totalSessionSeconds < 60
    : totalSessionSeconds === null && displayDurationSeconds < 60)) {
    showBuildUpDurationError();
    return;
  }
  sessionStarted = true;
  isStopped = false;
  beginPracticeHistorySession();
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
volumeToggle.addEventListener("click", () => {
  if (metronomeEnabled) return disableMetronome();
  return enableMetronome();
});
metronomeVolumeInput.addEventListener("input", () => {
  metronomeVolume = volumeToGain(Number(metronomeVolumeInput.value));
  const percentage = `${metronomeVolumeInput.value}%`;
  metronomeVolumeValue.value = percentage;
  metronomeVolumeInput.setAttribute("aria-valuetext", percentage);
  if (metronomeGain) {
    metronomeGain.gain.setTargetAtTime(metronomeVolume, audioContext.currentTime, 0.01);
  }
});
accentToggle.addEventListener("change", () => {
  accentEnabled = accentToggle.checked;
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
durationInput.addEventListener("change", () => {
  const requestedDuration = Number(durationInput.value);
  if (!Number.isInteger(requestedDuration) || requestedDuration < 1 || requestedDuration > 3600) {
    durationStatus.textContent = "Use a whole number from 1–3,600 seconds";
    return;
  }
  if (!usesSinglePracticeTiming() && requestedDuration < 60 && methodMayBuildUp()) {
    showBuildUpDurationError();
    durationStatus.textContent = "Build up requires at least 60 seconds per PDF";
    return;
  }
  displayDurationSeconds = requestedDuration;
  durationStatus.textContent = `${requestedDuration}s per interval`;
  if (!usesSinglePracticeTiming()) {
    totalSessionSeconds = null;
    totalSessionInput.value = "";
    sessionDurationPlan = [];
    totalSessionStatus.textContent = "Using manual duration";
  } else {
    totalSessionStatus.textContent = totalSessionSeconds === null
      ? "Set total time for a second timer"
      : "Total timer: " + Math.round(totalSessionSeconds / 60) + " minutes";
  }
  startCountdown();
});
totalSessionInput.addEventListener("change", async () => {
  if (sessionStarted) {
    totalSessionStatus.textContent = "End the current session before changing its total time";
    return;
  }
  if (!totalSessionInput.value.trim()) {
    totalSessionSeconds = null;
    sessionDurationPlan = [];
    durationInput.value = displayDurationSeconds;
    durationStatus.textContent = `${displayDurationSeconds}s per interval`;
    totalSessionStatus.textContent = usesSinglePracticeTiming() ? "Optional second timer" : "Using manual duration";
    updateDurationControl();
    return;
  }
  const requestedMinutes = Number(totalSessionInput.value);
  if (!Number.isFinite(requestedMinutes) || requestedMinutes < 1 || requestedMinutes > 1440) {
    totalSessionStatus.textContent = "Use 1–1,440 minutes";
    return;
  }
  totalSessionSeconds = Math.round(requestedMinutes * 60);
  updateDurationControl();
  if (usesSinglePracticeTiming()) {
    sessionDurationPlan = [];
    totalSessionStatus.textContent = "Total timer: " + Math.round(totalSessionSeconds / 60) + " minutes";
    return;
  }
  if (!(await prepareSessionDurationPlan())) return;
});
practiceModeInput.addEventListener("change", async () => {
  if (sessionStarted) return;
  practiceMode = practiceModeInput.value;
  updatePracticeModeUi();
  if (!usesSinglePracticeTiming() && totalSessionSeconds !== null) await prepareSessionDurationPlan();
});
singlePdfInput.addEventListener("change", () => {
  selectedSinglePdf = savedSections[Number(singlePdfInput.value)] ?? null;
  singlePdfStatus.textContent = selectedSinglePdf ? "Selected: " + selectedSinglePdf.name : "Choose a saved section";
});
folderButton.addEventListener("click", () => folderInput.click());
folderInput.addEventListener("change", async () => {
  if (!folderInput.files.length) return;
  if (!confirmDiscardSection()) return;
  editorSourceItem = null;
  editorPdf = null;
  editingSection = null;
  draftFragments = [];
  sectionNameInput.value = "";
  editorBaseline = editorSnapshot();
  sectionEditor.hidden = true;
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
  const sectionsFile = ["score-sections.json", "practice-sections.json"]
    .map((name) => selectedFiles.find((file) =>
      file.name === name && file.webkitRelativePath.split("/").length === 2))
    .find(Boolean);
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
  selectedSections = new Set(savedSections);
  populateSinglePdfPicker();
  refreshSectionSourceList();
  updatePracticeModeUi();
  if (totalSessionSeconds !== null && !usesSinglePracticeTiming()) await prepareSessionDurationPlan();

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
  if (savedSections.length) sectionEditorStatus.textContent = savedSections.length + " saved section" + (savedSections.length === 1 ? "" : "s") + " imported from " + sectionsFile.name;
  playlist = [];
  playlistIndex = 0;
  clearTimeout(rotationTimer);
  clearInterval(countdownTimer);
  showNextPdf();
});
clickPatternInputs.forEach((input) => {
  input.addEventListener("change", () => {
    if (!input.checked) return;
    clickPattern = input.value;
    updateClickPatternOptions();
    if (visualMetronomeTimer !== null) startVisualMetronome();
  });
});
function applyTimeSignature() {
  const numerator = Number(beatsPerBarInput.value);
  const denominator = Number(noteValueInput.value);
  const allowedDenominators = [2, 4, 8];
  if (!Number.isInteger(numerator) || numerator < 1 || numerator > 32 || !allowedDenominators.includes(denominator)) {
    timeSignatureStatus.textContent = "Use 1–32 / 1, 2, 4, 8, or 16";
    return;
  }
  beatsPerMeasure = numerator;
  beatDenominator = denominator;
  updateClickPatternOptions();
  timeSignatureStatus.textContent = `${numerator}/${denominator}`;
  if (!isStopped) startVisualMetronome();
}
beatsPerBarInput.addEventListener("change", applyTimeSignature);
noteValueInput.addEventListener("change", applyTimeSignature);
function applyTempoRange() {
  const minimum = Number(minBpmInput.value);
  const maximum = Number(maxBpmInput.value);
  if (!Number.isInteger(minimum) || !Number.isInteger(maximum) || minimum < 1 || maximum > 300 || minimum > maximum) {
    tempoRangeStatus.textContent = "Use whole numbers from 1–300, low to high";
    return;
  }
  minimumBpm = minimum;
  maximumBpm = maximum;
  tempoRangeStatus.textContent = `${minimum}–${maximum} BPM, inclusive`;
}
minBpmInput.addEventListener("change", applyTempoRange);
maxBpmInput.addEventListener("change", applyTempoRange);
targetTempoInput.addEventListener("change", () => {
  const requestedTarget = Number(targetTempoInput.value);
  if (!Number.isInteger(requestedTarget) || requestedTarget < 1 || requestedTarget > 300) {
    targetTempoStatus.textContent = "Use a whole number from 1–300";
    return;
  }
  targetTempo = requestedTarget;
  targetTempoStatus.textContent = `Target: ${targetTempo} BPM`;
});
tempoMethodInput.addEventListener("change", () => {
  if (!isTempoMethod(tempoMethodInput.value)) return;
  tempoMethod = tempoMethodInput.value;
  updatePracticeModeUi();
  updateTempoAnchorUi();
  if (methodMayBuildUp() && (usesSinglePracticeTiming()
    ? totalSessionSeconds === null || totalSessionSeconds < 60
    : totalSessionSeconds === null && displayDurationSeconds < 60)) {
    showBuildUpDurationError();
    return;
  }
  activeTempoMethod = tempoMethod;
  activeUseAnchorTempos = useAnchorTempos;
  tempoMethodStatus.textContent = `Next session: ${getTempoMethodDescription(tempoMethod, useAnchorTempos)}`;
});
tempoAnchorInput.addEventListener("change", () => {
  useAnchorTempos = tempoAnchorInput.checked;
  updateDurationControl();
  tempoMethodStatus.textContent = useAnchorTempos && !hasValidAnchorTempos()
    ? "Target tempo must be within the BPM range when using min, target, and max only"
    : `Next session: ${getTempoMethodDescription(tempoMethod, useAnchorTempos)}`;
});
openSectionEditorButton.addEventListener("click", async () => {
  sectionEditor.hidden = false;
  refreshSectionSourceList();
  if (!editorSourceItem) await loadEditorSource();
});
closeSectionEditorButton.addEventListener("click", () => { sectionEditor.hidden = true; });
editSectionInput.addEventListener("change", async () => {
  const section = editSectionInput.value === "" ? null : savedSections[Number(editSectionInput.value)];
  if (!confirmDiscardSection()) { refreshEditableSections(); return; }
  await selectEditorSection(section);
});
cancelSectionButton.addEventListener("click", async () => {
  await selectEditorSection(editingSection);
  sectionEditorStatus.textContent = "Changes cancelled.";
});
deleteSectionButton.addEventListener("click", async () => {
  const section = editingSection;
  const index = savedSections.indexOf(section);
  if (index === -1) return;
  const unsavedWarning = editorSnapshot() !== editorBaseline
    ? " Unsaved changes to this section will also be discarded."
    : "";
  if (!window.confirm('Delete "' + section.name + '"?' + unsavedWarning)) return;
  selectedSections.delete(section);
  savedSections.splice(index, 1);
  populateSinglePdfPicker();
  playlist = [];
  playlistIndex = 0;
  await selectEditorSection(null);
  updatePracticeModeUi();
  sectionEditorStatus.textContent = section.name + " deleted for this session. Download score-sections.json to keep changes.";
});
sectionSourceInput.addEventListener("change", async () => {
  if (!confirmDiscardSection()) {
    sectionSourceInput.value = editorSourceItem ? getRelativePdfPath(editorSourceItem) : "";
    return;
  }
  await loadEditorSource();
});
addFragmentButton.addEventListener("click", () => {
  if (!editorPdf) return;
  editorIsDrawing = !editorIsDrawing;
  addFragmentButton.classList.toggle("active", editorIsDrawing);
  addFragmentButton.textContent = editorIsDrawing ? "Drawing: drag on the page" : "Add fragment";
  drawEditorMarkers();
  sectionEditorStatus.textContent = editorIsDrawing ? "Drag a rectangle around the next fragment." : "Add fragments in reading order, then save the section.";
});
sectionEditorOverlay.addEventListener("pointerdown", (event) => {
  if (!editorIsDrawing) {
    const marker = event.target.closest("[data-fragment-index]");
    if (!marker) return;
    const index = Number(marker.dataset.fragmentIndex);
    fragmentGesture = { index, start: normalizeEditorSelection(event), original: { ...draftFragments[index] }, edge: event.target.dataset.edge ?? "" };
    sectionEditorOverlay.setPointerCapture(event.pointerId);
    event.preventDefault();
    return;
  }
  event.preventDefault();
  editorDragStart = normalizeEditorSelection(event);
  sectionEditorOverlay.setPointerCapture(event.pointerId);
  editorSelection = document.createElement("span");
  editorSelection.className = "section-editor-selection";
  sectionEditorOverlay.append(editorSelection);
});
sectionEditorOverlay.addEventListener("pointermove", (event) => {
  if (fragmentGesture) {
    const { index, start, original: f, edge } = fragmentGesture;
    const point = normalizeEditorSelection(event);
    const dx = point.x - start.x, dy = point.y - start.y;
    const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
    let left = f.x, top = f.y, right = f.x + f.width, bottom = f.y + f.height;
    if (!edge) {
      left = clamp(f.x + dx, 0, 1 - f.width);
      top = clamp(f.y + dy, 0, 1 - f.height);
      right = left + f.width; bottom = top + f.height;
    } else {
      if (edge.includes("w")) left = clamp(f.x + dx, 0, right - .01);
      if (edge.includes("e")) right = clamp(right + dx, left + .01, 1);
      if (edge.includes("n")) top = clamp(f.y + dy, 0, bottom - .01);
      if (edge.includes("s")) bottom = clamp(bottom + dy, top + .01, 1);
    }
    draftFragments[index] = { page: f.page, x: left, y: top, width: right - left, height: bottom - top };
    drawEditorMarkers();
    return;
  }
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
  if (fragmentGesture) { fragmentGesture = null; return; }
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
sectionEditorOverlay.addEventListener("pointercancel", () => {
  if (fragmentGesture) draftFragments[fragmentGesture.index] = fragmentGesture.original;
  fragmentGesture = null;
  editorDragStart = null;
  editorSelection?.remove();
  editorSelection = null;
  drawEditorMarkers();
});
saveSectionButton.addEventListener("click", async () => {
  const name = sectionNameInput.value.trim();
  if (!name || !editorSourceItem || !draftFragments.length) {
    sectionEditorStatus.textContent = "Enter a name and add at least one fragment before saving.";
    return;
  }
  const section = { type: "saved-section", name, sourcePath: sectionSourceInput.value, sourceFile: editorSourceItem.file, fragments: draftFragments.map((fragment) => ({ ...fragment })) };
  if (editingSection) {
    if (selectedSections.delete(editingSection)) selectedSections.add(section);
    savedSections[savedSections.indexOf(editingSection)] = section;
  } else savedSections.push(section);
  populateSinglePdfPicker();
  playlist = [];
  playlistIndex = 0;
  await selectEditorSection(null);
  updatePracticeModeUi();
  sectionEditorStatus.textContent = name + " saved in this session. Download score-sections.json to keep changes.";
});
exportSectionsButton.addEventListener("click", () => {
  if (!confirmDiscardSectionForExport()) return;
  const data = { version: 1, sections: savedSections.map((section) => ({ name: section.name, source: section.sourcePath, fragments: section.fragments })) };
  const download = document.createElement("a");
  download.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" }));
  download.download = "score-sections.json";
  download.click();
  setTimeout(() => URL.revokeObjectURL(download.href), 0);
  sectionEditorStatus.textContent = "Downloaded score-sections.json — place it in the folder you chose.";
});
sectionEditorPreviousPage.addEventListener("click", () => { if (editorPage > 1) { editorPage -= 1; renderEditorPage(); } });
sectionEditorNextPage.addEventListener("click", () => { if (editorPdf && editorPage < editorPdf.numPages) { editorPage += 1; renderEditorPage(); } });
previousPage.addEventListener("click", () => currentPage > 1 && renderPage(currentPage - 1));
nextPage.addEventListener("click", () => currentPage < documentPdf.numPages && renderPage(currentPage + 1));

function setPracticeHistoryVisible(isVisible) {
  practiceHistoryPanel.hidden = !isVisible;
  openPracticeHistoryButton.setAttribute("aria-expanded", String(isVisible));
  if (isVisible) void renderPracticeHistory();
  else resetPracticeHistoryClearConfirmation();
}

function placePracticeHistoryAfterSetup() {
  if (!optionsPanel || !openPracticeHistoryButton || !practiceHistoryPanel) return;
  optionsPanel.insertAdjacentElement("afterend", openPracticeHistoryButton);
  openPracticeHistoryButton.insertAdjacentElement("afterend", practiceHistoryPanel);
}

function resetPracticeHistoryClearConfirmation() {
  practiceHistoryClearConfirmationPending = false;
  clearTimeout(practiceHistoryClearConfirmationTimer);
  clearPracticeHistoryButton.textContent = "Clear history";
}

openPracticeHistoryButton.addEventListener("click", () => setPracticeHistoryVisible(true));
closePracticeHistoryButton.addEventListener("click", () => {
  setPracticeHistoryVisible(false);
  openPracticeHistoryButton.focus();
});
exportPracticeHistoryButton.addEventListener("click", async () => {
  const sessions = await getPracticeHistorySessions();
  const data = { version: 1, exportedAt: new Date().toISOString(), sessions };
  const download = document.createElement("a");
  download.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" }));
  download.download = "practice-history.json";
  download.click();
  setTimeout(() => URL.revokeObjectURL(download.href), 0);
  practiceHistoryStatus.textContent = `Downloaded ${sessions.length} practice session${sessions.length === 1 ? "" : "s"}.`;
});
importPracticeHistoryInput.addEventListener("change", async () => {
  const file = importPracticeHistoryInput.files?.[0];
  importPracticeHistoryInput.value = "";
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const incomingSessions = Array.isArray(data) ? data : data.sessions;
    if (!Array.isArray(incomingSessions)) throw new Error("Expected a practice-history export");
    const existingIds = new Set((await getPracticeHistorySessions()).map((session) => session.id));
    const sessionsToImport = incomingSessions.filter((session) =>
      session && typeof session === "object" && typeof session.startedAt === "string" && !existingIds.has(session.id));
    for (const session of sessionsToImport) {
      if (typeof session.id !== "string" || !session.id) session.id = createPracticeHistoryId();
      if (!Array.isArray(session.items)) session.items = [];
      if (!Number.isFinite(session.activeSeconds)) {
        session.activeSeconds = session.items.reduce((total, item) => total + (Number(item.activeSeconds) || 0), 0);
      }
      await savePracticeHistorySession(session);
    }
    await renderPracticeHistory();
    practiceHistoryStatus.textContent = sessionsToImport.length
      ? `Imported ${sessionsToImport.length} practice session${sessionsToImport.length === 1 ? "" : "s"}.`
      : "No new practice sessions found in that file.";
  } catch {
    practiceHistoryStatus.textContent = "That file is not a valid practice-history export.";
  }
});
clearPracticeHistoryButton.addEventListener("click", async () => {
  if (!practiceHistoryClearConfirmationPending) {
    practiceHistoryClearConfirmationPending = true;
    clearPracticeHistoryButton.textContent = "Click again to confirm";
    practiceHistoryStatus.textContent = "Click Clear history again to permanently remove all saved sessions.";
    clearTimeout(practiceHistoryClearConfirmationTimer);
    practiceHistoryClearConfirmationTimer = setTimeout(() => {
      resetPracticeHistoryClearConfirmation();
      practiceHistoryStatus.textContent = "Clear history was not confirmed.";
    }, 10000);
    return;
  }
  await clearPracticeHistorySessions();
  resetPracticeHistoryClearConfirmation();
  await renderPracticeHistory();
  practiceHistoryStatus.textContent = "Practice history cleared from this browser.";
});
window.addEventListener("pagehide", () => {
  if (activePracticeHistorySession) void finalizePracticeHistorySession("interrupted");
});
updatePracticeModeUi();
updateTempoAnchorUi();
placePracticeHistoryAfterSetup();
rotationStatus.textContent = "Choose the folder containing the score to begin";
viewer.hidden = true;
loading.hidden = true;
