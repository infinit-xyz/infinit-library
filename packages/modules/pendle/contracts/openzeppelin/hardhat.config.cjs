const { name } = require('../../package.json')
// NOTE: need to import like this for now to be compatible with hardhat commonjs
const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')

const remappings = [
  `@openzeppelin-contracts/=@openzeppelin/contracts-4.9.3/`,
]

const config = {
  ...baseHardhatUserConfig(__dirname, name, remappings),
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
