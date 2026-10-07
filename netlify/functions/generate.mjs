export default async function(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await req.json();

    const apiKey = Netlify.env.get('ANTHROPIC_API_KEY');
    const baseUrl = Netlify.env.get('ANTHROPIC_BASE_URL');

    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    if (!baseUrl) {
      return Response.json({ error: 'AI gateway not configured' }, { status: 500 });
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: body.max_tokens || 2000,
        messages: body.messages,
      }),
    });

    const data = await response.json();

    return Response.json(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
