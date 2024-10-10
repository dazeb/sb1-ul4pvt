import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const WEBHOOK_HOST = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NGROK_HOST;

export async function POST(request: Request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json({ error: 'REPLICATE_API_TOKEN is not set' }, { status: 500 });
  }

  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const options: any = {
      version: "73332c51fc3b62a3903b5fb22712994ffed1b7f928545d7787ba24f2439e06e1",
      input: {
        image,
        prompt: "Transform this person into a terrifying zombie for Halloween.",
        negative_prompt: "living, healthy skin, bright colors, happiness, cleanliness",
        num_outputs: 1,
        guidance_scale: 7.5,
        num_inference_steps: 50,
        scheduler: "K_EULER",
      }
    }

    if (WEBHOOK_HOST) {
      options.webhook = `${WEBHOOK_HOST}/api/webhooks`
      options.webhook_events_filter = ["start", "completed"]
    }

    const prediction = await replicate.predictions.create(options);

    if (prediction?.error) {
      return NextResponse.json({ error: prediction.error }, { status: 500 });
    }

    return NextResponse.json(prediction, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/predictions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}