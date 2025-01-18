import { Realtime, RealtimeChannel, Rest } from "ably";
import { toast } from "sonner";

let ably: Realtime | null = null;

export function getAblyInstance(): Realtime {
  if (!ably) {
    ably = new Realtime({
      key: process.env.NEXT_PUBLIC_ABLY_API_KEY,
    });
  }
  return ably;
}

export const ablyServer = new Rest(process.env.NEXT_PUBLIC_ABLY_API_KEY!);

const channelCache: { [key: string]: RealtimeChannel } = {};

export const ablyClient = (channelName: string, fr?: string) => {
  if (!channelCache[channelName]) {
    const ably = new Realtime(process.env.NEXT_PUBLIC_ABLY_API_KEY!);
    const channel = ably.channels.get(channelName);
    channelCache[channelName] = channel;
  }

  return channelCache[channelName];
};
