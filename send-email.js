const nodemailer = require('nodemailer');

/* ============================================================
   Variables de entorno en Vercel:
   GMAIL_USER     → gestion@stpeters.cl
   GMAIL_PASS     → App Password de 16 caracteres (sin espacios)
   ============================================================ */

module.exports = async function handler(req, res) {
  /* CORS — permite llamadas desde GitHub Pages */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { to, subject, html } = req.body || {};
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Faltan campos: to, subject, html' });
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  if (!user || !pass) {
    return res.status(500).json({ error: 'Variables de entorno GMAIL_USER y GMAIL_PASS no configuradas en Vercel' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });

    const recipients = Array.isArray(to) ? to : [to];
    const results = [];

    for (const recipient of recipients) {
      const info = await transporter.sendMail({
        from: `"Saint Peter's School" <${user}>`,
        to: recipient,
        subject,
        html
      });
      results.push({ to: recipient, messageId: info.messageId });
    }

    return res.status(200).json({ ok: true, sent: results.length, results });
  } catch (err) {
    console.error('Error al enviar:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
