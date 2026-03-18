import { getAuth } from "@/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";

export const GET = (req: Request) => toNextJsHandler(getAuth()).GET(req);
export const POST = async (req: Request) => {
  const res = await toNextJsHandler(getAuth()).POST(req);
  if (res.status >= 500) {
    console.error("[auth] POST 500 body:", await res.clone().text());
  }
  return res;
};