const { create } = require('@open-wa/wa-automate');
const fs = require('fs');

let config = {
  sessionId: "teste",
  engine: "baileys",
  multiDevice: true,
  qrTimeout: 0,
  authTimeout: 300,
  logConsole: true,
  debug: true,
  restApi: true,
  dashboard: true,
  restApiPort: 8001,
  dashboardPort: 8002,
  puppeteerOptions: {
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--headless',
      '--no-crashpad'
    ]
  }
};

try {
  const fileConfig = JSON.parse(fs.readFileSync('./openwa.config.json', 'utf8'));
  config = { ...config, ...fileConfig };
  console.log('✅ Configuração carregada de openwa.config.json');
} catch (e) {
  console.log('ℹ️ Usando configuração padrão.');
}

create(config)
  .then(client => {
    console.log("✅ OpenWA iniciado com sucesso!");
    client.onStateChanged((state) => {
      console.log('📌 Estado do cliente:', state);
    });
  })
  .catch(err => {
    console.error("❌ Falha ao iniciar OpenWA:", err);
    process.exit(1);
  });
