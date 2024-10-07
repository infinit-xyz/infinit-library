import { $ } from 'bun'
import { existsSync } from 'fs'

const CWD = process.cwd()
const targetRepositories = ['aave-v3-core', 'aave-v3-periphery']

targetRepositories.forEach(async (repo) => {
  process.chdir(`../../../node_modules/${repo}/contracts`)
  const contract = process.cwd()
  process.chdir(`${CWD}`)

  if (existsSync(`${CWD}/contracts/${repo}/contracts`)) {
    console.log(`${repo} exists`)
  } else {
    console.log(`${repo} does not exist, creating folder`)
    const target = `${process.cwd()}/contracts/${repo}/contracts`
    // go back to the original directory (clean state)
    process.chdir(`${CWD}`)

    const source = `${contract}`
    console.log({ source: source })
    console.log({ target: target })
    await $`ln -s ${source} ${target}`
  }
})
