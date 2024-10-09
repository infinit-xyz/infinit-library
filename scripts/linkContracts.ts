import { $ } from 'bun'
import { existsSync } from 'fs'

async function linkContractDirectory(sourceDirectory: string, targetDirectory: string) {
  const CWD = process.cwd()

  process.chdir(sourceDirectory)
  const contract = process.cwd()
  process.chdir(`${CWD}`)

  if (existsSync(`${CWD}/contracts/${targetDirectory}`)) {
    console.log(`${targetDirectory} exists in ${CWD}/contracts/${targetDirectory}`)
  } else {
    console.log(`${targetDirectory} does not exist, creating folder`)
    const target = `${process.cwd()}/contracts/${targetDirectory}`
    // go back to the original directory (clean state)
    process.chdir(`${CWD}`)

    const source = `${contract}`

    await $`ln -s ${source} ${target}`
  }
}

export { linkContractDirectory }
