const { app, BrowserWindow } = require("electron");
const path = require("path");
const startServer = require("./server.cjs");
// const SERVER_PATH = path.join(__dirname, "server.js");
// const child = fork(SERVER_PATH);

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.loadURL("http://localhost:3000");
  mainWindow.webContents.openDevTools();

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// function startServer() {
//   return new Promise((resolve, reject) => {
//     serverProcess = fork(path.join(__dirname, "server.js"));

//     serverProcess.on("message", (msg) => {
//       if (msg === "server-ready") {
//         resolve();
//       }
//     });

//     serverProcess.on("error", reject);

//     // if server doesn't send a ready message yet
//     setTimeout(resolve, 1500);
//   });
// }

app.whenReady().then(async () => {
  startServer();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});
