const { ipcRenderer } = require('electron')
const fs = require('fs')
const path = require('path')

// 暴露给 window 的方法
window.saveFile = (fileName, content) => {
  try {
    const downloadsPath = utools.getPath('downloads')
    const filePath = path.join(downloadsPath, fileName)
    fs.writeFileSync(filePath, content)
    utools.showNotification(`文件已保存至: ${filePath}`)
    utools.shellShowItemInFolder(filePath)
    return true
  } catch (err) {
    console.error('保存文件失败:', err)
    utools.showNotification('保存文件失败: ' + err.message)
    return false
  }
}

window.copyText = (text) => {
  utools.copyText(text)
  utools.showNotification('已复制到剪贴板')
}

window.copyImage = (dataUrl) => {
  utools.copyImage(dataUrl)
  utools.showNotification('图片已复制到剪贴板')
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

