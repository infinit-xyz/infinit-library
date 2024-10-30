// delete copied contracts from running `prepack` script, then link the contracts from node_modules to our package
import { $ } from 'bun'

import { linkContractDirectory } from '../../../../scripts/linkContracts'

const targetRepositories: string[] = ['init-capital']

await Promise.all(
  targetRepositories.map(async (repo: string) => {
    await $`rm -r contracts/${repo}/contracts`
  }),
)

await linkContractDirectory(`../../../node_modules/fee-vault/src`, `fee-vault/contracts`)

await targetRepositories.map(async (repo) => {
  linkContractDirectory(`../../../node_modules/${repo}/contracts`, `${repo}/contracts`)
})
