const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

// 暴露给 window 的方法
window.saveFile = (fileName, content) => {
  try {
    const downloadsPath = utools.getPath('downloads')
    const filePath = path.join(downloadsPath, fileName)
    fs.writeFileSync(filePath, content)
    utools.shellShowItemInFolder(filePath)
    return { success: true, filePath }
  } catch (err) {
    console.error('保存文件失败:', err)
    return { success: false, error: err.message }
  }
}

window.copyText = (text) => {
  try {
    utools.copyText(text)
    return { success: true }
  } catch (err) {
    console.error('复制文本失败:', err)
    return { success: false, error: err.message }
  }
}

window.copyImage = (dataUrl) => {
  try {
    utools.copyImage(dataUrl)
    return { success: true }
  } catch (err) {
    console.error('复制图片失败:', err)
    return { success: false, error: err.message }
  }
}

// 监听主题变化
ipcRenderer.on('theme-change', (event, isDark) => {
  if (document.body) {
    document.body.style.backgroundColor = isDark ? '#0d1117' : '#ffffff'
    document.body.style.color = isDark ? '#c9d1d9' : '#24292f'
  }
})

// 暴露 utools API 给 window，以便 preview.html 使用 dbStorage
window.utools = utools

