const phaseOrder = ["inspect", "route", "harmonize", "audit"];

const phaseContent = {
  inspect: {
    code: "01 / INSPECT",
    label: "INSPECT",
    title: "Read the host project.",
    copy: "Detect the existing base, tokens, dependencies, accessibility constraints, and real capability gaps.",
    progress: 25,
  },
  route: {
    code: "02 / ROUTE",
    label: "ROUTE",
    title: "Assign one owner per role.",
    copy: "Keep working systems, select only the missing specialist, and explicitly reject overlap.",
    progress: 50,
  },
  harmonize: {
    code: "03 / HARMONIZE",
    label: "HARMONIZE",
    title: "Map to the host contract.",
    copy: "Adapt typography, spacing, radius, color, surfaces, shadows, icons, and motion to one token system.",
    progress: 75,
  },
  audit: {
    code: "04 / AUDIT",
    label: "AUDIT",
    title: "Verify the rendered result.",
    copy: "Check accessibility, responsiveness, motion, performance, data readability, licensing, and library discipline.",
    progress: 100,
  },
};

const scenarioContent = {
  dashboard: {
    runId: "ANALYTICS-DASHBOARD",
    preview: "dashboard",
    input: { framework: "React", base: "shadcn/ui", tokens: "detected", gap: "charts" },
    phases: {
      inspect: {
        points: ["existing system remains authoritative", "charts are the only confirmed gap"],
        output: { base: "pending", selected: "pending", rejected: "pending", status: "scanning" },
      },
      route: {
        points: ["shadcn/ui keeps base ownership", "Bklit UI owns data visualization"],
        output: { base: "shadcn/ui", selected: "Bklit UI", rejected: "daisyUI + motion", status: "routed" },
      },
      harmonize: {
        points: ["chart tokens map to the host palette", "density and units stay readable"],
        output: { base: "shadcn/ui", selected: "Bklit UI", rejected: "2 conflicts", status: "normalized" },
      },
      audit: {
        points: ["blocking findings: 0", "labels, contrast, and reduced motion verified"],
        output: { base: "shadcn/ui", selected: "Bklit UI", rejected: "2 conflicts", status: "passed" },
      },
    },
  },
  landing: {
    runId: "PRODUCT-LANDING",
    preview: "landing",
    input: { framework: "Next.js", base: "shadcn/ui", tokens: "detected", gap: "marketing motion" },
    phases: {
      inspect: {
        points: ["product controls already have an owner", "one marketing enhancement is missing"],
        output: { base: "pending", selected: "pending", rejected: "pending", status: "scanning" },
      },
      route: {
        points: ["Magic UI owns marketing enhancement", "React Bits and Anime.js would overlap"],
        output: { base: "shadcn/ui", selected: "Magic UI", rejected: "Bits + Anime.js", status: "routed" },
      },
      harmonize: {
        points: ["accent motion follows host timing", "decorative effects stay non-blocking"],
        output: { base: "shadcn/ui", selected: "Magic UI", rejected: "2 overlaps", status: "normalized" },
      },
      audit: {
        points: ["blocking findings: 0", "keyboard flow and reduced motion verified"],
        output: { base: "shadcn/ui", selected: "Magic UI", rejected: "2 overlaps", status: "passed" },
      },
    },
  },
  existing: {
    runId: "MATURE-DESIGN-SYSTEM",
    preview: "host only",
    input: { framework: "Vue", base: "internal DS", tokens: "mature", gap: "none" },
    phases: {
      inspect: {
        points: ["the host already covers every UI role", "no capability gap is confirmed"],
        output: { base: "pending", selected: "pending", rejected: "pending", status: "scanning" },
      },
      route: {
        points: ["the internal design system keeps ownership", "all new libraries are unnecessary"],
        output: { base: "internal DS", selected: "none", rejected: "all additions", status: "routed" },
      },
      harmonize: {
        points: ["existing tokens remain unchanged", "no third-party code is imported"],
        output: { base: "internal DS", selected: "none", rejected: "all additions", status: "unchanged" },
      },
      audit: {
        points: ["blocking findings: 0", "minimum-set decision verified"],
        output: { base: "internal DS", selected: "none", rejected: "all additions", status: "passed" },
      },
    },
  },
};

