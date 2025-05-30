const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Verificar se yt-dlp está instalado
  checkYtDlp: () => ipcRenderer.invoke("check-yt-dlp"),

  // Obter informações do vídeo
  getVideoInfo: (url) => ipcRenderer.invoke("get-video-info", url),

  // Seletor de pasta de download
  selectDownloadFolder: () => ipcRenderer.invoke("select-download-folder"),

  // Iniciar download
  startDownload: (options) => ipcRenderer.invoke("start-download", options),

  // Cancelar download
  cancelDownload: (downloadId) =>
    ipcRenderer.invoke("cancel-download", downloadId),

  // Obter pasta padrão de downloads
  getDefaultDownloadPath: () => ipcRenderer.invoke("get-default-download-path"),

  // Listeners para eventos de download
  onDownloadProgress: (callback) => {
    ipcRenderer.on("download-progress", (event, data) => callback(data));
  },

  onDownloadError: (callback) => {
    ipcRenderer.on("download-error", (event, data) => callback(data));
  },

  onDownloadComplete: (callback) => {
    ipcRenderer.on("download-complete", (event, data) => callback(data));
  },

  // Remover listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});
