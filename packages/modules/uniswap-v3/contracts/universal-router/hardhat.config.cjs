// NOTE: need to import like this for now to be compatible with hardhat commonjs
const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')
const { name } = require('../../package.json')
const remappings = [`@openzeppelin/contracts=@openzeppelin/contracts-4.7.0`, `permit2/src=permit2/contracts`]

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
