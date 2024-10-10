import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(req: NextRequest) {
  try {
    const { imageUrl, modelVersion } = await req.json();
    const output = await replicate.run(
      modelVersion,
      { 
        input: { 
          image: imageUrl,
          // Add any other inputs your model requires
        }
      }
    );
    return NextResponse.json(output);
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json({ error: 'Error processing image' }, { status: 500 });
  }
}