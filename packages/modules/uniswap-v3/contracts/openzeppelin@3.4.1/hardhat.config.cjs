const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')
const { name } = require('../../package.json')

const remappings = [`@openzeppelin/contracts=@openzeppelin/contracts-3.4.1-solc-0.7-2`]

const config = {
  ...baseHardhatUserConfig(__dirname, name, remappings),
  solidity: {
    compilers: [
      {
        version: '0.7.4',
        settings: {
          optimizer: { enabled: false, runs: 200 },
        },
      },
    ],
  },
}

module.exports = config
