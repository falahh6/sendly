import { cohereExamples } from "@/lib/emails/data";
import { CohereClientV2 } from "cohere-ai";
import { NextRequest, NextResponse } from "next/server";

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

export const POST = async (req: NextRequest) => {
  const { inputs } = await req.json();

  const response = await cohere.classify({
    model: "",
    examples: cohereExamples,
    inputs: inputs.map((input: { text: string; id: string }) => input.text),
  });

  if (response.id) {
    return NextResponse.json({
      status: 200,
      data: response.classifications.map((c) => {
        return {
          input: inputs.find(
            (i: { text: string; id: string }) => i.text === c.input
          ).text,
          prediction: c.prediction,
          id: inputs.find(
            (i: { text: string; id: string }) => i.text === c.input
          )?.id,
        };
      }),
    });
  } else {
    return NextResponse.json({ status: 400, error: response });
  }
};
