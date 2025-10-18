// Example Netlify function: accept POST and send email via SendGrid
// Deploy this to Netlify Functions (netlify/functions/send-contact.js)

const fetch = require('node-fetch'); // Netlify includes fetch in newer runtimes; keep for clarity

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body || '{}');
    const { name, email, company, phone, message } = data;

    if (!name || !email || !message) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    if (!SENDGRID_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'SendGrid API key is not configured' }) };
    }

    const sgUrl = 'https://api.sendgrid.com/v3/mail/send';
    const toEmail = 'Curafehealth@gmail.com';
    const subject = `Website contact from ${name}`;

    const textLines = [];
    textLines.push(`Name: ${name}`);
    textLines.push(`Email: ${email}`);
    if (company) textLines.push(`Company: ${company}`);
    if (phone) textLines.push(`Phone: ${phone}`);
    textLines.push('');
    textLines.push('Message:');
    textLines.push(message);

    const body = {
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: 'no-reply@yourdomain.com', name: 'CuraFe Health Website' },
      subject: subject,
      content: [
        { type: 'text/plain', value: textLines.join('\n') },
        { type: 'text/html', value: `<pre>${textLines.map(line => escapeHtml(line)).join('<br/>')}</pre>` }
      ]
    };

    const res = await fetch(sgUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SENDGRID_API_KEY}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const text = await res.text();
      return { statusCode: res.status || 500, body: JSON.stringify({ error: text }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
