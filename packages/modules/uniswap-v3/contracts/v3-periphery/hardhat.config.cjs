/* eslint-disable @typescript-eslint/no-var-requires */
const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')
const { name } = require('../../package.json')

const remappings = [
  `@uniswap/v2-core/contracts=v2-core`,
  `@uniswap/v3-core/contracts=v3-core`,
  `@uniswap/lib/contracts=uni-lib`,
  `@openzeppelin/contracts=@openzeppelin/contracts@3.4.2-solc-0.7`,
]

const LOW_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 2_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const LOWEST_OPTIMIZER_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
    evmVersion: 'istanbul',
    optimizer: {
      enabled: true,
      runs: 1_000,
    },
    metadata: {
      bytecodeHash: 'none',
    },
  },
}

const DEFAULT_COMPILER_SETTINGS = {
  version: '0.7.6',
  settings: {
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
    overrides: {
      'v3-periphery/NonfungiblePositionManager.sol': LOW_OPTIMIZER_COMPILER_SETTINGS,
      'v3-periphery/test/MockTimeNonfungiblePositionManager.sol': LOW_OPTIMIZER_COMPILER_SETTINGS,
      'v3-periphery/test/NFTDescriptorTest.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'v3-periphery/NonfungibleTokenPositionDescriptor.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
      'v3-periphery/libraries/NFTDescriptor.sol': LOWEST_OPTIMIZER_COMPILER_SETTINGS,
    },
  },
}

module.exports = config
