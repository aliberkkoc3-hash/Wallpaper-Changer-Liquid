const { app, BrowserWindow, ipcMain, shell, globalShortcut, Tray, Menu } = require('electron');
const path = require('path');

// Chromium'un zararsız loglarını gizle
app.commandLine.appendSwitch('log-level', '3');

let initWallpaperManager = null;
try {
  // Paketlendikten sonra patlayan ana modülü kontrol ediyoruz
  const manager = require('./wallpaperManager');
  initWallpaperManager = manager.initWallpaperManager;
  console.log("WALLPAPER MANAGER BAŞARIYLA YÜKLENDİ!");
} catch (error) {
  console.log("CRITICAL ERROR: wallpaperManager.js yüklenirken patladı!");
  console.log(error); // Hatayı canlı canlı PowerShell'e basacak
}

let win;
let tray = null;

function createWindow () {
  win = new BrowserWindow({
    width: 1100,
    height: 850,
    frame: false,        // Liquid Glass için çerçevesiz
    transparent: true,   // Liquid Glass için transparan
    alwaysOnTop: true,
    icon: path.join(__dirname, 'Icons/PixelDevs_Icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.webContents.session.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'media') return true;
    return false;
  });

  win.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') return callback(true);
    return callback(false);
  });

  win.loadFile('index.html');

  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      win.hide();
    }
    return false;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  // Eğer modül sorunsuz yüklendiyse çalıştır
  if (initWallpaperManager) {
    try {
      initWallpaperManager();
    } catch (e) {
      console.log("initWallpaperManager çalışırken hata verdi:", e);
    }
  }

  tray = new Tray(path.join(__dirname, 'Icons/PixelDevs_Icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Uygulamayı Aç', click: () => win.show() },
    { type: 'separator' },
    { label: 'Çıkış', click: () => { app.isQuitting = true; app.quit(); } }
  ]);
  tray.setToolTip('PixelDevs Background Changer');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => win.show());

  globalShortcut.register('Alt+Shift+B', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });
});

ipcMain.on('open-discord', () => {
  shell.openExternal('https://discord.gg/tHVwcR7ykB');
});

ipcMain.on('close-app', () => {
  win.hide();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});