import { getAuth } from "@/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";

export const GET = (req: Request) => toNextJsHandler(getAuth()).GET(req);
export const POST = async (req: Request) => {
  try {
    return await toNextJsHandler(getAuth()).POST(req);
  } catch (e) {
    console.error("[auth] POST error:", e);
    throw e;
  }
};