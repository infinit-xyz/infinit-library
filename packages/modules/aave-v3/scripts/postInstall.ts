// symlink aave-v3 related contracts from node_modules to our package
import { linkContractDirectory } from '../../../../scripts/linkContracts'

const targetRepositories = ['aave-v3-core', 'aave-v3-periphery']

await linkContractDirectory(`../../../node_modules/fee-vault/src`, `fee-vault/contracts`)

targetRepositories.forEach(async (repo) => {
  linkContractDirectory(`../../../node_modules/${repo}/contracts`, `${repo}/contracts`)
})
