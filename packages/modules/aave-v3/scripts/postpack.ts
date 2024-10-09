import { $ } from 'bun'

import { linkContractDirectory } from '../../../../scripts/linkContracts'

const targetRepositories: string[] = ['aave-v3-core', 'aave-v3-periphery']

await Promise.all(
  targetRepositories.map(async (repo: string) => {
    await $`rm -r contracts/${repo}/contracts`
  }),
)

await targetRepositories.map(async (repo) => {
  linkContractDirectory(`../../../node_modules/${repo}/contracts`, `${repo}/contracts`)
})
