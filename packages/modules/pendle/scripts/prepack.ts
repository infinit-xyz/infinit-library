// change linked contracts to original files
import { $ } from 'bun'
import fs from 'fs'

const targetRepositories: string[] = ['core-v2', 'openzeppelin']

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
