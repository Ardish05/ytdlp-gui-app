const { app, BrowserWindow, ipcMain, dialog, shell } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

let mainWindow;
let downloadProcesses = new Map();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets/icons/icon.png"),
    titleBarStyle: "default",
    show: false,
  });

  mainWindow.loadFile("src/index.html");

  // Mostrar janela quando pronta
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Abrir links externos no navegador
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle("check-yt-dlp", async () => {
  return new Promise((resolve) => {
    const child = spawn("yt-dlp", ["--version"]);
    child.on("close", (code) => {
      resolve(code === 0);
    });
    child.on("error", () => {
      resolve(false);
    });
  });
});

ipcMain.handle("get-video-info", async (event, url) => {
  return new Promise((resolve, reject) => {
    const child = spawn("yt-dlp", ["--dump-json", "--no-playlist", url]);

    let output = "";
    let error = "";

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      error += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(output);
          resolve({
            title: info.title,
            duration: info.duration,
            uploader: info.uploader,
            thumbnail: info.thumbnail,
            formats:
              info.formats?.map((f) => ({
                format_id: f.format_id,
                ext: f.ext,
                quality: f.format_note || f.quality || "unknown",
                filesize: f.filesize,
                vcodec: f.vcodec,
                acodec: f.acodec,
              })) || [],
          });
        } catch (e) {
          reject(new Error("Erro ao analisar informações do vídeo"));
        }
      } else {
        reject(new Error(error || "Erro ao obter informações do vídeo"));
      }
    });

    child.on("error", (err) => {
      reject(err);
    });
  });
});

ipcMain.handle("select-download-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });

  if (!result.canceled) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle("start-download", async (event, options) => {
  const downloadId = `download_${Date.now()}`;

  const args = [
    options.url,
    "-o",
    path.join(options.outputPath, "%(title)s.%(ext)s"),
    "--newline",
  ];

  if (options.format) {
    args.push("-f", options.format);
  }

  if (options.audioOnly) {
    args.push("-x", "--audio-format", options.audioFormat || "mp3");
  }

  if (options.subtitles) {
    args.push(
      "--write-subs",
      "--write-auto-subs",
      "--sub-lang",
      options.subtitleLang || "pt,en"
    );
  }

  const child = spawn("yt-dlp", args);
  downloadProcesses.set(downloadId, child);

  child.stdout.on("data", (data) => {
    const output = data.toString();
    mainWindow.webContents.send("download-progress", {
      id: downloadId,
      output: output,
    });
  });

  child.stderr.on("data", (data) => {
    const error = data.toString();
    mainWindow.webContents.send("download-error", {
      id: downloadId,
      error: error,
    });
  });

  child.on("close", (code) => {
    downloadProcesses.delete(downloadId);
    mainWindow.webContents.send("download-complete", {
      id: downloadId,
      success: code === 0,
    });
  });

  return downloadId;
});

ipcMain.handle("cancel-download", async (event, downloadId) => {
  const process = downloadProcesses.get(downloadId);
  if (process) {
    process.kill();
    downloadProcesses.delete(downloadId);
    return true;
  }
  return false;
});

ipcMain.handle("get-default-download-path", () => {
  return path.join(os.homedir(), "Downloads");
});
