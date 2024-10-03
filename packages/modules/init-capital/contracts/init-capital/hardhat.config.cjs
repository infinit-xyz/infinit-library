const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')
const { name } = require('../../package.json')

const remappings = [
  `@openzeppelin-contracts/=@openzeppelin/contracts-4.9.3/`,
  `@openzeppelin-contracts-upgradeable/=@openzeppelin/contracts-upgradeable/`,
]

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.8.19',
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
  },
}

const config = {
  ...baseHardhatUserConfig(__dirname, name, remappings),
  solidity: {
    compilers: [DEFAULT_COMPILER_SETTINGS],
  },
}

module.exports = config
