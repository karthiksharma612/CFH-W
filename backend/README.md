CuraFe Backend

This folder contains a small Express backend that:
- stores contact form submissions in a local SQLite database
- sends an email via SMTP (using Nodemailer) when a submission is received

Quick start
1. Copy `.env.example` to `.env` and fill in SMTP credentials and settings.
2. Install dependencies:

   npm install

3. Run the server:

   npm start

Endpoints
- POST /api/contact
  - body: { name, email, company?, phone?, message }
  - stores the submission and attempts to send an email to TO_EMAIL configured in .env

Notes
- This is a minimal example for small projects. For production use, secure the endpoint, add rate-limiting, validation, and spam protection.

Client integration
- In the website's `main.js` set `CONTACT_ENDPOINT` to your deployed backend's contact URL, for example:

   const CONTACT_ENDPOINT = 'https://your-domain.com/api/contact';

- The backend enables CORS so the browser can POST directly. For production, consider adding authentication or a CAPTCHA to prevent abuse.
