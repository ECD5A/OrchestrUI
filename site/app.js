const phaseOrder = ["profile", "route", "ownership", "audit"];

const phaseContent = {
  profile: {
    code: "01 / INSPECT",
    title: "Read the host before choosing.",
    copy: "Normalize explicit project evidence instead of guessing from prompt keywords.",
    progress: 0,
  },
  route: {
    code: "02 / ROUTE",
    title: "Choose the smallest valid stack.",
    copy: "Keep compatible owners, fill only the capability gap, and reject redundant candidates.",
    progress: 33.333,
  },
  ownership: {
    code: "03 / HARMONIZE",
    title: "Give every major role one owner.",
    copy: "Make preservation, selection, and rejection explicit before implementation begins.",
    progress: 66.667,
  },
  audit: {
    code: "04 / AUDIT",
    title: "Report evidence, not confidence.",
    copy: "Verified checks score. Rendered-host checks remain pending until evidence exists.",
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
    input: fixture.host,
    phases: {
      profile: {
        points: [
          `input: ${fixture.input_mode}`,
          `gap: ${fixture.host.gap}`,
        ],
        output: { base: "inspected", selected: "pending", rejected: "pending", status: "structured" },
      },
      route: {
        points: [
          selected.length ? `selected: ${selected.join(", ")}` : "selected: none",
          `rejected: ${rejected.length} candidates`,
        ],
        output: {
          base: fixture.host.base,
          selected: selected.join(", ") || "none",
          rejected: `${rejected.length} rejected`,
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
          rejected: `${rejected.length} rejected`,
          status: auditStatus,
        },
      },
    },
  };
}

const scenarioContent = Object.fromEntries(fixtures.map((fixture) => [fixture.id, createScenario(fixture)]));
const workbench = document.querySelector(".workbench");
const phaseButtons = [...document.querySelectorAll("[data-phase-button]")];
const scenarioButtons = [...document.querySelectorAll("[data-scenario-button]")];
const playControl = document.querySelector("[data-play-control]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const fields = {
  runState: document.querySelector("[data-run-state]"),
  runId: document.querySelector("[data-run-id]"),
  playIcon: document.querySelector("[data-play-icon] path"),
  playLabel: document.querySelector("[data-play-label]"),
  progress: document.querySelector("[data-progress]"),
  signal: document.querySelector("[data-signal]"),
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
};

let activePhaseIndex = 0;
let activeScenario = "next-shadcn-dashboard";
let timer;
let paused = reducedMotion.matches;

function renderPhase(phase) {
  const phaseData = phaseContent[phase];
  const scenarioPhase = scenarioContent[activeScenario].phases[phase];
  activePhaseIndex = phaseOrder.indexOf(phase);
  workbench.dataset.phase = phase;
  workbench.dataset.phaseIndex = String(activePhaseIndex);
  fields.code.textContent = phaseData.code;
  fields.title.textContent = phaseData.title;
  fields.copy.textContent = phaseData.copy;
  fields.progress.style.width = `${phaseData.progress}%`;
  fields.signal.style.left = `${phaseData.progress}%`;
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
  workbench.dataset.scenario = scenario;
  fields.runId.textContent = content.runId;
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
  fields.playIcon.setAttribute("d", paused ? "M4.5 3.25 12.25 8 4.5 12.75Z" : "M5 3.5v9M11 3.5v9");
  fields.playLabel.textContent = paused ? "Run" : "Pause";
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
