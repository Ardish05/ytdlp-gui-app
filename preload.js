const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Seleção de pasta
  selectFolder: () => ipcRenderer.invoke("select-folder"),

  // Verificar se yt-dlp está instalado
  checkYtdlp: () => ipcRenderer.invoke("check-ytdlp"),

  // Download de vídeo
  downloadVideo: (options) => ipcRenderer.invoke("download-video", options),

  // Obter informações do vídeo
  getVideoInfo: (url) => ipcRenderer.invoke("get-video-info", url),

  // Listener para progresso do download
  onDownloadProgress: (callback) => {
    ipcRenderer.on("download-progress", (event, data) => callback(data));
  },

  // Remover listener
  removeDownloadProgressListener: () => {
    ipcRenderer.removeAllListeners("download-progress");
  },
});
