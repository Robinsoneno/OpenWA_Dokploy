const { create } = require('@open-wa/wa-automate');
const fs = require('fs');
const path = require('path');

// Função para ler configuração mesclando com defaults
function getConfig() {
  const defaultConfig = {
    sessionId: "teste",
    engine: "baileys",
    multiDevice: true,
    qrTimeout: 0,
    authTimeout: 300,
    logConsole: true,
    debug: true,
    // Habilita API REST e Dashboard (opcional, ajuste conforme necessidade)
    restApi: false,
    dashboard: false,
    restApiPort: 3001,
    dashboardPort: 3002
  };

  try {
    const configPath = path.join(__dirname, 'openwa.config.json');
    if (fs.existsSync(configPath)) {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      console.log('Configuração carregada do arquivo.');
      return { ...defaultConfig, ...fileConfig };
    } else {
      console.log('Arquivo de configuração não encontrado, usando defaults.');
      return defaultConfig;
    }
  } catch (err) {
    console.error('Erro ao ler arquivo de configuração, usando defaults.', err);
    return defaultConfig;
  }
}

// Função para iniciar o cliente com tentativas de reconexão
async function startClient() {
  const config = getConfig();
  console.log('Iniciando OpenWA com configuração:', config);

  try {
    const client = await create(config);
    console.log('OpenWA iniciado com sucesso!');

    // Aqui você pode adicionar handlers para eventos do cliente
    client.onStateChanged((state) => {
      console.log('Estado do cliente:', state);
      if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
        console.log('Reiniciando cliente devido a estado crítico...');
        client.forceRefocus();
      }
    });

    // Exemplo de evento de mensagem
    client.onMessage((message) => {
      console.log('Mensagem recebida:', message.body);
    });

    // Mantém o processo ativo
    // O cliente já mantém conexão, mas podemos adicionar um keep-alive
    setInterval(() => {
      // Apenas para manter o evento loop ativo (opcional)
    }, 60000);

    return client;
  } catch (err) {
    console.error('Falha ao iniciar OpenWA:', err);
    // Tenta novamente após 10 segundos
    console.log('Tentando reiniciar em 10 segundos...');
    setTimeout(startClient, 10000);
  }
}

// Inicia o cliente
startClient();
