// ═══════════════════════════════════════════════════════════════
// Stride Connect — Email Send Function
// Netlify Function that proxies bulk email sends to Resend.
// Keeps RESEND_API_KEY server-side; never exposed to the browser.
// ═══════════════════════════════════════════════════════════════

const RESEND_API = 'https://api.resend.com/emails';

exports.handler = async function (event) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers: cors,
      body: JSON.stringify({
        error: 'Resend not configured',
        hint: 'Add RESEND_API_KEY in Netlify → Site Settings → Environment Variables, then trigger a redeploy.',
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { from, messages } = payload;
  if (!from || !Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers: cors, body: JSON.stringify({ error: 'from and messages[] are required' }) };
  }

  const sendIds = [];
  const errors = [];

  // Send each message — Resend supports batch via /emails/batch but we keep it simple
  // for v1 with personalized per-recipient bodies. For large lists, swap to batch.
  for (const msg of messages) {
    if (!msg.to || !msg.subject) {
      errors.push({ to: msg.to, error: 'Missing to or subject' });
      continue;
    }
    try {
      const res = await fetch(RESEND_API, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: msg.toName ? `${msg.toName} <${msg.to}>` : msg.to,
          subject: msg.subject,
          html: msg.html || msg.text || '',
          text: msg.text || undefined,
          tags: [
            { name: 'app', value: 'stride-connect' },
            ...(msg.memberId ? [{ name: 'member_id', value: String(msg.memberId) }] : []),
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        errors.push({ to: msg.to, error: data.message || data.name || 'Send failed' });
      } else {
        sendIds.push({ to: msg.to, memberId: msg.memberId, resendId: data.id });
      }
    } catch (err) {
      errors.push({ to: msg.to, error: err.message });
    }
  }

  // Surface a top-level error string when all sends failed, so the client
  // shows something useful (e.g., the actual Resend rejection reason)
  const allFailed = errors.length === messages.length;
  const topLevelError = allFailed && errors[0] ? errors[0].error : undefined;

  return {
    statusCode: allFailed ? 502 : 200,
    headers: cors,
    body: JSON.stringify({
      provider: 'resend',
      sentCount: sendIds.length,
      failedCount: errors.length,
      sendIds,
      error: topLevelError,
      errors: errors.length > 0 ? errors : undefined,
    }),
  };
};
