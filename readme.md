# YT-DLP GUI

Uma interface gráfica moderna e intuitiva para o yt-dlp, construída com Electron e Tailwind CSS.

![YT-DLP GUI Screenshot](https://via.placeholder.com/800x500/3b82f6/ffffff?text=YT-DLP+GUI)

## ✨ Características

- **Interface moderna e responsiva** com Tailwind CSS
- **Análise automática de vídeos** com preview de thumbnail
- **Múltiplos formatos de download** (vídeo e áudio)
- **Download apenas de áudio** com vários formatos suportados
- **Download de legendas** automáticas e manuais
- **Monitoramento em tempo real** do progresso de download
- **Downloads simultâneos** com gerenciamento individual
- **Seleção de pasta de destino** personalizada
- **Interface multiplataforma** (Windows, macOS, Linux)

## 🚀 Pré-requisitos

Antes de usar esta aplicação, você precisa ter instalado:

### 1. yt-dlp

```bash
# Windows (usando pip)
pip install yt-dlp

# Windows (usando winget)
winget install yt-dlp

# macOS (usando brew)
brew install yt-dlp

# Linux (usando pip)
pip install yt-dlp

# Ou baixe diretamente do GitHub
# https://github.com/yt-dlp/yt-dlp/releases
```

### 2. Node.js

Baixe e instale o Node.js em: https://nodejs.org/

### 3. FFmpeg (recomendado para melhor compatibilidade)

```bash
# Windows (usando winget)
winget install FFmpeg

# macOS (usando brew)
brew install ffmpeg

# Linux (Ubuntu/Debian)
sudo apt install ffmpeg
```

## 📦 Instalação

1. **Clone o repositório:**

```bash
git clone https://github.com/seuusuario/yt-dlp-gui.git
cd yt-dlp-gui
```

2. **Instale as dependências:**

```bash
npm install
```

3. **Execute a aplicação:**

```bash
npm start
```

## 🔧 Scripts Disponíveis

```bash
# Executar em modo desenvolvimento
npm run dev

# Executar a aplicação
npm start

# Construir para todas as plataformas
npm run build

# Construir apenas para Windows
npm run build-win

# Construir apenas para macOS
npm run build-mac

# Construir apenas para Linux
npm run build-linux
```

## 📱 Como Usar

### 1. Análise de Vídeo

- Cole a URL do vídeo no campo de entrada
- Clique em "Analisar" ou pressione Enter
- Aguarde as informações do vídeo aparecerem

### 2. Configuração de Download

- **Pasta de Destino**: Clique em "Selecionar" para escolher onde salvar
- **Formato**: Escolha a qualidade/formato desejado
- **Apenas Áudio**: Marque para baixar só o áudio
- **Legendas**: Marque para incluir legendas (especifique idiomas se necessário)

### 3. Download

- Clique em "Iniciar Download"
- Acompanhe o progresso na seção inferior
- Use "Cancelar" para interromper downloads em andamento

## 🌐 Sites Suportados

O yt-dlp suporta mais de 1000 sites, incluindo:

- YouTube
- Twitch
- Twitter/X
- Instagram
- TikTok
- Facebook
- Vimeo
- Dailymotion
- E muitos outros...

Para ver a lista completa: `yt-dlp --list-extractors`

## ⚡ Funcionalidades Avançadas

### Formatos de Áudio Suportados

- MP3 (mais compatível)
- M4A (boa qualidade)
- WAV (sem compressão)
- FLAC (lossless)

### Legendas

- Download automático de legendas disponíveis
- Suporte a múltiplos idiomas (ex: `pt,en,es`)
- Legendas auto-geradas quando disponíveis

### Downloads Simultâneos

- Execute múltiplos downloads ao mesmo tempo
- Cada download tem seu próprio indicador de progresso
- Cancelamento individual de downloads

## 🛠️ Estrutura do Projeto

```
yt-dlp-gui/
├── main.js              # Processo principal do Electron
├── preload.js           # Bridge de segurança
├── package.json         # Configurações e dependências
├── src/
│   ├── index.html       # Interface principal
│   ├── renderer.js      # Lógica da interface
│   └── styles.css       # Estilos customizados (opcional)
└── assets/
    └── icons/           # Ícones da aplicação
```

## 🐛 Resolução de Problemas

### yt-dlp não encontrado

```bash
# Verifique se está no PATH
yt-dlp --version

# Se não funcionar, reinstale:
pip install --upgrade yt-dlp
```

### Erro de permissão no Windows

Execute o terminal como Administrador ou adicione o yt-dlp ao PATH manualmente.

### Erro de dependências

```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### FFmpeg não encontrado

Instale o FFmpeg para melhor suporte a formatos de vídeo e conversões.

## 🔒 Segurança

- A aplicação não coleta nem envia dados pessoais
- Todas as operações são realizadas localmente
- Os downloads são salvos apenas na pasta escolhida pelo usuário

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🙏 Agradecimentos

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - A ferramenta de download que torna tudo possível
- [Electron](https://electronjs.org/) - Framework para aplicações desktop
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS para interface moderna
- [Font Awesome](https://fontawesome.com/) - Ícones utilizados na interface

## 📞 Suporte

Se encontrar problemas ou tiver sugestões:

1. Verifique os [Issues](https://github.com/seuusuario/yt-dlp-gui/issues) existentes
2. Crie um novo Issue se necessário
3. Forneça detalhes sobre seu sistema operacional e versão do Node.js

---

**Desenvolvido com ❤️ usando Electron + Tailwind CSS**
