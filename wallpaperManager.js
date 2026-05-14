const { ipcMain, dialog } = require('electron');
const path = require('path');
const { setWallpaper } = require('wallpaper');
const fsExtra = require('fs-extra');

function initWallpaperManager() {
  // Harici Dosya Yükleme ve Ayarlama
  ipcMain.on('upload-wallpaper', async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg'] }]
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const sourcePath = result.filePaths[0];
      const fileName = path.basename(sourcePath);
      const destDir = path.join(__dirname, 'Data', 'externalBackground');
      const destPath = path.join(destDir, fileName);

      try {
        await fsExtra.ensureDir(destDir);
        await fsExtra.copy(sourcePath, destPath);
        await setWallpaper(destPath);
        event.reply('upload-success', fileName);
      } catch (err) {
        console.error("Yükleme Hatası:", err);
      }
    }
  });

  // Hazır Resim Ayarlama
  ipcMain.on('set-wallpaper', async (event, fileName) => {
    const imagePath = path.join(__dirname, 'Backgrounds', fileName);
    try {
      await setWallpaper(imagePath);
    } catch (err) {
      console.error("Hata:", err);
    }
  });
}

module.exports = { initWallpaperManager };