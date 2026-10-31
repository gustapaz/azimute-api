import assert from "node:assert/strict";
import { meta } from "../server/meta.mjs";
const base = process.argv[2];
if (!base || !["http:", "https:"].includes(new URL(base).protocol))
  throw new Error("Use npm run smoke -- URL");
assert.equal((await fetch(new URL("/api/health", base))).status, 200);
for (const e of meta.examples) {
  const r = await fetch(new URL("/api/trpc/simplify", base), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(e.input),
  });
  assert.equal(r.status, 200);
  const v = (await r.json()).result.data;
  assert.ok(v.max_deviation_m <= e.input.tolerance_m + 1e-6);
  assert.equal(v.original_count, e.input.points.length);
}
const measure = await fetch(new URL("/api/trpc/analyze", base), {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(meta.examples[1].input),
});
const v = (await measure.json()).result.data;
assert.equal(v.bounds.crosses_antimeridian, true);
assert.ok(v.distance_m < 23000);
const bad = await fetch(new URL("/api/trpc/analyze", base), {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: "{}",
});
assert.equal(bad.status, 400);
assert.equal((await bad.json()).error.data.code, "BAD_REQUEST");
assert.equal((await fetch(new URL("/docs.html", base))).status, 200);
console.log(
  JSON.stringify(
    {
      ok: true,
      base,
      checks: [
        "health",
        "real tRPC mutations",
        "three examples",
        "antimeridian",
        "Zod failure",
        "documentation",
      ],
    },
    null,
    2,
  ),
);
