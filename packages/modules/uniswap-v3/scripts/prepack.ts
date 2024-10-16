// change linked contracts to original files
import { $ } from 'bun'
import fs from 'fs'

const targetRepositories: string[] = [
  'permit2',
  'lib',
  'v3-core',
  'v2-core',
  'v3-periphery',
  'v3-staker',
  'swap-router-contracts',
  'universal-router',
]

const symLinks: string[] = []

targetRepositories.forEach(async (repo: string) => {
  // get original files path
  await fs.readlink(`contracts/${repo}/contracts`, async function (err, link) {
    console.log(err, link)
    symLinks.push(link)

    // unlink
    await $`unlink contracts/${repo}/contracts`

    // copy original files
    await $`cp -LR ${link} contracts/${repo}/contracts`
  })
})
