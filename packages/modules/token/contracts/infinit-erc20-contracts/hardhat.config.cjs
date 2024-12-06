const { name } = require('../../package.json')
// NOTE: need to import like this for now to be compatible with hardhat commonjs
const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')

const remappings = [`@openzeppelin/contracts/=@openzeppelin/contracts-5.0.0/`]

const config = {
  ...baseHardhatUserConfig(__dirname, name, remappings),
  solidity: {
    compilers: [
      {
        version: '0.8.24',
        settings: {
          optimizer: { enabled: true, runs: 200 },
          evmVersion: 'cancun',
        },
      },
    ],
  },
}

module.exports = config
