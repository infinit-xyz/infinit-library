const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')
const { name } = require('../../package.json')
require('@nomicfoundation/hardhat-verify')

const config = {
  ...baseHardhatUserConfig(__dirname, name),
  solidity: {
    compilers: [
      {
        version: '0.8.10',
        settings: {
          optimizer: { enabled: true, runs: 100_000 },
          evmVersion: 'berlin',
        },
      },
      {
        version: '0.7.5',
        settings: {
          optimizer: { enabled: true, runs: 100_000 },
        },
      },
    ],
  },
}

module.exports = config
