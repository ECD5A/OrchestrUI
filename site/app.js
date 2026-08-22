const phaseOrder = ["profile", "route", "ownership", "audit"];

const phaseContent = {
  profile: {
    code: "01 / PROFILE",
    label: "PROFILE",
    title: "Normalize the inspected host.",
    copy: "Use explicit HostProfile and TaskProfile fields instead of guessing the stack from prompt keywords.",
    progress: 25,
  },
  route: {
    code: "02 / ROUTE",
    label: "ROUTE",
    title: "Apply the policy matrix.",
    copy: "Preserve compatible owners, select the smallest capability set, and reject every unnecessary candidate.",
    progress: 50,
  },
  ownership: {
    code: "03 / EVIDENCE",
    label: "EVIDENCE",
    title: "Make ownership explicit.",
    copy: "Every preserved, selected, and rejected candidate carries a rule identifier and inspectable evidence.",
    progress: 75,
  },
  audit: {
    code: "04 / AUDIT",
    label: "AUDIT",
    title: "Keep unverified checks pending.",
    copy: "The audit reports only verified points. Rendered-host checks remain pending until evidence is attached.",
    progress: 100,
  },
};

const fixtures = globalThis.ORCHESTRUI_FIXTURES ?? [];

function compact(values, limit = 3) {
  const visible = values.slice(0, limit);
  return values.length > limit ? `${visible.join(", ")} +${values.length - limit}` : visible.join(", ");
}

function createScenario(fixture) {
  const selected = fixture.selected.map((item) => item.id);
  const rejected = fixture.rejected.map((item) => item.id);
  const owners = fixture.owners.map((item) => `${item.role} → ${item.owner}`);
  const rules = [...new Set([
    ...fixture.decisions.map((item) => item.rule_id),
    ...fixture.rejected.map((item) => item.rule_id),
  ])];
  const auditStatus = fixture.audit.blockers.length
    ? "blocked"
    : fixture.audit.pending_checks.length
      ? `${fixture.audit.pending_checks.length} pending`
      : "verified";

  return {
    runId: fixture.run_id,
    preview: fixture.id,
    input: fixture.host,
    phases: {
      profile: {
        points: [
          `input mode: ${fixture.input_mode}`,
          `capability: ${fixture.host.gap}`,
        ],
        output: { base: "inspected", selected: "pending", rejected: "pending", status: "structured" },
      },
      route: {
        points: [
          fixture.summary,
          selected.length ? `selected: ${selected.join(", ")}` : "selected: none",
        ],
        output: {
          base: fixture.host.base,
          selected: selected.join(", ") || "none",
          rejected: `${rejected.length} candidates`,
          status: "routed",
        },
      },
      ownership: {
        points: owners.slice(0, 3),
        output: {
          base: fixture.host.base,
          selected: selected.join(", ") || "none",
          rejected: compact(rules, 2),
          status: `${fixture.owners.length} owners`,
        },
      },
      audit: {
        points: [
          `verified: ${fixture.audit.verified_score}/${fixture.audit.verified_maximum}`,
          fixture.audit.pending_checks.length
            ? `pending: ${compact(fixture.audit.pending_checks, 2)}`
            : "pending: none",
        ],
        output: {
          base: fixture.host.base,
          selected: selected.join(", ") || "none",
          rejected: `${rejected.length} candidates`,
          status: auditStatus,
        },
      },
    },
  };
}

const scenarioContent = Object.fromEntries(fixtures.map((fixture) => [fixture.id, createScenario(fixture)]));
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
let activeScenario = "next-shadcn-dashboard";
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
  playControl.setAttribute("aria-label", paused ? "Run automatic policy trace" : "Pause automatic policy trace");
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
