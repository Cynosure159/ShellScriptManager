const { execSync } = require('child_process');
const path = require('path');

exports.default = async function (context) {
  if (context.electronPlatformName === 'darwin') {
    const appPath = path.join(
      context.appOutDir,
      `${context.packager.appInfo.productFilename}.app`
    );
    console.log(`\n  • [afterSign] Forcing deep Ad-Hoc signature on: ${appPath}`);
    try {
      // Forcefully replace all signatures (outer app + inner frameworks) with Ad-Hoc
      execSync(`codesign --force --deep --sign - "${appPath}"`);
      console.log('  • [afterSign] Ad-Hoc deep signature applied successfully.\n');
    } catch (e) {
      console.error('  • [afterSign] Failed to force deep sign:', e);
    }
  }
};
