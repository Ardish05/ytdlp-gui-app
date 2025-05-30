// Estado da aplicação
let isYtdlpAvailable = false;
let currentDownload = null;

// Elementos DOM
const elements = {
  statusIndicator: document.getElementById("statusIndicator"),
  statusText: document.getElementById("statusText"),
  urlInput: document.getElementById("urlInput"),
  getInfoBtn: document.getElementById("getInfoBtn"),
  videoInfo: document.getElementById("videoInfo"),
  videoThumbnail: document.getElementById("videoThumbnail"),
  videoTitle: document.getElementById("videoTitle"),
  videoUploader: document.getElementById("videoUploader"),
  videoDuration: document.getElementById("videoDuration"),
  videoViews: document.getElementById("videoViews"),
  outputPath: document.getElementById("outputPath"),
  selectFolderBtn: document.getElementById("selectFolderBtn"),
  formatSelect: document.getElementById("formatSelect"),
  qualitySelect: document.getElementById("qualitySelect"),
  qualityGroup: document.getElementById("qualityGroup"),
  downloadBtn: document.getElementById("downloadBtn"),
  progressSection: document.getElementById("progressSection"),
  progressFill: document.getElementById("progressFill"),
  progressText: document.getElementById("progressText"),
  consoleOutput: document.getElementById("consoleOutput"),
  cancelBtn: document.getElementById("cancelBtn"),
  downloadsList: document.getElementById("downloadsList"),
  toastContainer: document.getElementById("toastContainer"),
};

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
  await checkYtdlpStatus();
  setupEventListeners();
  loadSettings();
});

// Verificar status do yt-dlp
async function checkYtdlpStatus() {
  try {
    updateStatus("Verificando yt-dlp...", "loading");
    isYtdlpAvailable = await window.electronAPI.checkYtdlp();

    if (isYtdlpAvailable) {
      updateStatus("yt-dlp disponível", "online");
    } else {
      updateStatus("yt-dlp não encontrado", "offline");
      showToast(
        "yt-dlp não foi encontrado. Certifique-se de que está instalado e no PATH.",
        "error"
      );
    }
  } catch (error) {
    updateStatus("Erro ao verificar yt-dlp", "offline");
    showToast("Erro ao verificar yt-dlp: " + error.message, "error");
  }
}

// Atualizar status
function updateStatus(text, status) {
  elements.statusText.textContent = text;
  elements.statusIndicator.className = `status-indicator ${status}`;
}

// Setup de event listeners
function setupEventListeners() {
  // Obter informações do vídeo
  elements.getInfoBtn.addEventListener("click", getVideoInfo);
  elements.urlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") getVideoInfo();
  });

  // Seleção de pasta
  elements.selectFolderBtn.addEventListener("click", selectOutputFolder);

  // Mudança de formato
  elements.formatSelect.addEventListener("change", (e) => {
    elements.qualityGroup.style.display =
      e.target.value === "audio" ? "none" : "flex";
  });

  // Download
  elements.downloadBtn.addEventListener("click", startDownload);

  // Cancelar download
  elements.cancelBtn.addEventListener("click", cancelDownload);

  // Progresso do download
  window.electronAPI.onDownloadProgress((data) => {
    updateDownloadProgress(data);
  });
}

// Obter informações do vídeo
async function getVideoInfo() {
  const url = elements.urlInput.value.trim();

  if (!url) {
    showToast("Por favor, insira uma URL", "warning");
    return;
  }

  if (!isYtdlpAvailable) {
    showToast("yt-dlp não está disponível", "error");
    return;
  }

  try {
    elements.getInfoBtn.disabled = true;
    elements.getInfoBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Carregando...';

    const info = await window.electronAPI.getVideoInfo(url);

    // Atualizar interface com informações do vídeo
    elements.videoThumbnail.src = info.thumbnail || "";
    elements.videoTitle.textContent = info.title || "Título não disponível";
    elements.videoUploader.textContent =
      info.uploader || "Canal não disponível";
    elements.videoDuration.textContent = formatDuration(info.duration);
    elements.videoViews.textContent = formatViews(info.view_count);

    elements.videoInfo.style.display = "block";
    showToast("Informações carregadas com sucesso!", "success");
  } catch (error) {
    showToast("Erro ao obter informações: " + error.error, "error");
    elements.videoInfo.style.display = "none";
  } finally {
    elements.getInfoBtn.disabled = false;
    elements.getInfoBtn.innerHTML =
      '<i class="fas fa-info-circle"></i> Obter Info';
  }
}

// Selecionar pasta de destino
async function selectOutputFolder() {
  try {
    const folderPath = await window.electronAPI.selectFolder();
    if (folderPath) {
      elements.outputPath.value = folderPath;
      saveSettings();
    }
  } catch (error) {
    showToast("Erro ao selecionar pasta: " + error.message, "error");
  }
}

