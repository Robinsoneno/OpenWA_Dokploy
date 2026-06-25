const express = require('express');
const qrcode = require('qrcode');
const { getSocket, getQR, getStatus } = require('./whatsapp');

const app = express();
app.use(express.json());

// ─── Health check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', whatsapp: getStatus(), timestamp: new Date().toISOString() });
});

// ─── Status da conexão ───────────────────────────────────────
app.get('/status', (req, res) => {
  res.json({ status: getStatus() });
});

// ─── QR Code como imagem PNG ─────────────────────────────────
app.get('/qr', async (req, res) => {
  const qr = getQR();

  if (!qr) {
    const status = getStatus();
    if (status === 'connected') {
      return res.status(200).json({ message: 'Já conectado. QR não necessário.' });
    }
    return res.status(404).json({ error: 'QR Code ainda não disponível. Aguarde alguns segundos e tente novamente.' });
  }

  try {
    const img = await qrcode.toBuffer(qr, { type: 'png', width: 400 });
    res.setHeader('Content-Type', 'image/png');
    res.send(img);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao gerar imagem do QR Code.' });
  }
});

// ─── Enviar mensagem de texto ────────────────────────────────
app.post('/send/text', async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: 'Campos "number" e "message" são obrigatórios.' });
  }

  const sock = getSocket();
  if (!sock || getStatus() !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp não está conectado.' });
  }

  try {
    const jid = formatJID(number);
    await sock.sendMessage(jid, { text: message });
    res.json({ success: true, to: jid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Enviar imagem via URL ───────────────────────────────────
app.post('/send/image', async (req, res) => {
  const { number, url, caption } = req.body;

  if (!number || !url) {
    return res.status(400).json({ error: 'Campos "number" e "url" são obrigatórios.' });
  }

  const sock = getSocket();
  if (!sock || getStatus() !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp não está conectado.' });
  }

  try {
    const jid = formatJID(number);
    await sock.sendMessage(jid, { image: { url }, caption: caption || '' });
    res.json({ success: true, to: jid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Enviar documento via URL ────────────────────────────────
app.post('/send/document', async (req, res) => {
  const { number, url, filename, mimetype } = req.body;

  if (!number || !url || !filename) {
    return res.status(400).json({ error: 'Campos "number", "url" e "filename" são obrigatórios.' });
  }

  const sock = getSocket();
  if (!sock || getStatus() !== 'connected') {
    return res.status(503).json({ error: 'WhatsApp não está conectado.' });
  }

  try {
    const jid = formatJID(number);
    await sock.sendMessage(jid, {
      document: { url },
      fileName: filename,
      mimetype: mimetype || 'application/octet-stream',
    });
    res.json({ success: true, to: jid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Utilitário ──────────────────────────────────────────────
function formatJID(number) {
  if (number.includes('@')) return number;
  const clean = number.replace(/\D/g, '');
  return `${clean}@s.whatsapp.net`;
}

module.exports = app;
