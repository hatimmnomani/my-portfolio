const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
const DEFAULT_TO_EMAIL = 'hatimn219@gmail.com';
const DEFAULT_FROM_EMAIL = 'Hatim Nomani <onboarding@resend.dev>';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sendJson(res, statusCode, payload) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  if (typeof res.setHeader === 'function') {
    res.setHeader('Content-Type', 'application/json');
  }
  return res.end(JSON.stringify(payload));
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'object') return req.body;

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}

function clean(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildEmail({ name, company, email, roleType, message }) {
  const submittedAt = new Date().toISOString();
  const safeName = escapeHtml(name);
  const rows = [
    ['Name', name],
    ['Company', company || 'Not provided'],
    ['Email', email],
    ['Enquiry type', roleType || 'Not selected'],
    ['Submitted at', submittedAt],
  ];

  const text = [
    'New enquiry from hatim.digitaltakeoff.in',
    '',
    `Name: ${name}`,
    `Company: ${company || 'Not provided'}`,
    `Email: ${email}`,
    `Enquiry type: ${roleType || 'Not selected'}`,
    `Submitted at: ${submittedAt}`,
    '',
    'Details:',
    message || 'Not provided',
  ].join('\n');

  const htmlRows = rows
    .map(([label, value]) => `
      <tr>
        <td style="padding:8px 12px;border:1px solid #e8e8e8;font-weight:700;">${escapeHtml(label)}</td>
        <td style="padding:8px 12px;border:1px solid #e8e8e8;">${escapeHtml(value)}</td>
      </tr>
    `)
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;color:#211f1f;line-height:1.5;">
      <h2 style="margin:0 0 16px;">New enquiry</h2>
      <p style="margin:0 0 18px;">${safeName} submitted the form on hatim.digitaltakeoff.in.</p>
      <table style="border-collapse:collapse;width:100%;max-width:640px;">${htmlRows}</table>
      <h3 style="margin:22px 0 8px;">Details</h3>
      <p style="white-space:pre-wrap;margin:0;">${escapeHtml(message || 'Not provided')}</p>
    </div>
  `;

  return { html, text };
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Allow', 'POST');
    }
    return sendJson(res, 405, { ok: false, message: 'Method not allowed.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return sendJson(res, 500, {
      ok: false,
      message: 'Email service is not configured.',
    });
  }

  const body = parseBody(req);
  const website = clean(body.website, 200);

  // Honeypot: pretend success, send nothing.
  if (website) {
    return sendJson(res, 200, { ok: true });
  }

  const name = clean(body.name, 120);
  const company = clean(body.company, 160);
  const email = clean(body.email, 180).toLowerCase();
  const roleType = clean(body.role_type, 120);
  const message = clean(body.message, 3000);

  if (!name || !email || !EMAIL_PATTERN.test(email) || !message) {
    return sendJson(res, 400, {
      ok: false,
      message: 'Please provide a valid name, email address and message.',
    });
  }

  const to = process.env.CONTACT_TO_EMAIL || DEFAULT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const { html, text } = buildEmail({ name, company, email, roleType, message });

  const response = await fetch(RESEND_EMAILS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `${roleType || 'Enquiry'} - ${name}`,
      html,
      text,
    }),
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error('Resend email failed', response.status, result);
    return sendJson(res, 502, {
      ok: false,
      message: 'Message could not be sent right now. Please email hatimn219@gmail.com directly.',
      details: process.env.NODE_ENV === 'production' ? undefined : result,
    });
  }

  return sendJson(res, 200, { ok: true, id: result.id });
};
