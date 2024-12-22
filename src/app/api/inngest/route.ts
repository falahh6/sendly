import { inngest } from "@/inngest/client";
import { importEmailsFunction } from "@/inngest/functions/importEmailsFunction";
import { serve } from "inngest/next";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [importEmailsFunction],
});
