import { linkContractDirectory } from '../../../../scripts/linkContracts'

const targetRepositories = ['aave-v3-core', 'aave-v3-periphery']

targetRepositories.forEach(async (repo) => {
  linkContractDirectory(`../../../node_modules/${repo}/contracts`, `${repo}/contracts`)
})
