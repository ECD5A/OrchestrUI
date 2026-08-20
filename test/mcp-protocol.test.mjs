import test from "node:test";
import assert from "node:assert/strict";

import { Client, InMemoryTransport } from "@modelcontextprotocol/client";

import { createOrchestrUiServer } from "../dist/mcp/src/server.js";

test("MCP exposes six read-only tools and serves structured results", async (t) => {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const server = createOrchestrUiServer();
  const client = new Client({ name: "orchestrui-test", version: "0.1.0" });

  await server.connect(serverTransport);
  await client.connect(clientTransport);
  t.after(async () => {
    await client.close();
    await server.close();
  });

  const listing = await client.listTools();
  const names = listing.tools.map((tool) => tool.name).sort();
  assert.deepEqual(names, [
    "audit_plan",
    "get_install_instructions",
    "get_library_guidance",
    "list_libraries",
    "recommend_stack",
    "search_components",
  ]);
  for (const tool of listing.tools) {
    assert.equal(tool.annotations?.readOnlyHint, true, `${tool.name} must be read-only`);
    assert.equal(tool.annotations?.destructiveHint, false, `${tool.name} must be non-destructive`);
  }

  const response = await client.callTool({ name: "list_libraries", arguments: {} });
  assert.equal(response.isError, undefined);
  assert.equal(response.structuredContent?.result?.count, 7);
});
