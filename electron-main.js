const { app, BrowserWindow, ipcMain, screen, shell, dialog } = require("electron");
const { exec } = require("child_process");
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
    resizable: true,
    movable: true,
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
      width: 560,
      height: 520,
      x: Math.floor((width - 560) / 2),
      y: 20,
    };
  } else if (notificationData.location === "popup") {
    windowOptions = {
      ...windowOptions,
      width: 480,
      height: 600,
      x: Math.floor((width - 480) / 2),
      y: Math.floor((height - 600) / 2),
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
      width: 400,
      height: 520,
      x: width - 420,
      y: height - 540,
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

  ipcMain.on("open-url", (_event, url) => {
    shell.openExternal(url);
  });

  ipcMain.on("trigger-restart", async (_event) => {
    const { response } = await dialog.showMessageBox({
      type: "warning",
      buttons: ["Restart Now", "Cancel"],
      defaultId: 0,
      cancelId: 1,
      title: "Software Update",
      message: "Your computer will restart to apply the update.",
      detail: "Save any open work before continuing.",
    });
    if (response === 0) {
      if (process.platform === "win32") {
        exec("shutdown /r /t 5");
      } else if (process.platform === "darwin") {
        exec("osascript -e 'tell application \"Finder\" to restart'");
      } else {
        exec("shutdown -r now");
      }
    }
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
