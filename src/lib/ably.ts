import { Realtime } from "ably";

let ably: Realtime | null = null;

export function getAblyInstance(): Realtime {
  if (!ably) {
    ably = new Realtime({
      key: process.env.ABLY_API_KEY,
      clientId: "nextjs-app", // Unique identifier for the client
      authUrl: `/api/ably`,
    });
  }
  return ably;
}
