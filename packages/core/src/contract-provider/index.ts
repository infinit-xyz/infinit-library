import { DirectoryNotFoundError } from '@/errors/fs'
import fs from 'fs'
import path from 'path'
import { runSpawn } from 'src/utils/child-process'

export class ContractProvider {
  constructor() {}

  public async compile(contractDirectory: string, callback: (contractIdx: number, success: boolean) => void) {
    const isContractDirectoryExist = fs.existsSync(contractDirectory)
    if (!isContractDirectoryExist) {
      throw new DirectoryNotFoundError(contractDirectory)
    }

    // read only the contract folders
    const directories = fs.readdirSync(contractDirectory, { withFileTypes: true })
    const contracts = directories.filter((dir) => dir.isDirectory()).map((dir) => dir.name)

    for (let contractIdx = 0; contractIdx < contracts.length; contractIdx++) {
      const contract = contracts[contractIdx]!
      const configFile = path.join(contractDirectory, contract, 'hardhat.config.cjs')
      if (!fs.existsSync(configFile)) continue

      const args = ['compile', '--config', configFile]

      await runSpawn(
        'npx hardhat',
        args,
        {
          stdio: [
            'pipe', // stdIn
            'pipe', // stdOut
            'pipe', // stdErr
          ],
          shell: true,
        },
        {
          onStdErr: (data: Buffer) => {
            // do not log warning
            if (data.includes('Warning')) return
            console.log(`Error: ${data}`, data.includes('Warning'))
          },
          onClose: (code: number) => {
            // code === 0 means success
            callback(
              contractIdx, // index
              code === 0 ? true : false, // success
            )
          },
        },
      )
    }
  }
}
