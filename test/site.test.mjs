import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync("site/index.html", "utf8");
const css = fs.readFileSync("site/styles.css", "utf8");
const script = fs.readFileSync("site/app.js", "utf8");
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
  for (const phase of ["inspect", "route", "harmonize", "audit"]) {
    assert.match(script, new RegExp(`${phase}: \\{`));
  }
  for (const scenario of ["dashboard", "landing", "existing"]) {
    assert.match(script, new RegExp(`${scenario}: \\{`));
  }
});

test("Pages deployment uses pinned official actions", () => {
  assert.match(pagesWorkflow, /actions\/configure-pages@[0-9a-f]{40}/);
  assert.match(pagesWorkflow, /actions\/upload-pages-artifact@[0-9a-f]{40}/);
  assert.match(pagesWorkflow, /actions\/deploy-pages@[0-9a-f]{40}/);
  assert.match(pagesWorkflow, /pages: write/);
  assert.match(pagesWorkflow, /id-token: write/);
});
