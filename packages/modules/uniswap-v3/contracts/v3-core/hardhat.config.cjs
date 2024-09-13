/* eslint-disable @typescript-eslint/no-var-requires */
const { baseHardhatUserConfig } = require('@infinit-xyz/core/internal/hardhat-base-config')
const { name } = require('../../package.json')

const config = {
  ...baseHardhatUserConfig(__dirname, name),
  solidity: {
    compilers: [
      {
        version: '0.7.6',
        settings: {
          optimizer: { enabled: true, runs: 800 },
          metadata: {
            // do not include the metadata hash, since this is machine dependent
            // and we want all generated code to be deterministic
            // https://docs.soliditylang.org/en/v0.7.6/metadata.html
            bytecodeHash: 'none',
          },
        },
      },
    ],
  },
}

module.exports = config
