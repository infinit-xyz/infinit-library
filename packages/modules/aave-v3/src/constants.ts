import path from 'path'
import { fileURLToPath } from 'url'

import { keccak256, toBytes } from 'viem'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
export const moduleDir = path.resolve(dirname, '..')

export const INCENTIVES_CONTROLLER_ID = keccak256(toBytes('INCENTIVES_CONTROLLER'))
