import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getCategories: () => ipcRenderer.invoke('get-categories'),
  getExchangeRate: () => ipcRenderer.invoke('get-exchange-rate'),
  setExchangeRate: (rate: number) => ipcRenderer.invoke('set-exchange-rate', rate),
  getProducts: () => ipcRenderer.invoke('get-products'),
  addProduct: (product: any) => ipcRenderer.invoke('add-product', product),
  deleteProduct: (id: number) => ipcRenderer.invoke('delete-product', id)
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.api = api
}