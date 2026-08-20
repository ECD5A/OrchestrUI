import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const catalog=JSON.parse(fs.readFileSync("catalog/libraries.json","utf8"));
const routing=JSON.parse(fs.readFileSync("catalog/routing-rules.json","utf8"));
test("exactly seven unique libraries",()=>{assert.equal(catalog.libraries.length,7);assert.equal(new Set(catalog.libraries.map(x=>x.id)).size,7)});
test("React Bits guardrail",()=>{const x=catalog.libraries.find(x=>x.id==="react-bits");assert.match(x.license_note,/Commons Clause/i);assert.match(x.redistribution,/Never.*redistribute|Never mirror/i)});
test("routing conflict guards",()=>{const ids=new Set(routing.rules.map(x=>x.id));for(const id of ["minimum-set","base-system-conflict","react-bits-no-vendor"])assert.ok(ids.has(id))});
