const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets/icon.png"),
    title: "YT-DLP GUI",
    show: false,
  });

  mainWindow.loadFile("index.html");

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  // Abrir DevTools em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }
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
ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  return result.filePaths[0];
});

ipcMain.handle("check-ytdlp", async () => {
  return new Promise((resolve) => {
    const ytdlp = spawn("yt-dlp", ["--version"]);

    ytdlp.on("close", (code) => {
      resolve(code === 0);
    });

    ytdlp.on("error", () => {
      resolve(false);
    });
  });
});

ipcMain.handle("download-video", async (event, options) => {
  return new Promise((resolve, reject) => {
    const { url, outputPath, format, quality } = options;

    let args = [url];

    // Adicionar argumentos baseados nas opções
    if (outputPath) {
      args.push("-o", path.join(outputPath, "%(title)s.%(ext)s"));
    }

    if (format === "audio") {
      args.push("-x", "--audio-format", "mp3");
    } else if (quality && quality !== "best") {
      args.push("-f", `best[height<=${quality}]`);
    }

    const ytdlp = spawn("yt-dlp", args);

    let output = "";
    let error = "";

    ytdlp.stdout.on("data", (data) => {
      output += data.toString();
      // Enviar progresso em tempo real
      event.sender.send("download-progress", data.toString());
    });

    ytdlp.stderr.on("data", (data) => {
      error += data.toString();
      event.sender.send("download-progress", data.toString());
    });

    ytdlp.on("close", (code) => {
      if (code === 0) {
        resolve({ success: true, output });
      } else {
        reject({ success: false, error });
      }
    });

    ytdlp.on("error", (err) => {
      reject({ success: false, error: err.message });
    });
  });
});

ipcMain.handle("get-video-info", async (event, url) => {
  return new Promise((resolve, reject) => {
    const ytdlp = spawn("yt-dlp", ["--dump-json", url]);

    let output = "";
    let error = "";

    ytdlp.stdout.on("data", (data) => {
      output += data.toString();
    });

    ytdlp.stderr.on("data", (data) => {
      error += data.toString();
    });

    ytdlp.on("close", (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(output);
          resolve({
            title: info.title,
            duration: info.duration,
            uploader: info.uploader,
            view_count: info.view_count,
            thumbnail: info.thumbnail,
            formats: info.formats?.map((f) => ({
              format_id: f.format_id,
              ext: f.ext,
              resolution: f.resolution,
              filesize: f.filesize,
            })),
          });
        } catch (e) {
          reject({ error: "Erro ao processar informações do vídeo" });
        }
      } else {
        reject({ error });
      }
    });
  });
});
