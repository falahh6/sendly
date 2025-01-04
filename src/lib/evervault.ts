import Evervault from "@evervault/sdk";

export const evervault = new Evervault(
  process.env.EVERVAULT_APP_ID!,
  process.env.EVERVAULT_API_KEY!
);
