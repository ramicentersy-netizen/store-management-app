import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import db, { initDatabase } from './database'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 1. تهيئة قاعدة البيانات أولاً
  initDatabase()

  // 2. معالجات الأوامر (IPC Handlers) للربط مع الواجهة
  ipcMain.handle('get-categories', () => {
    return db.prepare('SELECT * FROM categories').all()
  })

  ipcMain.handle('get-exchange-rate', () => {
    return db.prepare('SELECT * FROM exchange_rates ORDER BY id DESC LIMIT 1').get()
  })

  ipcMain.handle('set-exchange-rate', (_, rate: number) => {
    const stmt = db.prepare('INSERT INTO exchange_rates (usd_to_syp, date) VALUES (?, ?)')
    return stmt.run(rate, new Date().toISOString().split('T')[0])
  })

  ipcMain.handle('get-products', () => {
    return db.prepare(`
      SELECT p.*, c.name as category_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      ORDER BY p.id DESC
    `).all()
  })

  ipcMain.handle('add-product', (_, product) => {
    const stmt = db.prepare(`
      INSERT INTO products (name, category_id, sku, cost_price, cost_currency, sell_price, sell_currency, quantity, min_quantity_alert)
      VALUES (@name, @category_id, @sku, @cost_price, @cost_currency, @sell_price, @sell_currency, @quantity, @min_quantity_alert)
    `)
    return stmt.run(product)
  })

  ipcMain.handle('delete-product', (_, id: number) => {
    return db.prepare('DELETE FROM products WHERE id = ?').run(id)
  })

  // 3. فتح نافذة التطبيق
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})