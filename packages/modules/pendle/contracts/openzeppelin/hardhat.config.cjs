require('hardhat-contract-sizer')

// import '@typechain/hardhat'

const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')
const { name } = require('../../package.json')

const config = {
  ...baseHardhatUserConfig(__dirname, name),

  solidity: {
    compilers: [
      {
        version: '0.8.23',
        settings: {
          optimizer: {
            enabled: true,
            runs: 0,
          },
          evmVersion: 'paris',
        },
      },
    ],
  },
  contractSizer: {
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
    only: [],
  },
}

module.exports = config