// Iniciar download
async function startDownload() {
  const url = elements.urlInput.value.trim();
  const outputPath = elements.outputPath.value;
  const format = elements.formatSelect.value;
  const quality = elements.qualitySelect.value;

  // Validações
  if (!url) {
    showToast("Por favor, insira uma URL", "warning");
    return;
  }

  if (!outputPath) {
    showToast("Por favor, selecione uma pasta de destino", "warning");
    return;
  }

  if (!isYtdlpAvailable) {
    showToast("yt-dlp não está disponível", "error");
    return;
  }

  try {
    // Preparar interface para download
    elements.downloadBtn.disabled = true;
    elements.progressSection.style.display = "block";
    elements.progressFill.style.width = "0%";
    elements.progressText.textContent = "Iniciando download...";
    elements.consoleOutput.textContent = "";

    // Opções do download
    const downloadOptions = {
      url,
      outputPath,
      format,
      quality: format === "video" ? quality : null,
    };

    // Iniciar download
    currentDownload = downloadOptions;
    const result = await window.electronAPI.downloadVideo(downloadOptions);

    if (result.success) {
      elements.progressFill.style.width = "100%";
      elements.progressText.textContent = "Download concluído com sucesso!";
      showToast("Download concluído!", "success");
      addToRecentDownloads(downloadOptions);
    }
  } catch (error) {
    elements.progressText.textContent = "Erro no download: " + error.error;
    showToast("Erro no download: " + error.error, "error");
  } finally {
    elements.downloadBtn.disabled = false;
    currentDownload = null;
    setTimeout(() => {
      elements.progressSection.style.display = "none";
    }, 3000);
  }
}

// Cancelar download
function cancelDownload() {
  if (currentDownload) {
    // Aqui você implementaria a lógica para cancelar o processo
    currentDownload = null;
    elements.progressSection.style.display = "none";
    elements.downloadBtn.disabled = false;
    showToast("Download cancelado", "warning");
  }
}

// Atualizar progresso do download
function updateDownloadProgress(data) {
  const output = data.toString();
  elements.consoleOutput.textContent += output;
  elements.consoleOutput.scrollTop = elements.consoleOutput.scrollHeight;

  // Extrair porcentagem do progresso (yt-dlp format)
  const progressMatch = output.match(/(\d+\.?\d*)%/);
  if (progressMatch) {
    const percentage = parseFloat(progressMatch[1]);
    elements.progressFill.style.width = percentage + "%";
    elements.progressText.textContent = `Download em progresso: ${percentage}%`;
  }

  // Detectar informações de velocidade
  const speedMatch = output.match(/(\d+\.?\d*\w+\/s)/);
  if (speedMatch) {
    elements.progressText.textContent += ` - ${speedMatch[1]}`;
  }
}

// Adicionar aos downloads recentes
function addToRecentDownloads(downloadOptions) {
  const downloads = getRecentDownloads();
  const newDownload = {
    ...downloadOptions,
    timestamp: new Date().toISOString(),
    title: elements.videoTitle.textContent,
  };

  downloads.unshift(newDownload);
  if (downloads.length > 10) downloads.pop(); // Manter apenas 10 recentes

  localStorage.setItem("recentDownloads", JSON.stringify(downloads));
  updateRecentDownloadsList();
}

// Obter downloads recentes
function getRecentDownloads() {
  try {
    return JSON.parse(localStorage.getItem("recentDownloads") || "[]");
  } catch {
    return [];
  }
}

// Atualizar lista de downloads recentes
function updateRecentDownloadsList() {
  const downloads = getRecentDownloads();

  if (downloads.length === 0) {
    elements.downloadsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-download"></i>
                <p>Nenhum download realizado ainda</p>
            </div>
        `;
    return;
  }

  elements.downloadsList.innerHTML = downloads
    .map(
      (download) => `
        <div class="download-item">
            <div class="download-info">
                <h4>${download.title}</h4>
                <p>${download.url}</p>
                <small>${formatDate(
                  download.timestamp
                )} - ${download.format.toUpperCase()}</small>
            </div>
            <div class="download-actions">
                <button class="btn btn-small btn-outline" onclick="openFolder('${
                  download.outputPath
                }')">
                    <i class="fas fa-folder-open"></i>
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

// Abrir pasta (funcionalidade adicional)
function openFolder(path) {
  // Esta funcionalidade precisaria ser implementada no main.js
  showToast("Funcionalidade em desenvolvimento", "warning");
}

// Salvar configurações
function saveSettings() {
  const settings = {
    outputPath: elements.outputPath.value,
    format: elements.formatSelect.value,
    quality: elements.qualitySelect.value,
  };
  localStorage.setItem("settings", JSON.stringify(settings));
}

// Carregar configurações
function loadSettings() {
  try {
    const settings = JSON.parse(localStorage.getItem("settings") || "{}");

    if (settings.outputPath) elements.outputPath.value = settings.outputPath;
    if (settings.format) elements.formatSelect.value = settings.format;
    if (settings.quality) elements.qualitySelect.value = settings.quality;

    // Trigger change event para atualizar visibilidade dos campos
    elements.formatSelect.dispatchEvent(new Event("change"));
  } catch (error) {
    console.error("Erro ao carregar configurações:", error);
  }

  updateRecentDownloadsList();
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
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function formatViews(views) {
  if (!views) return "N/A";

  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M visualizações";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K visualizações";
  }
  return views.toLocaleString() + " visualizações";
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("pt-BR");
}

// Sistema de notificações toast
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon =
    type === "success"
      ? "check-circle"
      : type === "error"
      ? "exclamation-circle"
      : "exclamation-triangle";

  toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

  elements.toastContainer.appendChild(toast);

  // Remover após 5 segundos
  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 5000);
}

// Adicionar animação de saída para toast
const style = document.createElement("style");
style.textContent = `
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .download-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        background: #f8f9fa;
        transition: background 0.3s ease;
    }
    
    .download-item:hover {
        background: #e9ecef;
    }
    
    .download-info h4 {
        margin: 0 0 0.5rem 0;
        color: #333;
        font-size: 1rem;
    }
    
    .download-info p {
        margin: 0 0 0.25rem 0;
        color: #666;
        font-size: 0.9rem;
        word-break: break-all;
    }
    
    .download-info small {
        color: #888;
        font-size: 0.8rem;
    }
    
    .download-actions {
        display: flex;
        gap: 0.5rem;
    }
`;
document.head.appendChild(style);
