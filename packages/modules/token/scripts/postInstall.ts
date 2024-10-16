// symlink aave-v3 related contracts from node_modules to our package
import { linkContractDirectory } from '../../../../scripts/linkContracts'

// NOTE: order matters
const targetRepositories = ['infinit-erc20-contracts']

for (const repo of targetRepositories) {
  await linkContractDirectory(`../../../node_modules/${repo}/contracts`, `${repo}/contracts`)
}
