import { AIEventPlan, EventData } from '../types/event';

export interface HealthResponse {
  status: string;
  hasGeminiKey: boolean;
  model: string;
}

export interface GeneratePlanResponse {
  plan: AIEventPlan;
  source: 'live_gemini' | 'demo_mode';
  message?: string;
}

export interface GenerateIdeasResponse {
  source: 'live_gemini' | 'demo_mode';
  ideas: Array<{
    title: string;
    category: string;
    description: string;
    costLevel: string;
    executionTip: string;
  }>;
}

export interface AskAdviceResponse {
  source: 'live_gemini' | 'demo_mode';
  answer: string;
}

export async function checkServerHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      hasGeminiKey: false,
      model: 'demo-mode',
    };
  }
}

export async function generateEventPlan(event: Partial<EventData>): Promise<GeneratePlanResponse> {
  const res = await fetch('/api/generate-plan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to generate event plan');
  }

  return await res.json();
}

export async function generateCreativeIdeas(payload: {
  eventType: string;
  vibePreference?: string;
  topic?: string;
  budget?: number;
  guestCount?: number;
}): Promise<GenerateIdeasResponse> {
  const res = await fetch('/api/generate-ideas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to generate creative ideas');
  }

  return await res.json();
}

export async function askEventAdvice(payload: {
  question: string;
  eventSummary?: Partial<EventData>;
}): Promise<AskAdviceResponse> {
  const res = await fetch('/api/ask-advice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to get event planner advice');
  }

  return await res.json();
}

export async function aiAllocateBudget(payload: {
  eventType: string;
  totalBudget: number;
  currency?: string;
  guestCount?: number;
  location?: string;
  vibePreference?: string;
}): Promise<{ source: 'live_gemini' | 'demo_mode'; categories: any[] | null; message?: string }> {
  const res = await fetch('/api/ai-allocate-budget', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to auto-allocate budget');
  }

  return await res.json();
}

export async function aiGenerateTimeline(payload: {
  eventType: string;
  eventDate: string;
  name: string;
  guestCount: number;
}): Promise<{ source: 'live_gemini' | 'demo_mode'; milestones: any[] | null; message?: string }> {
  const res = await fetch('/api/ai-generate-timeline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Failed to generate AI timeline');
  }

  return await res.json();
}

