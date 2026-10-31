import { test } from "node:test";
import assert from "node:assert/strict";
import {
  analyze,
  simplify,
  distance,
  arcDistance,
  bounds,
} from "../server/core.ts";
const near = (a, b, eps = 1e-5) =>
  assert.ok(Math.abs(a - b) < eps, `${a} vs ${b}`);
test("quarter equator and identical points match analytic answers", () => {
  near(distance([0, 0], [90, 0]), (Math.PI * 6371008.8) / 2);
  near(distance([1, 2], [1, 2]), 0);
});
test("distance symmetry and finite antipodes", () => {
  near(distance([0, 0], [180, 0]), Math.PI * 6371008.8);
  near(distance([-50, 30], [100, -20]), distance([100, -20], [-50, 30]));
});
test("antimeridian uses short arc and minimal point bounds", () => {
  const r = analyze({
    points: [
      [179.9, 0],
      [-179.9, 0],
    ],
  });
  assert.ok(r.distance_m < 23000);
  assert.equal(r.bounds.crosses_antimeridian, true);
  near(r.bounds.longitude_span, 0.2);
});
test("equatorial collinear points simplify to extremes", () => {
  const r = simplify({
    points: [
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    tolerance_m: 1,
  });
  assert.deepEqual(r.indices, [0, 2]);
  assert.ok(r.max_deviation_m < 1e-6);
});
test("sharp bend remains at small tolerance", () => {
  assert.equal(
    simplify({
      points: [
        [0, 0],
        [0.01, 0.01],
        [0.02, 0],
      ],
      tolerance_m: 10,
    }).retained_count,
    3,
  );
});
test("projection outside a minor arc uses endpoint distance", () => {
  near(arcDistance([3, 0], [0, 0], [1, 0]), distance([3, 0], [1, 0]));
});
test("near poles and duplicate points remain finite", () => {
  for (const points of [
    [
      [0, 90],
      [90, 89.99],
      [180, 90],
    ],
    [
      [0, 0],
      [0, 0],
      [0, 0],
    ],
  ]) {
    const r = simplify({ points, tolerance_m: 10 });
    assert.ok(Number.isFinite(r.max_deviation_m));
    assert.ok(Number.isFinite(r.simplified_distance_m));
  }
});
test("ambiguous antipodal segment conservatively retains middle", () => {
  assert.equal(
    simplify({
      points: [
        [0, 0],
        [90, 0],
        [180, 0],
      ],
      tolerance_m: 1,
    }).retained_count,
    3,
  );
});
test("reject invalid coordinates, extra fields, oversized lines, NaN and tolerance", () => {
  for (const v of [
    { points: [[0, 0]] },
    {
      points: [
        [181, 0],
        [0, 0],
      ],
    },
    {
      points: [
        [0, 91],
        [0, 0],
      ],
    },
    {
      points: [
        [0, 0, 1],
        [0, 0],
      ],
    },
    {
      points: [
        [NaN, 0],
        [0, 0],
      ],
    },
    {
      points: [
        [0, 0],
        [1, 1],
      ],
      extra: 1,
    },
    { points: Array.from({ length: 257 }, () => [0, 0]) },
    {
      points: [
        [0, 0],
        [1, 1],
      ],
      tolerance_m: -1,
    },
  ])
    assert.throws(() => analyze(v));
});
test("200 seeded paths preserve endpoints and verified deviation bound", () => {
  let seed = 881;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
  for (let k = 0; k < 200; k++) {
    const points = Array.from({ length: 20 }, (_, i) => [
        179 + i * 0.001 > 180 ? 179 + i * 0.001 - 360 : 179 + i * 0.001,
        40 + (rnd() - 0.5) * 0.001,
      ]),
      tolerance_m = rnd() * 50,
      r = simplify({ points, tolerance_m });
    assert.deepEqual(r.points[0], points[0]);
    assert.deepEqual(r.points.at(-1), points.at(-1));
    assert.ok(r.max_deviation_m <= tolerance_m + 1e-6);
    assert.ok(r.simplified_distance_m <= r.original_distance_m + 1e-6);
  }
});
test("bounds enclose repeated identical longitudes", () => {
  near(
    bounds([
      [10, -2],
      [10, 3],
    ]).longitude_span,
    0,
  );
});
