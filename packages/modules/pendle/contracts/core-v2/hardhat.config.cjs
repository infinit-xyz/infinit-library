require('hardhat-contract-sizer')

const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')
const { name } = require('../../package.json')

function viaIR(version, runs) {
  return {
    version,
    settings: {
      optimizer: {
        enabled: true,
        runs: runs,
      },
      evmVersion: 'paris',
      viaIR: true,
    },
  }
}

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
    overrides: {
      'core-v2/contracts/router/ActionAddRemoveLiqV3.sol': viaIR('0.8.23', 10000),
      'core-v2/contracts/router/ActionMiscV3.sol': viaIR('0.8.23', 1000000),
      'core-v2/contracts/router/ActionSimple.sol': viaIR('0.8.23', 1000000),
      'core-v2/contracts/router/ActionSwapPTV3.sol': viaIR('0.8.23', 1000000),
      'core-v2/contracts/router/ActionSwapYTV3.sol': viaIR('0.8.23', 1000000),
      'core-v2/contracts/router/ActionCallbackV3.sol': viaIR('0.8.23', 1000000),
      'core-v2/contracts/router/PendleRouterV3.sol': viaIR('0.8.23', 1000000),
      'core-v2/contracts/limit/PendleLimitRouter.sol': viaIR('0.8.23', 1000000),
      'core-v2/contracts/core/Market/v3/PendleMarketV3.sol': viaIR('0.8.24', 1000000),
    },
  },
  contractSizer: {
    disambiguatePaths: false,
    runOnCompile: false,
    strict: true,
    only: [],
  },
}

module.exports = config
