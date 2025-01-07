// symlink pendle related contracts from node_modules to our package
import { linkContractDirectory } from '../../../../scripts/linkContracts'

await linkContractDirectory(`../../../node_modules/@pendle/core-v2/contracts`, `core-v2/contracts`)
