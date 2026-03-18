import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { cache } from "react";
import { getDb } from "./db/drizzle";

export const getAuth = cache(() =>
  betterAuth({
    database: drizzleAdapter(getDb(), {
      provider: "sqlite",
    }),
    emailAndPassword: {
      enabled: true,
    },
  })
);