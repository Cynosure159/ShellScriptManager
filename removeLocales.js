exports.default = async function (context) {
  const fs = require('fs')
  const path = require('path')

  // Determine the locales path based on the platform
  let localeDir
  if (context.electronPlatformName === 'darwin') {
    // macOS path: App.app/Contents/Resources/
    localeDir = path.join(
      context.appOutDir,
      `${context.packager.appInfo.productFilename}.app`,
      'Contents',
      'Resources'
    )
  } else {
    // Windows/Linux path: /locales/
    localeDir = path.join(context.appOutDir, 'locales')
  }

  if (!fs.existsSync(localeDir)) return

  const files = fs.readdirSync(localeDir)

  for (const file of files) {
    // We only keep zh and en related content
    // Windows/Linux use .pak files, macOS uses .lproj directories
    const isZh = file.toLowerCase().includes('zh')
    const isEn = file.toLowerCase().includes('en')

    if (!isZh && !isEn) {
      // Additional safety check for macOS: only delete .lproj folders
      // For Windows/Linux: delete anything that isn't zh/en
      if (context.electronPlatformName === 'darwin' && !file.endsWith('.lproj')) {
        continue
      }

      const fullPath = path.join(localeDir, file)
      try {
        if (fs.lstatSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true })
        } else {
          fs.unlinkSync(fullPath)
        }
      } catch (e) {
        console.error(`Failed to delete locale: ${fullPath}`, e)
      }
    }
  }
}
