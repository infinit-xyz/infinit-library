// NOTE: need to import like this for now to be compatible with hardhat commonjs
const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')
const { name } = require('../../package.json')
const remappings = [
  `@uniswap/v2-core/contracts=v2-core/contracts`,
  `@uniswap/v3-core/contracts=v3-core/contracts`,
  `@uniswap/v3-periphery/contracts=v3-periphery/contracts`,
  `@openzeppelin/contracts=@openzeppelin/contracts-4.7.0`,
]

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.8.17',
  settings: {
    viaIR: true,
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000_000,
    },
    metadata: {
      bytecodeHash: 'none',
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
