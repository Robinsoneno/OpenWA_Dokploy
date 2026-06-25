require('dotenv').config();
const app = require('./api');
const { connectToWhatsApp } = require('./whatsapp');

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API rodando em http://0.0.0.0:${PORT}`);
  console.log(`📋 Endpoints disponíveis:
    GET  /health
    GET  /status
    GET  /qr
    POST /send/text     { number, message }
    POST /send/image    { number, url, caption }
    POST /send/document { number, url, filename, mimetype }`);
});

connectToWhatsApp(() => {
  console.log('📡 WhatsApp pronto para receber comandos via API.');
});
