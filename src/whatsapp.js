const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcodeTerminal = require('qrcode-terminal');

let sock = null;
let qrCodeData = null;
let connectionStatus = 'disconnected';
let onReadyCallback = null;

async function connectToWhatsApp(onReady) {
  if (onReady) onReadyCallback = onReady;

  const { state, saveCreds } = await useMultiFileAuthState('./sessions');
  const { version } = await fetchLatestBaileysVersion();

  console.log(`📦 Versão WA detectada: ${version.join('.')}`);

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Chrome (Linux)', 'Chrome', '120.0.0'],
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeData = qr;
      connectionStatus = 'qr_ready';
      console.log('\n📱 QR Code gerado! Acesse GET /qr no navegador para escanear.\n');
      qrcodeTerminal.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;
      connectionStatus = 'disconnected';
      qrCodeData = null;

      console.log(`⚠️  Conexão encerrada. Motivo: ${reason}. Reconectando: ${shouldReconnect}`);

      if (shouldReconnect) {
        setTimeout(() => connectToWhatsApp(), 3000);
      } else {
        console.log('🔴 Sessão encerrada (logout). Remova a pasta ./sessions e reinicie.');
      }
    }

    if (connection === 'open') {
      connectionStatus = 'connected';
      qrCodeData = null;
      console.log('✅ WhatsApp conectado com sucesso!');
      if (onReadyCallback) onReadyCallback(sock);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  return sock;
}

function getSocket() {
  return sock;
}

function getQR() {
  return qrCodeData;
}

function getStatus() {
  return connectionStatus;
}

module.exports = { connectToWhatsApp, getSocket, getQR, getStatus };
