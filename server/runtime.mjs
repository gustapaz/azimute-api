import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.ts";
import { readJson, InputError, secure, problem } from "./transport.mjs";
import { meta } from "./meta.mjs";
export async function handle(request) {
  const id = crypto.randomUUID();
  try {
    const url = new URL(request.url),
      path = url.pathname,
      origin = request.headers.get("origin");
    if (origin && origin !== url.origin)
      throw new InputError("origin_denied", "Origem não autorizada.", 403);
    if (request.method === "GET" && path === "/api/health") {
      const probe = await appRouter.createCaller({}).analyze({
        points: [
          [0, 0],
          [0, 0],
        ],
        tolerance_m: 0,
      });
      if (probe.distance_m !== 0) throw new Error("Engine health failed");
      return secure(
        Response.json({
          status: "ok",
          engine: "trpc-zod",
          storage: "none",
          engine_check: true,
        }),
        id,
      );
    }
    if (request.method === "GET" && path === "/api/v1/examples")
      return secure(Response.json({ items: meta.examples }), id);
    if (!["/api/trpc/analyze", "/api/trpc/simplify"].includes(path))
      throw new InputError("not_found", "Endpoint não encontrado.", 404);
    if (request.method !== "POST")
      throw new InputError(
        "method_not_allowed",
        "Use POST; batching não está habilitado.",
        405,
      );
    if (url.search)
      throw new InputError(
        "invalid_query",
        "Parâmetros de URL não são aceitos.",
        400,
      );
    const body = await readJson(request);
    const req = new Request(request.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    return secure(
      await fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: () => ({}),
      }),
      id,
    );
  } catch (e) {
    return secure(problem(e, id), id);
  }
}
