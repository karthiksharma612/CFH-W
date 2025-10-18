Serverless contact form - instructions

This folder contains a small example of a serverless function you can deploy to accept contact form POSTs from the website and forward them as email using an email provider (e.g., SendGrid).

Options
- Formspree (no backend): create a free Formspree form and set CONTACT_ENDPOINT in `main.js` to the Formspree URL (https://formspree.io/f/{id}). Formspree will accept the POST from the browser and deliver it to your email.

- Netlify Functions / Vercel / AWS Lambda: deploy a small function that accepts JSON { name, email, company, phone, message } and sends an email via SendGrid, SES, or similar.

Example (Netlify)
1. Copy `send-contact-netlify.js` to your Netlify functions folder (e.g. `netlify/functions/send-contact.js`).
2. Set environment variable SENDGRID_API_KEY in Netlify with your SendGrid key.
3. Configure `CONTACT_ENDPOINT` in `main.js` to the Netlify function URL, e.g. `https://your-site.netlify.app/.netlify/functions/send-contact`.

Security
- Never embed API keys in client-side JavaScript. Use environment variables on the serverless provider.
- Implement spam protection: add a simple honeypot field or integrate reCAPTCHA if needed.

Notes
- The example below uses SendGrid's API as an illustration. You can adapt it to other providers by changing the send logic.
