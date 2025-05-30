# YT-DLP GUI

Uma interface gráfica moderna e intuitiva para o yt-dlp, desenvolvida com Electron. Permite baixar vídeos e áudios do YouTube e outras plataformas de forma simples e visual.

## 🚀 Características

- **Interface moderna e responsiva** - Design limpo e intuitivo
- **Visualização de informações do vídeo** - Thumbnail, título, duração, visualizações
- **Múltiplos formatos** - Vídeo (MP4) e Áudio (MP3)
- **Seleção de qualidade** - De 360p até 1080p
- **Progresso em tempo real** - Acompanhe o download com barra de progresso
- **Histórico de downloads** - Veja seus downloads recentes
- **Multiplataforma** - Windows, macOS e Linux

## 📋 Pré-requisitos

Antes de usar a aplicação, você precisa ter instalado:

### 1. yt-dlp

```bash
# Windows (via pip)
pip install yt-dlp

# Windows (via winget)
winget install yt-dlp

# macOS (via brew)
brew install yt-dlp

# Linux (via pip)
pip install yt-dlp
```

### 2. FFmpeg (opcional, mas recomendado)

```bash
# Windows
# Baixe de https://ffmpeg.org/download.html

# macOS
brew install ffmpeg

# Linux (Ubuntu/Debian)
sudo apt install ffmpeg
```

## 🛠️ Instalação e Desenvolvimento

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/yt-dlp-gui.git
cd yt-dlp-gui
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Execute em modo desenvolvimento

```bash
npm start
```

### 4. Gerar executável

```bash
# Para Windows
npm run build-win

# Para todas as plataformas
npm run build
```

O executável será gerado na pasta `dist/`.

## 📖 Como Usar

1. **Abra a aplicação** - Execute o arquivo .exe gerado
2. **Verifique o status** - Certifique-se de que o yt-dlp está disponível (indicator verde)
3. **Cole a URL** - Insira a URL do vídeo que deseja baixar
4. **Obter informações** - Clique em "Obter Info" para ver detalhes do vídeo
5. **Configurar download**:
   - Escolha a pasta de destino
   - Selecione o formato (Vídeo ou Áudio)
   - Escolha a qualidade (apenas para vídeo)
6. **Iniciar download** - Clique em "Iniciar Download"
7. **Acompanhar progresso** - Veja o progresso em tempo real

## 🏗️ Estrutura do Projeto

```
yt-dlp-gui/
├── main.js          # Processo principal do Electron
├── preload.js       # Bridge seguro entre processos
├── index.html       # Interface principal
├── styles.css       # Estilos da aplicação
├── renderer.js      # Lógica da interface
├── package.json     # Configurações e dependências
└── assets/          # Ícones e imagens
    └── icon.png
```

## 🔧 Configuração do Build

O arquivo `package.json` já está configurado para gerar executáveis. Para personalizar:

- **Ícone**: Substitua `assets/icon.ico` (Windows) ou `assets/icon.png`
- **Nome da aplicação**: Modifique `productName` em `package.json`
- **Configurações do instalador**: Ajuste a seção `build` em `package.json`

## 🎨 Personalização

### Modificar cores e tema

Edite o arquivo `styles.css` para alterar:

- Gradientes de cor
- Esquema de cores
- Animações
- Layout responsivo

### Adicionar funcionalidades

1. **Backend**: Modifique `main.js` para adicionar novos IPCs
2. **Frontend**: Atualize `renderer.js` para nova lógica
3. **Interface**: Modifique `index.html` e `styles.css`

## 🐛 Solução de Problemas

### yt-dlp não encontrado

- Certifique-se de que o yt-dlp está instalado
- Verifique se está no PATH do sistema
- Reinicie a aplicação após instalar

### Erro de download

- Verifique a conexão com a internet
- Teste a URL em um navegador
- Alguns vídeos podem ter restrições

### Performance lenta

- Verifique se o FFmpeg está instalado
- Use uma pasta de destino no SSD
- Feche outros programas pesados

## 📱 Plataformas Suportadas

| Plataforma | Status         | Formato   |
| ---------- | -------------- | --------- |
| Windows    | ✅ Testado     | .exe      |
| macOS      | ⚠️ Não testado | .dmg      |
| Linux      | ⚠️ Não testado | .AppImage |

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🙏 Agradecimentos

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Ferramenta principal de download
- [Electron](https://www.electronjs.org/) - Framework para aplicações desktop
- [Font Awesome](https://fontawesome.com/) - Ícones da interface

## 📞 Suporte

Se encontrar problemas ou tiver sugestões:

1. Abra uma [Issue](https://github.com/seu-usuario/yt-dlp-gui/issues)
2. Descreva o problema detalhadamente
3. Inclua informações do sistema operacional
4. Anexe logs se disponível

---

**Nota**: Esta aplicação é apenas uma interface para o yt-dlp. Respeite os termos de uso das plataformas de vídeo e as leis de direitos autorais do seu país.
"# ytdlp-app" 
