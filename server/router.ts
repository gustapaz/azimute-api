import { initTRPC } from "@trpc/server";
import { inputSchema, analyze, simplify } from "./core.ts";
const t = initTRPC.create({ isDev: false });
export const appRouter = t.router({
  analyze: t.procedure
    .input(inputSchema)
    .mutation(({ input }) => analyze(input)),
  simplify: t.procedure
    .input(inputSchema)
    .mutation(({ input }) => simplify(input)),
});
export type AppRouter = typeof appRouter;
