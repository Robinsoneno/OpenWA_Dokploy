const { create } = require('@open-wa/wa-automate');

create({
  sessionId: "teste",
  engine: "baileys",
  multiDevice: true,
  qrTimeout: 0,
  authTimeout: 300,
  logConsole: true,
  debug: true
}).then(client => {
  console.log("OpenWA iniciado isolado!");
});
