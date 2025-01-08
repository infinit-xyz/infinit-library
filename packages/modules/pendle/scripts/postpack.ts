// delete copied contracts from running `prepack` script, then link the contracts from node_modules to our package
import { $ } from 'bun'

import { linkContractDirectory } from '../../../../scripts/linkContracts'

const targetRepositories: string[] = ['core-v2', 'openzeppelin']

await Promise.all(
  targetRepositories.map(async (repo: string) => {
    await $`rm -r contracts/${repo}/contracts`
  }),
)

await linkContractDirectory(`../../../node_modules/fee-vault/src`, `fee-vault/contracts`)

await linkContractDirectory(`../../../node_modules/@pendle/core-v2/contracts`, `core-v2/contracts`)
await linkContractDirectory(`../../../node_modules/@openzeppelin/contracts-4.9.3`, `openzeppelin/contracts`)
