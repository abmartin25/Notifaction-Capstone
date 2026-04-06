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
});
