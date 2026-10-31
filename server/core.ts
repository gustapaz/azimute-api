import { z } from "zod";
export const point = z.tuple([
  z.number().finite().min(-180).max(180),
  z.number().finite().min(-90).max(90),
]);
export const inputSchema = z
  .object({
    points: z.array(point).min(2).max(256),
    tolerance_m: z.number().finite().min(0).max(10000).default(10),
  })
  .strict();
type Point = z.infer<typeof point>;
type Vector = [number, number, number];
const R = 6371008.8,
  rad = Math.PI / 180;
const dot = (a: Vector, b: Vector) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vector, b: Vector): Vector => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const norm = (a: Vector) => Math.hypot(...a);
const unit = (p: Point): Vector => [
  Math.cos(p[1] * rad) * Math.cos(p[0] * rad),
  Math.cos(p[1] * rad) * Math.sin(p[0] * rad),
  Math.sin(p[1] * rad),
];
const angle = (a: Vector, b: Vector) =>
  Math.atan2(norm(cross(a, b)), dot(a, b));
export const distance = (a: Point, b: Point) => angle(unit(a), unit(b)) * R;
export function arcDistance(p: Point, a: Point, b: Point) {
  const u = unit(a),
    v = unit(b),
    w = unit(p),
    n = cross(u, v),
    nn = norm(n),
    ab = angle(u, v);
  let best = Math.min(angle(w, u), angle(w, v));
  // Coincident or nearly antipodal endpoints do not define a stable minor arc.
  if (nn < 1e-12 || ab > Math.PI - 1e-8) return best * R;
  const normal = n.map((x) => x / nn) as Vector,
    d = dot(w, normal),
    q = w.map((x, i) => x - d * normal[i]) as Vector,
    qn = norm(q);
  if (qn < 1e-12) return best * R;
  for (const sign of [1, -1]) {
    const t = q.map((x) => (sign * x) / qn) as Vector;
    if (angle(u, t) + angle(t, v) <= ab + 1e-10)
      best = Math.min(best, angle(w, t));
  }
  return best * R;
}
export function bounds(points: Point[]) {
  const lons = [...new Set(points.map((p) => (p[0] + 360) % 360))].sort(
    (a, b) => a - b,
  );
  let gap = -1,
    start = 0;
  for (let i = 0; i < lons.length; i++) {
    const next = i + 1 < lons.length ? lons[i + 1] : lons[0] + 360,
      g = next - lons[i];
    if (g > gap) {
      gap = g;
      start = (i + 1) % lons.length;
    }
  }
  const signed = (x: number) => (x > 180 ? x - 360 : x);
  const west = signed(lons[start]),
    east = signed(lons[(start + lons.length - 1) % lons.length]);
  return {
    south: Math.min(...points.map((p) => p[1])),
    north: Math.max(...points.map((p) => p[1])),
    west,
    east,
    crosses_antimeridian: west > east,
    longitude_span: 360 - gap,
  };
}
export function analyze(raw: unknown) {
  const { points } = inputSchema.parse(raw),
    segments = points.slice(1).map((p, i) => distance(points[i], p));
  return {
    model: "sphere",
    radius_m: R,
    point_count: points.length,
    distance_m: segments.reduce((a, b) => a + b, 0),
    direct_distance_m: distance(points[0], points.at(-1)!),
    segment_distances_m: segments,
    bounds: bounds(points),
  };
}
export function simplify(raw: unknown) {
  const { points, tolerance_m } = inputSchema.parse(raw),
    keep = new Set([0, points.length - 1]),
    stack = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    let furthest = -1,
      max = -1;
    for (let i = a + 1; i < b; i++) {
      const d = arcDistance(points[i], points[a], points[b]);
      if (d > max) {
        max = d;
        furthest = i;
      }
    }
    if (max > tolerance_m && furthest >= 0) {
      keep.add(furthest);
      stack.push([a, furthest], [furthest, b]);
    }
  }
  const indices = [...keep].sort((a, b) => a - b),
    result = indices.map((i) => points[i]);
  let deviation = 0;
  // Report deviation within each original index interval, not a different crossing segment.
  for (let k = 0; k < indices.length - 1; k++)
    for (let i = indices[k]; i <= indices[k + 1]; i++)
      deviation = Math.max(
        deviation,
        arcDistance(points[i], result[k], result[k + 1]),
      );
  return {
    model: "sphere",
    tolerance_m,
    original_count: points.length,
    retained_count: result.length,
    indices,
    points: result,
    max_deviation_m: deviation,
    original_distance_m: analyze({ points }).distance_m,
    simplified_distance_m: analyze({ points: result }).distance_m,
  };
}
