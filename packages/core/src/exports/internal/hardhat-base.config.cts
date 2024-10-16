import 'hardhat-preprocessor'
import path from 'path'

import { HardhatUserConfig } from 'hardhat/types'

if (process.env.ENABLE_HARDHAT_TOOLBOX === 'true') {
  require('@nomicfoundation/hardhat-toolbox-viem')
}

function parseRemappings(remappings: string[]) {
  return remappings.map((mapping: string) => mapping.split('='))
}

// root directory will be ..modules/<module name>/contracts
const baseHardhatUserConfig = (contractDir: string, name: string, remappings?: string[]): HardhatUserConfig => {
  const projectRoot = process.cwd()

  return {
    preprocess: {
      eachLine: (_hre: any) => ({
        transform: (line: string) => {
          // only transform if remappings defined
          if (remappings && (line.match(/".*.sol";$/) || line.match(/'.*.sol';$/))) {
            for (const [find, replace] of parseRemappings(remappings)) {
              if (line.match('"' + find)) {
                line = line.replace('"' + find, '"' + replace) // handle double quote
              } else if (line.match("'" + find)) {
                line = line.replace("'" + find, "'" + replace) // handle single quote
              }
            }
          }
          return line
        },
      }),
    },
    paths: {
      sources: `./${path.basename(contractDir)}`,
      root: path.resolve(contractDir, '..'),
      cache: path.join(projectRoot, `cache/${path.basename(name)}`),
      artifacts: path.join(projectRoot, `artifacts/${path.basename(name)}`),
    },
  }
}

export { baseHardhatUserConfig }
