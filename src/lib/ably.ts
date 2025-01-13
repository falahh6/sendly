import { Realtime, Rest } from "ably";

let ably: Realtime | null = null;

export function getAblyInstance(): Realtime {
  if (!ably) {
    ably = new Realtime({
      key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
      clientId: "nextjs-app", // Unique identifier for the client
      authUrl: `/api/ably`,
    });
  }
  return ably;
}

export const ablyServer = new Rest(process.env.NEXT_PUBLIC_ABLY_API_KEY!);

export const ablyClient = (channelName: string) => {
  return new Realtime(process.env.NEXT_PUBLIC_ABLY_API_KEY!).channels.get(
    channelName
  );
};
