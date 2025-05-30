// Estado da aplicação
let currentVideoInfo = null;
let activeDownloads = new Map();

// Elementos DOM
const elements = {
  urlInput: document.getElementById("url-input"),
  analyzeBtn: document.getElementById("analyze-btn"),
  videoInfo: document.getElementById("video-info"),
  videoTitle: document.getElementById("video-title"),
  videoUploader: document.getElementById("video-uploader"),
  videoDuration: document.getElementById("video-duration"),
  videoThumbnail: document.getElementById("video-thumbnail"),
  downloadOptions: document.getElementById("download-options"),
  formatSelect: document.getElementById("format-select"),
  outputPath: document.getElementById("output-path"),
  selectFolderBtn: document.getElementById("select-folder-btn"),
  audioOnly: document.getElementById("audio-only"),
  audioFormat: document.getElementById("audio-format"),
  audioFormatContainer: document.getElementById("audio-format-container"),
  subtitles: document.getElementById("subtitles"),
  subtitleLang: document.getElementById("subtitle-lang"),
  subtitleLangContainer: document.getElementById("subtitle-lang-container"),
  downloadBtn: document.getElementById("download-btn"),
  downloadProgress: document.getElementById("download-progress"),
  downloadsContainer: document.getElementById("downloads-container"),
  loadingModal: document.getElementById("loading-modal"),
  errorModal: document.getElementById("error-modal"),
  errorMessage: document.getElementById("error-message"),
  closeErrorBtn: document.getElementById("close-error-btn"),
  statusIndicator: document.getElementById("status-indicator"),
};

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
  await checkYtDlpStatus();
  await setDefaultDownloadPath();
  setupEventListeners();
  setupDownloadListeners();
});

// Verificar status do yt-dlp
async function checkYtDlpStatus() {
  try {
    const isAvailable = await window.electronAPI.checkYtDlp();
    const statusEl = elements.statusIndicator;

    if (isAvailable) {
      statusEl.innerHTML = `
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <span class="text-sm text-green-600">yt-dlp disponível</span>
            `;
    } else {
      statusEl.innerHTML = `
                <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                <span class="text-sm text-red-600">yt-dlp não encontrado</span>
            `;
      showError(
        "yt-dlp não foi encontrado. Certifique-se de que está instalado e disponível no PATH do sistema."
      );
    }
  } catch (error) {
    console.error("Erro ao verificar yt-dlp:", error);
  }
}

// Configurar pasta padrão de download
async function setDefaultDownloadPath() {
  try {
    const defaultPath = await window.electronAPI.getDefaultDownloadPath();
    elements.outputPath.value = defaultPath;
  } catch (error) {
    console.error("Erro ao obter pasta padrão:", error);
  }
}

// Configurar event listeners
function setupEventListeners() {
  // Análise do vídeo
  elements.analyzeBtn.addEventListener("click", analyzeVideo);
  elements.urlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      analyzeVideo();
    }
  });

  // Seleção de pasta
  elements.selectFolderBtn.addEventListener("click", selectFolder);

  // Opções de áudio
  elements.audioOnly.addEventListener("change", toggleAudioOptions);

  // Opções de legenda
  elements.subtitles.addEventListener("change", toggleSubtitleOptions);

  // Download
  elements.downloadBtn.addEventListener("click", startDownload);

  // Fechar modal de erro
  elements.closeErrorBtn.addEventListener("click", hideError);
}

// Configurar listeners de download
function setupDownloadListeners() {
  window.electronAPI.onDownloadProgress(handleDownloadProgress);
  window.electronAPI.onDownloadError(handleDownloadError);
  window.electronAPI.onDownloadComplete(handleDownloadComplete);
}

// Analisar vídeo
async function analyzeVideo() {
  const url = elements.urlInput.value.trim();

  if (!url) {
    showError("Por favor, insira uma URL válida.");
    return;
  }

  showLoading();
  elements.analyzeBtn.disabled = true;

  try {
    currentVideoInfo = await window.electronAPI.getVideoInfo(url);
    displayVideoInfo(currentVideoInfo);
    populateFormatOptions(currentVideoInfo.formats);
    showDownloadOptions();
  } catch (error) {
    showError("Erro ao analisar vídeo: " + error.message);
  } finally {
    hideLoading();
    elements.analyzeBtn.disabled = false;
  }
}

