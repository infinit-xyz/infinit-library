const { name } = require('../../package.json')
// NOTE: need to import like this for now to be compatible with hardhat commonjs
const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')

const config = {
  ...baseHardhatUserConfig(__dirname, name),
  solidity: {
    compilers: [
      {
        version: '0.8.23',
        settings: {
          optimizer: { enabled: true, runs: 90000 },
          evmVersion: 'paris',
        },
      },
    ],
  },
}

module.exports = config
