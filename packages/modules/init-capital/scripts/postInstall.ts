// symlink aave-v3 related contracts from node_modules to our package
import { linkContractDirectory } from '../../../../scripts/linkContracts'

// NOTE: order matters
const targetRepositories = ['init-capital']

await linkContractDirectory(`../../../node_modules/fee-vault/src`, `fee-vault/contracts`)

for (const repo of targetRepositories) {
  await linkContractDirectory(`../../../node_modules/${repo}/contracts`, `${repo}/contracts`)
}
