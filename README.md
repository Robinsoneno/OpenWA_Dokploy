# OpenWA_Dokploy

Este projeto executa o [Open-WA/wa-automate](https://github.com/open-wa/wa-automate) em um contêiner Docker para uso com Dokploy.

## Pré-requisitos
- Docker e Docker Compose instalados.
- Node.js (para desenvolvimento local, opcional).

## Configuração
1. Clone o repositório.
2. Ajuste o arquivo `openwa.config.json` conforme necessário (veja opções abaixo).
3. Execute `docker-compose up -d` para iniciar o serviço.

## Opções de configuração (openwa.config.json)
- `sessionId`: Nome da sessão (usado para salvar credenciais).
- `engine`: Motor (baileys é o recomendado).
- `multiDevice`: Ativar suporte multi-dispositivo.
- `qrTimeout`: Tempo para expiração do QR (0 = infinito).
- `authTimeout`: Tempo de autenticação em segundos.
- `logConsole`: Log no console.
- `debug`: Modo debug.
- `restApi`: Ativar API REST (porta 3001).
- `dashboard`: Ativar Dashboard Web (porta 3002).

## Volumes
- `./sessions`: Armazena credenciais da sessão.
- `./media`: Arquivos de mídia recebidos/enviados.

## Portas
- `8001`: API REST (se ativada).
- `8002`: Dashboard Web (se ativada).

## Observações
- O Chromium é instalado no sistema e usado em modo headless.
- O contêiner roda com um usuário não-root para segurança.
- Reinício automático configurado (`restart: unless-stopped`).

## Troubleshooting
- Se o QR Code não aparecer, verifique os logs: `docker logs openwa-test`.
- Certifique-se de que os volumes `sessions` e `media` têm permissões de escrita para o usuário `openwa` (UID 1000 por padrão, ajuste se necessário).
