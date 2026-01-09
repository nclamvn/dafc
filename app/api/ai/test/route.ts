import { NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function GET() {
  try {
    // Check if API key is configured
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        status: 'error',
        message: 'OPENAI_API_KEY is not configured',
        hasKey: false,
      }, { status: 500 });
    }

    // Try a simple completion
    const startTime = Date.now();

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: 'Say "AI is working!" in exactly 3 words.',
    });

    const latency = Date.now() - startTime;

    return NextResponse.json({
      status: 'success',
      message: 'AI is working',
      response: text,
      latencyMs: latency,
      hasKey: true,
      keyPrefix: apiKey.substring(0, 10) + '...',
    });

  } catch (error) {
    console.error('AI Test Error:', error);

    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      hasKey: !!process.env.OPENAI_API_KEY,
    }, { status: 500 });
  }
}