const consoleElement = document.querySelector(".console");
const phaseButtons = [...document.querySelectorAll("[data-phase-button]")];
const scenarioButtons = [...document.querySelectorAll("[data-scenario-button]")];
const playControl = document.querySelector("[data-play-control]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const fields = {
  runState: document.querySelector("[data-run-state]"),
  runId: document.querySelector("[data-run-id]"),
  playIcon: document.querySelector("[data-play-icon]"),
  playLabel: document.querySelector("[data-play-label]"),
  progress: document.querySelector("[data-progress]"),
  engineLabel: document.querySelector("[data-engine-label]"),
  code: document.querySelector("[data-phase-code]"),
  title: document.querySelector("[data-phase-title]"),
  copy: document.querySelector("[data-phase-copy]"),
  list: document.querySelector("[data-phase-list]"),
  inputFramework: document.querySelector("[data-input-framework]"),
  inputBase: document.querySelector("[data-input-base]"),
  inputTokens: document.querySelector("[data-input-tokens]"),
  inputGap: document.querySelector("[data-input-gap]"),
  base: document.querySelector("[data-output-base]"),
  selected: document.querySelector("[data-output-selected]"),
  rejected: document.querySelector("[data-output-rejected]"),
  status: document.querySelector("[data-output-status]"),
  previewLabel: document.querySelector("[data-preview-label]"),
};

let activePhaseIndex = 0;
let activeScenario = "dashboard";
let timer;
let paused = reducedMotion.matches;

function renderPhase(phase) {
  const phaseData = phaseContent[phase];
  const scenarioPhase = scenarioContent[activeScenario].phases[phase];
  activePhaseIndex = phaseOrder.indexOf(phase);
  consoleElement.dataset.phase = phase;
  consoleElement.dataset.phaseIndex = String(activePhaseIndex);
  fields.code.textContent = phaseData.code;
  fields.engineLabel.textContent = phaseData.label;
  fields.title.textContent = phaseData.title;
  fields.copy.textContent = phaseData.copy;
  fields.progress.style.width = `${phaseData.progress}%`;
  fields.list.replaceChildren(...scenarioPhase.points.map((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    return item;
  }));
  for (const [key, value] of Object.entries(scenarioPhase.output)) fields[key].textContent = value;
  for (const button of phaseButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.phaseButton === phase));
  }
}

function renderScenario(scenario) {
  const content = scenarioContent[scenario];
  activeScenario = scenario;
  consoleElement.dataset.scenario = scenario;
  fields.runId.textContent = content.runId;
  fields.previewLabel.textContent = content.preview;
  for (const [key, value] of Object.entries(content.input)) {
    fields[`input${key[0].toUpperCase()}${key.slice(1)}`].textContent = value;
  }
  for (const button of scenarioButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.scenarioButton === scenario));
  }
  renderPhase(phaseOrder[0]);
}

function updatePlayback() {
  fields.runState.textContent = paused ? "paused" : "running";
  fields.playIcon.textContent = paused ? "▶" : "Ⅱ";
  fields.playLabel.textContent = paused ? "run" : "pause";
  playControl.setAttribute("aria-pressed", String(paused));
  playControl.setAttribute("aria-label", paused ? "Run automatic workflow" : "Pause automatic run");
}

function restartTimer() {
  window.clearInterval(timer);
  timer = undefined;
  if (paused || document.hidden) return;
  timer = window.setInterval(() => {
    renderPhase(phaseOrder[(activePhaseIndex + 1) % phaseOrder.length]);
  }, 2600);
}

for (const button of phaseButtons) {
  button.addEventListener("click", () => {
    paused = true;
    renderPhase(button.dataset.phaseButton);
    updatePlayback();
    restartTimer();
  });
}

for (const button of scenarioButtons) {
  button.addEventListener("click", () => {
    paused = true;
    renderScenario(button.dataset.scenarioButton);
    updatePlayback();
    restartTimer();
  });
}

playControl.addEventListener("click", () => {
  paused = !paused;
  updatePlayback();
  restartTimer();
});

reducedMotion.addEventListener("change", (event) => {
  paused = event.matches;
  updatePlayback();
  restartTimer();
});

document.addEventListener("visibilitychange", restartTimer);

renderScenario(activeScenario);
updatePlayback();
restartTimer();
