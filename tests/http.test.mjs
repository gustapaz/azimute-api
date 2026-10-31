import { test } from "node:test";
import assert from "node:assert/strict";
import { handle } from "../server/runtime.mjs";
const req = (path, body, headers = {}) =>
  handle(
    new Request("https://azimute.test" + path, {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
test("real tRPC mutation returns envelope and validates Zod input", async () => {
  const r = await req("/api/trpc/analyze", {
    points: [
      [0, 0],
      [1, 0],
    ],
  });
  assert.equal(r.status, 200);
  assert.ok((await r.json()).result.data.distance_m > 111000);
  const bad = await req("/api/trpc/simplify", {});
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).error.data.code, "BAD_REQUEST");
});
test("body bytes, malformed JSON, media type and origin guarded", async () => {
  assert.equal((await req("/api/trpc/analyze", "{")).status, 400);
  assert.equal((await req("/api/trpc/analyze", "x".repeat(33000))).status, 413);
  assert.equal(
    (await req("/api/trpc/analyze", {}, { "content-type": "text/plain" }))
      .status,
    415,
  );
  assert.equal(
    (await req("/api/trpc/analyze", {}, { origin: "https://evil.test" }))
      .status,
    403,
  );
});
test("batch, queries in URL and GET mutations rejected", async () => {
  assert.equal((await req("/api/trpc/analyze?batch=1", [])).status, 400);
  assert.equal((await req("/api/trpc/analyze,simplify", [])).status, 404);
  assert.equal(
    (await handle(new Request("https://azimute.test/api/trpc/analyze"))).status,
    405,
  );
});
test("transport failures and successful responses disclose no stack", async () => {
  const r = await req("/api/trpc/analyze", {});
  const body = await r.json();
  assert.equal(body.error.data.stack, undefined);
  assert.equal(r.headers.get("cache-control"), "no-store");
});
