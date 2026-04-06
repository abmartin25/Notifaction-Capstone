const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");
const { fork } = require("child_process");

let mainWindow;
let serverProcess;
let notificationWindow;

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

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function createNotificationWindow(notificationData) {
  if (notificationData.location === "inline") {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("show-inline-notification", notificationData);
    }
    return;
  }

  if (notificationWindow && !notificationWindow.isDestroyed()) {
    notificationWindow.close();
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  let windowOptions = {
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    transparent: true,
    show: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  };

  if (notificationData.location === "banner") {
    windowOptions = {
      ...windowOptions,
      width: 520,
      height: 180,
      x: Math.floor((width - 520) / 2),
      y: 20,
    };
  } else if (notificationData.location === "popup") {
    windowOptions = {
      ...windowOptions,
      width: 420,
      height: 320,
      x: Math.floor((width - 420) / 2),
      y: Math.floor((height - 320) / 2),
    };
  } else if (notificationData.location === "modal") {
    windowOptions = {
      ...windowOptions,
      width: width,
      height: height,
      x: 0,
      y: 0,
      parent: mainWindow,
      modal: true,
      alwaysOnTop: true,
      transparent: true,
      frame: false,
    };
  } else {
    // fallback
    windowOptions = {
      ...windowOptions,
      width: 380,
      height: 260,
      x: width - 400,
      y: height - 300,
    };
  }

  notificationWindow = new BrowserWindow(windowOptions);

  notificationWindow.loadFile(path.join(__dirname, "notification.html"));

  notificationWindow.once("ready-to-show", () => {
    notificationWindow.show();
    notificationWindow.webContents.send("notification-data", notificationData);
  });

  notificationWindow.on("closed", () => {
    notificationWindow = null;
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    serverProcess = fork(path.join(__dirname, "server.js"));

    serverProcess.on("message", (msg) => {
      if (msg === "server-ready") {
        resolve();
      }
    });

    serverProcess.on("error", reject);

    setTimeout(resolve, 1500);
  });
}

app.whenReady().then(async () => {
  await startServer();
  createWindow();

  ipcMain.on("show-notification", (_event, notificationData) => {
    createNotificationWindow(notificationData);
  });

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
