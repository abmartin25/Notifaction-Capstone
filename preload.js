const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  sendNotification: (data) => {
    ipcRenderer.send("show-notification", data);
  },
  onNotificationData: (callback) => {
    ipcRenderer.on("notification-data", (_event, data) => {
      callback(data);
    });
  },
  onInlineNotification: (callback) => {
    ipcRenderer.on("show-inline-notification", (_event, data) => {
      callback(data);
    });
  },
  openUrl: (url) => {
    ipcRenderer.send("open-url", url);
  },
  triggerRestart: () => {
    ipcRenderer.send("trigger-restart");
  },
});
