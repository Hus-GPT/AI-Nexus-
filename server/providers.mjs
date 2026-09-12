const DEFAULT_MODELS = {
  google_gemini: [
    { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', providerId: 'google_gemini' },
    { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', providerId: 'google_gemini' },
  ],
  openai: [
    { id: 'gpt-5', name: 'GPT-5', providerId: 'openai' },
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', providerId: 'openai' },
  ],
  anthropic: [
    { id: 'claude-sonnet-4', name: 'Claude Sonnet', providerId: 'anthropic' },
  ],
  openai_compatible: [
    { id: 'custom-model', name: 'Custom OpenAI-Compatible Model', providerId: 'openai_compatible' },
  ],
};

export function catalogModels() {
  return Object.values(DEFAULT_MODELS).flat();
}

function openAIRequest(baseUrl, apiKey, model, messages, options = {}) {
  return fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, messages, temperature: options.temperature ?? 0.7, max_tokens: options.maxTokens }),
  });
}

async function parseOpenAIResponse(response) {
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || `Provider returned HTTP ${response.status}`);
  return {
    content: body?.choices?.[0]?.message?.content || '',
    usage: body?.usage,
  };
}

async function gemini(model, apiKey, messages, options = {}) {
  const contents = messages.filter((m) => m.role !== 'system').map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));
  const system = messages.find((m) => m.role === 'system');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      contents,
      ...(system ? { systemInstruction: { parts: [{ text: system.content }] } } : {}),
      generationConfig: { temperature: options.temperature ?? 0.7, maxOutputTokens: options.maxTokens ?? 4096 },
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || `Gemini returned HTTP ${response.status}`);
  return {
    content: body?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '',
    usage: body?.usageMetadata,
  };
}

async function anthropic(model, apiKey, messages, options = {}) {
  const system = messages.find((m) => m.role === 'system')?.content;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: options.maxTokens ?? 4096,
      ...(system ? { system } : {}),
      messages: messages.filter((m) => m.role !== 'system'),
    }),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || `Anthropic returned HTTP ${response.status}`);
  return { content: body?.content?.map((p) => p.text || '').join('') || '', usage: body?.usage };
}

export async function complete({ providerId, model, apiKey, baseUrl, messages, options }) {
  const started = Date.now();
  let result;
  if (providerId === 'google_gemini') result = await gemini(model, apiKey, messages, options);
  else if (providerId === 'anthropic') result = await anthropic(model, apiKey, messages, options);
  else if (providerId === 'openai') result = await parseOpenAIResponse(await openAIRequest(baseUrl || 'https://api.openai.com/v1', apiKey, model, messages, options));
  else if (providerId === 'openai_compatible') {
    if (!baseUrl) throw new Error('An OpenAI-compatible base URL is required.');
    result = await parseOpenAIResponse(await openAIRequest(baseUrl, apiKey, model, messages, options));
  } else throw new Error(`Unsupported provider: ${providerId}`);
  return { ...result, modelId: model, providerId, latencyMs: Date.now() - started };
}
