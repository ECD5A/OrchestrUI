import test from "node:test";
import assert from "node:assert/strict";

import {
  checkExternalUrl,
  isPublicHttpsUrl,
} from "../scripts/check-external-links.mjs";

test("external link policy rejects non-public HTTPS destinations before fetch", async () => {
  for (const url of [
    "https://localhost/private",
    "https://127.0.0.1/private",
    "https://10.0.0.1/private",
    "https://169.254.169.254/metadata",
    "https://[::1]/private",
  ]) {
    assert.equal(isPublicHttpsUrl(url), false);
  }
  assert.equal(isPublicHttpsUrl("https://example.com/docs"), true);

  let called = false;
  const result = await checkExternalUrl("https://127.0.0.1/private", async () => {
    called = true;
    return new Response(null, { status: 204 });
  });
  assert.equal(called, false);
  assert.match(result.detail, /non-public/i);
});

test("external link policy refuses redirects", async () => {
  const result = await checkExternalUrl("https://example.com/docs", async (_url, options) => {
    assert.equal(options.redirect, "error");
    return new Response(null, { status: 204 });
  });
  assert.equal(result.status, 204);
});

test("external link policy validates clone URLs through their repository page", async () => {
  const result = await checkExternalUrl("https://github.com/ECD5A/OrchestrUI.git", async (url, options) => {
    assert.equal(url, "https://github.com/ECD5A/OrchestrUI");
    assert.equal(options.method, "HEAD");
    return new Response(null, { status: 200 });
  });
  assert.equal(result.status, 200);
});
