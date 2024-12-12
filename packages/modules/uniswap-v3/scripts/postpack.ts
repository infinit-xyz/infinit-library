// delete copied contracts from running `prepack` script, then link the contracts from node_modules to our package
import { $ } from 'bun'

import { linkContractDirectory } from '../../../../scripts/linkContracts'

const targetRepositories: string[] = ['lib', 'v3-core', 'v2-core', 'v3-periphery', 'v3-staker', 'swap-router-contracts', 'universal-router']

await Promise.all(
  targetRepositories.map(async (repo: string) => {
    await $`rm -r contracts/${repo}/contracts`
  }),
)

await linkContractDirectory(`../../../node_modules/permit2/src`, `permit2/contracts`)
await linkContractDirectory(`../../../node_modules/fee-vault/src`, `fee-vault/contracts`)

await targetRepositories.map(async (repo) => {
  linkContractDirectory(`../../../node_modules/@uniswap/${repo}/contracts`, `${repo}/contracts`)
})
