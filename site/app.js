const phaseOrder = ["inspect", "route", "harmonize", "audit"];
const phaseContent = {
  inspect: {
    kicker: "01 · Inspect the host",
    title: "Start with what already works.",
    copy: "Read the framework, design system, tokens, motion, accessibility constraints, and asset rights before selecting anything new.",
    points: ["Existing system stays the base owner", "Capability gaps become explicit", "Unknown rights block risky assets"],
    rule: "Inspect before selection.",
  },
  route: {
    kicker: "02 · Route each role",
    title: "Give every major role one owner.",
    copy: "Select the smallest compatible stack and explicitly reject libraries that duplicate the base, charts, marketing polish, or motion layer.",
    points: ["Bklit owns data visualization", "Existing controls win by default", "Redundant systems are rejected"],
    rule: "Choose less, deliberately.",
  },
  harmonize: {
    kicker: "03 · Harmonize the result",
    title: "One interface, not stitched demos.",
    copy: "Map selected public pieces to the host typography, spacing, radius, color, surfaces, shadows, iconography, and motion contract.",
    points: ["Host tokens remain authoritative", "Motion has one timing language", "Imported code is reviewed as untrusted"],
    rule: "One visual contract.",
  },
  audit: {
    kicker: "04 · Audit before shipping",
    title: "Prove the interface is coherent.",
    copy: "Review the rendered UI for accessibility, responsiveness, motion discipline, performance, data readability, licensing, and library misuse.",
    points: ["Every blocking score is fixed", "Reduced motion is verified", "Rights and provenance stay visible"],
    rule: "Quality outranks novelty.",
  },
};

const shell = document.querySelector(".flow-shell");
const phaseButtons = [...document.querySelectorAll("[data-phase-button]")];
const playControl = document.querySelector("[data-play-control]");
const playIcon = document.querySelector("[data-play-icon]");
const playLabel = document.querySelector("[data-play-label]");
const kicker = document.querySelector("[data-phase-kicker]");
const title = document.querySelector("[data-phase-title]");
const copy = document.querySelector("[data-phase-copy]");
const list = document.querySelector("[data-phase-list]");
const rule = document.querySelector("[data-phase-rule]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let activeIndex = 0;
let timer;
let paused = reducedMotion.matches;

function renderPhase(phase) {
  const content = phaseContent[phase];
  activeIndex = phaseOrder.indexOf(phase);
  shell.dataset.phase = phase;
  kicker.textContent = content.kicker;
  title.textContent = content.title;
  copy.textContent = content.copy;
  rule.textContent = content.rule;
  list.replaceChildren(...content.points.map((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    return item;
  }));
  for (const button of phaseButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.phaseButton === phase));
  }
}

function updatePlayControl() {
  playControl.setAttribute("aria-pressed", String(paused));
  playControl.setAttribute("aria-label", paused ? "Play automatic presentation" : "Pause automatic presentation");
  playIcon.textContent = paused ? "▶" : "Ⅱ";
  playLabel.textContent = paused ? "Play" : "Pause";
}

function stopTimer() {
  window.clearInterval(timer);
  timer = undefined;
}

function startTimer() {
  stopTimer();
  if (paused || document.hidden) return;
  timer = window.setInterval(() => {
    renderPhase(phaseOrder[(activeIndex + 1) % phaseOrder.length]);
  }, 3600);
}

for (const button of phaseButtons) {
  button.addEventListener("click", () => {
    renderPhase(button.dataset.phaseButton);
    startTimer();
  });
}

playControl.addEventListener("click", () => {
  paused = !paused;
  updatePlayControl();
  startTimer();
});

reducedMotion.addEventListener("change", (event) => {
  paused = event.matches;
  updatePlayControl();
  startTimer();
});

document.addEventListener("visibilitychange", startTimer);

const revealItems = [...document.querySelectorAll(".reveal")];
if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  for (const item of revealItems) item.classList.add("is-visible");
} else {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.14 });
  for (const item of revealItems) observer.observe(item);
}

renderPhase(phaseOrder[activeIndex]);
updatePlayControl();
startTimer();
