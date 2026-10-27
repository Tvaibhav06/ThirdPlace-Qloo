// lib/providers/llm.ts
// Provider-agnostic LLM client adapter with strict Zod structured completion and graceful fallback.

import { z } from 'zod';

export class LlmClient {
  private apiKey: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.LLM_API_KEY || '';
    this.model = process.env.LLM_MODEL || 'gpt-4o-mini';
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey);
  }

  public async complete(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('LLM_API_KEY not configured');
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 300
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      throw new Error(`LLM provider returned HTTP ${res.status}`);
    }

    const json = await res.json();
    return json.choices?.[0]?.message?.content?.trim() || '';
  }

  public async completeStructured<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    const raw = await this.complete(
      `${prompt}\n\nRespond with strict valid JSON only, adhering to the requested schema. Do not include markdown codeblocks.`
    );
    const cleaned = raw.replace(/^```json/i, '').replace(/```$/i, '').trim();
    const parsedJson = JSON.parse(cleaned);
    return schema.parse(parsedJson);
  }
}
