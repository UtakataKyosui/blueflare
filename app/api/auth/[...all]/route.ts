import { getAuth } from "@/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const dynamic = "force-dynamic";

export const GET = (req: Request) => toNextJsHandler(getAuth()).GET(req);
export const POST = async (req: Request) => {
  try {
    const auth = getAuth();
    console.log("[auth] init ok");
    const res = await toNextJsHandler(auth).POST(req);
    if (res.status >= 500) {
      console.error("[auth] POST 500 body:", await res.clone().text());
    }
    return res;
  } catch (e) {
    console.error("[auth] threw:", e);
    return new Response(JSON.stringify({ message: String(e) }), { status: 500 });
  }
};