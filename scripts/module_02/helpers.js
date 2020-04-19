const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path')
const os = require('os')

function persistKeyPair (keyData) {
  return new Promise((resolve, reject) => {
    const keyPath = path.join(os.homedir(), '.ssh', keyData.KeyName)
    const options = {
      encoding: 'utf8',
      mode: 0o600
    }

    if (fs.existsSync(keyPath)) {
      resolve(keyData.KeyName);
      return;
    }

    fs.writeFile(keyPath, keyData.KeyMaterial, options, (err) => {
      if (err) reject(err)
      else {
        console.log('Key written to', keyPath)
        resolve(keyData.KeyName);
        return;
      }
    })
  })
}

function readKeyPair (keyName) {
  const keyPath = path.join(os.homedir(), '.ssh', keyName);
  const options = 'utf8';
  return fsPromises.readFile(keyPath, options);
}

module.exports = {
  persistKeyPair,
  readKeyPair,
}
