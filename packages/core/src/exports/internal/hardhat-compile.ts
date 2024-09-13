import fs from 'fs'
import path from 'path'

import { ContractProvider } from '@/contract-provider'

// get only arguments from argv
const args = process.argv.slice(2)
if (args.length !== 1) console.log('Expected one argument.')

// get dir and contracts
const contractDirectory = path.resolve(args[0], 'contracts')
const contracts = fs.readdirSync(contractDirectory)

// callback to run after compiled contract
const callback = (contractIdx: number, success: boolean) => {
  console.log(`${contracts[contractIdx]} compiled: ${success}`)
}

// compile contracts
const provider = new ContractProvider()
console.log('Compiling...')
provider.compile(contractDirectory, callback)
