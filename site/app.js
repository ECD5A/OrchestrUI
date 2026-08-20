const phaseOrder = ["inspect", "route", "harmonize", "audit"];
const phaseContent = {
  inspect: {
    code: "01 / INSPECT",
    title: "Read the host project.",
    copy: "Detect the existing base, tokens, dependencies, accessibility constraints, and real capability gaps.",
    points: ["existing system remains authoritative", "charts are the only confirmed gap"],
    output: { base: "pending", selected: "pending", rejected: "pending", status: "scanning" },
    progress: 25,
  },
  route: {
    code: "02 / ROUTE",
    title: "Assign one owner per role.",
    copy: "Keep the host base, select one chart specialist, and reject overlapping systems and unnecessary motion.",
    points: ["shadcn/ui keeps base ownership", "Bklit UI owns data visualization"],
    output: { base: "shadcn/ui", selected: "Bklit UI", rejected: "daisyUI + motion", status: "routed" },
    progress: 50,
  },
  harmonize: {
    code: "03 / HARMONIZE",
    title: "Map to the host contract.",
    copy: "Adapt typography, spacing, radius, color, surfaces, shadows, icons, and motion to one token system.",
    points: ["host tokens stay authoritative", "imported code is reviewed as untrusted"],
    output: { base: "shadcn/ui", selected: "Bklit UI", rejected: "2 conflicts", status: "normalized" },
    progress: 75,
  },
  audit: {
    code: "04 / AUDIT",
    title: "Verify the rendered result.",
    copy: "Check accessibility, responsiveness, motion, performance, data readability, licensing, and library discipline.",
    points: ["blocking findings: 0", "reduced motion and rights verified"],
    output: { base: "shadcn/ui", selected: "Bklit UI", rejected: "2 conflicts", status: "passed" },
    progress: 100,
  },
};

const consoleElement = document.querySelector(".console");
const phaseButtons = [...document.querySelectorAll("[data-phase-button]")];
const playControl = document.querySelector("[data-play-control]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const fields = {
  runState: document.querySelector("[data-run-state]"),
  playIcon: document.querySelector("[data-play-icon]"),
  playLabel: document.querySelector("[data-play-label]"),
  progress: document.querySelector("[data-progress]"),
  code: document.querySelector("[data-phase-code]"),
  title: document.querySelector("[data-phase-title]"),
  copy: document.querySelector("[data-phase-copy]"),
  list: document.querySelector("[data-phase-list]"),
  base: document.querySelector("[data-output-base]"),
  selected: document.querySelector("[data-output-selected]"),
  rejected: document.querySelector("[data-output-rejected]"),
  status: document.querySelector("[data-output-status]"),
};

let activeIndex = 0;
let timer;
let paused = reducedMotion.matches;

function renderPhase(phase) {
  const content = phaseContent[phase];
  activeIndex = phaseOrder.indexOf(phase);
  consoleElement.dataset.phase = phase;
  consoleElement.dataset.phaseIndex = String(activeIndex);
  fields.code.textContent = content.code;
  fields.title.textContent = content.title;
  fields.copy.textContent = content.copy;
  fields.progress.style.width = `${content.progress}%`;
  fields.list.replaceChildren(...content.points.map((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    return item;
  }));
  for (const [key, value] of Object.entries(content.output)) fields[key].textContent = value;
  for (const button of phaseButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.phaseButton === phase));
  }
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
    renderPhase(phaseOrder[(activeIndex + 1) % phaseOrder.length]);
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

renderPhase(phaseOrder[activeIndex]);
updatePlayback();
restartTimer();
