// symlink aave-v3 related contracts from node_modules to our package
import { linkContractDirectory } from '../../../../scripts/linkContracts'

// NOTE: order matters
const targetRepositories = [
  // 'permit2',
  'lib',
  'v3-core',
  'v2-core',
  'v3-periphery',
  'v3-staker',
  'swap-router-contracts',
  'universal-router',
]

linkContractDirectory(`../../../node_modules/permit2/src`, `permit2/src`)
// await Promise.all([
//   targetRepositories.map(async (repo) => {
//     linkContractDirectory(`../../../node_modules/@uniswap/${repo}/contracts`, `${repo}/contracts`)
//   }),
// ])

for (const repo of targetRepositories) {
  await linkContractDirectory(`../../../node_modules/@uniswap/${repo}/contracts`, `${repo}/contracts`)
}