// Exibir informações do vídeo
function displayVideoInfo(info) {
  elements.videoTitle.textContent = info.title;
  elements.videoUploader.textContent = info.uploader;
  elements.videoDuration.textContent = formatDuration(info.duration);
  elements.videoThumbnail.src = info.thumbnail;
  elements.videoInfo.classList.remove("hidden");
}

// Popular opções de formato
function populateFormatOptions(formats) {
  elements.formatSelect.innerHTML =
    '<option value="">Melhor qualidade disponível</option>';

  if (!formats || formats.length === 0) return;

  // Agrupar formatos por qualidade
  const uniqueFormats = new Map();

  formats.forEach((format) => {
    if (format.vcodec !== "none" || format.acodec !== "none") {
      const key = `${format.quality}_${format.ext}`;
      if (!uniqueFormats.has(key)) {
        uniqueFormats.set(key, format);
      }
    }
  });

  // Adicionar opções ao select
  Array.from(uniqueFormats.values())
    .sort((a, b) => {
      const qualityOrder = [
        "2160p",
        "1440p",
        "1080p",
        "720p",
        "480p",
        "360p",
        "240p",
        "144p",
      ];
      const aIndex = qualityOrder.indexOf(a.quality);
      const bIndex = qualityOrder.indexOf(b.quality);
      return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
    })
    .forEach((format) => {
      const option = document.createElement("option");
      option.value = format.format_id;
      option.textContent = `${format.quality} (${format.ext.toUpperCase()})${
        format.filesize ? ` - ${formatFileSize(format.filesize)}` : ""
      }`;
      elements.formatSelect.appendChild(option);
    });
}

// Selecionar pasta de download
async function selectFolder() {
  try {
    const folderPath = await window.electronAPI.selectDownloadFolder();
    if (folderPath) {
      elements.outputPath.value = folderPath;
    }
  } catch (error) {
    showError("Erro ao selecionar pasta: " + error.message);
  }
}

// Toggle opções de áudio
function toggleAudioOptions() {
  if (elements.audioOnly.checked) {
    elements.audioFormatContainer.classList.remove("hidden");
  } else {
    elements.audioFormatContainer.classList.add("hidden");
  }
}

// Toggle opções de legenda
function toggleSubtitleOptions() {
  if (elements.subtitles.checked) {
    elements.subtitleLangContainer.classList.remove("hidden");
  } else {
    elements.subtitleLangContainer.classList.add("hidden");
  }
}

// Iniciar download
async function startDownload() {
  if (!currentVideoInfo) {
    showError("Nenhum vídeo analisado.");
    return;
  }

  const options = {
    url: elements.urlInput.value.trim(),
    outputPath: elements.outputPath.value,
    format: elements.formatSelect.value,
    audioOnly: elements.audioOnly.checked,
    audioFormat: elements.audioFormat.value,
    subtitles: elements.subtitles.checked,
    subtitleLang: elements.subtitleLang.value,
  };

  try {
    elements.downloadBtn.disabled = true;
    const downloadId = await window.electronAPI.startDownload(options);

    // Criar item de download na interface
    createDownloadItem(downloadId, currentVideoInfo.title);
    showDownloadProgress();
  } catch (error) {
    showError("Erro ao iniciar download: " + error.message);
  } finally {
    elements.downloadBtn.disabled = false;
  }
}

