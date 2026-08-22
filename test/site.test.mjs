import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("site/index.html", "utf8");
const css = fs.readFileSync("site/styles.css", "utf8");
const script = fs.readFileSync("site/app.js", "utf8");
const fixtures = fs.readFileSync("site/fixtures.js", "utf8");
const pagesWorkflow = fs.readFileSync(".github/workflows/pages.yml", "utf8");

test("workflow demo has a semantic, self-contained document shell", () => {
  assert.match(html, /<main id="main">/);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1);
  assert.equal((html.match(/<section\b/g) ?? []).length, 1);
  assert.match(html, /class="skip-link"/);
  assert.match(html, /Content-Security-Policy/);
  assert.doesNotMatch(html, /<script[^>]+src="https?:/i);
  assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"[^>]+href="https?:/i);
  assert.equal((html.match(/data-phase-button=/g) ?? []).length, 4);
  assert.equal((html.match(/data-scenario-button=/g) ?? []).length, 3);
  assert.match(html, /aria-live="polite"/);
  assert.doesNotMatch(html, /id="system"|v0\.1\.0|open source|ready to route|view v0/i);
});

test("workflow demo provides responsive and reduced-motion behavior", () => {
  assert.match(css, /@media \(max-width: 620px\)/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(script, /prefers-reduced-motion: reduce/);
  for (const phase of ["profile", "route", "ownership", "audit"]) {
    assert.match(script, new RegExp(`${phase}: \\{`));
  }
  for (const scenario of ["next-shadcn-dashboard", "daisy-admin", "marketing-landing"]) {
    assert.match(fixtures, new RegExp(`"id": "${scenario}"`));
  }
  assert.match(script, /pending_checks/);
  assert.doesNotMatch(script, /status:\s*"passed"/);
  assert.match(html, /<script src="fixtures\.js"><\/script>/);
});

test("workflow demo is generated from committed fixture results", () => {
  assert.match(fixtures, /globalThis\.ORCHESTRUI_FIXTURES/);
  assert.match(fixtures, /"input_mode": "structured-profiles"/);
  assert.match(fixtures, /"verified_score":/);
  assert.match(fixtures, /"pending_checks":/);
});

test("Pages deployment uses pinned official actions", () => {
  assert.match(pagesWorkflow, /github\.event\.repository\.visibility == 'public'/);
  assert.match(pagesWorkflow, /actions\/configure-pages@[0-9a-f]{40}/);
  assert.match(pagesWorkflow, /actions\/upload-pages-artifact@[0-9a-f]{40}/);
  assert.match(pagesWorkflow, /actions\/deploy-pages@[0-9a-f]{40}/);
  assert.match(pagesWorkflow, /pages: write/);
  assert.match(pagesWorkflow, /id-token: write/);
});