// Criar item de download
function createDownloadItem(downloadId, title) {
  const downloadItem = document.createElement("div");
  downloadItem.id = `download-${downloadId}`;
  downloadItem.className = "border border-gray-200 rounded-lg p-4 mb-4";

  downloadItem.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium text-gray-900 truncate flex-1 mr-4">${escapeHtml(
              title
            )}</h4>
            <button 
                onclick="cancelDownload('${downloadId}')" 
                class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition duration-200"
            >
                <i class="fas fa-times mr-1"></i>
                Cancelar
            </button>
        </div>
        <div class="mb-2">
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary-500 h-2 rounded-full transition-all duration-300" style="width: 0%" id="progress-${downloadId}"></div>
            </div>
        </div>
        <div class="flex justify-between text-sm text-gray-600">
            <span id="status-${downloadId}">Iniciando...</span>
            <span id="speed-${downloadId}"></span>
        </div>
        <div class="mt-2">
            <details>
                <summary class="cursor-pointer text-sm text-gray-500 hover:text-gray-700">Ver detalhes</summary>
                <pre id="output-${downloadId}" class="mt-2 text-xs bg-gray-50 p-2 rounded max-h-32 overflow-y-auto"></pre>
            </details>
        </div>
    `;

  elements.downloadsContainer.appendChild(downloadItem);
  activeDownloads.set(downloadId, { title, element: downloadItem });
}

// Cancelar download
window.cancelDownload = async function (downloadId) {
  try {
    await window.electronAPI.cancelDownload(downloadId);
    const downloadData = activeDownloads.get(downloadId);
    if (downloadData) {
      downloadData.element.remove();
      activeDownloads.delete(downloadId);
    }
  } catch (error) {
    showError("Erro ao cancelar download: " + error.message);
  }
};

// Manipular progresso do download
function handleDownloadProgress(data) {
  const { id, output } = data;
  const outputEl = document.getElementById(`output-${id}`);
  const statusEl = document.getElementById(`status-${id}`);
  const speedEl = document.getElementById(`speed-${id}`);
  const progressEl = document.getElementById(`progress-${id}`);

  if (outputEl) {
    outputEl.textContent += output;
    outputEl.scrollTop = outputEl.scrollHeight;
  }

  // Extrair informações do output do yt-dlp
  const lines = output.split("\n");
  lines.forEach((line) => {
    // Progresso de download
    const progressMatch = line.match(/(\d+(?:\.\d+)?)%/);
    if (progressMatch && progressEl) {
      const progress = parseFloat(progressMatch[1]);
      progressEl.style.width = `${progress}%`;
    }

    // Velocidade de download
    const speedMatch = line.match(/(\d+(?:\.\d+)?(?:MiB|KiB|GiB)\/s)/);
    if (speedMatch && speedEl) {
      speedEl.textContent = speedMatch[1];
    }

    // Status
    if (line.includes("[download]") && statusEl) {
      if (line.includes("Downloading")) {
        statusEl.textContent = "Baixando...";
      } else if (line.includes("100%")) {
        statusEl.textContent = "Processando...";
      }
    }
  });
}

// Manipular erro de download
function handleDownloadError(data) {
  const { id, error } = data;
  const statusEl = document.getElementById(`status-${id}`);
  const outputEl = document.getElementById(`output-${id}`);

  if (statusEl) {
    statusEl.textContent = "Erro";
    statusEl.className = "text-red-600";
  }

  if (outputEl) {
    outputEl.textContent += `\nERRO: ${error}`;
    outputEl.scrollTop = outputEl.scrollHeight;
  }
}

// Manipular conclusão do download
function handleDownloadComplete(data) {
  const { id, success } = data;
  const statusEl = document.getElementById(`status-${id}`);
  const progressEl = document.getElementById(`progress-${id}`);

  if (statusEl) {
    if (success) {
      statusEl.textContent = "Concluído";
      statusEl.className = "text-green-600";
      if (progressEl) {
        progressEl.style.width = "100%";
        progressEl.className =
          "bg-green-500 h-2 rounded-full transition-all duration-300";
      }
    } else {
      statusEl.textContent = "Falhou";
      statusEl.className = "text-red-600";
    }
  }

  // Remover botão de cancelar
  const downloadItem = document.getElementById(`download-${id}`);
  if (downloadItem) {
    const cancelBtn = downloadItem.querySelector("button");
    if (cancelBtn) {
      cancelBtn.remove();
    }
  }
}

// Utilitários de interface
function showVideoInfo() {
  elements.videoInfo.classList.remove("hidden");
}

function showDownloadOptions() {
  elements.downloadOptions.classList.remove("hidden");
}

function showDownloadProgress() {
  elements.downloadProgress.classList.remove("hidden");
}

function showLoading() {
  elements.loadingModal.classList.remove("hidden");
}

function hideLoading() {
  elements.loadingModal.classList.add("hidden");
}

function showError(message) {
  elements.errorMessage.textContent = message;
  elements.errorModal.classList.remove("hidden");
}

function hideError() {
  elements.errorModal.classList.add("hidden");
}

// Utilitários de formatação
function formatDuration(seconds) {
  if (!seconds) return "N/A";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
}

function formatFileSize(bytes) {
  if (!bytes) return "";

  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Limpeza ao fechar
window.addEventListener("beforeunload", () => {
  window.electronAPI.removeAllListeners("download-progress");
  window.electronAPI.removeAllListeners("download-error");
  window.electronAPI.removeAllListeners("download-complete");
});
