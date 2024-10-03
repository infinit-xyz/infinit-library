import axios from 'axios'

import { Address } from 'viem'

import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan.js'

export const getContractCreationCode = async (instance: Etherscan, address: Address) => {
  // get deployment tx from etherscan
  const parameters = new URLSearchParams({
    apiKey: instance.apiKey!,
    module: 'account',
    action: 'txlist',
    startblock: '0',
    endblock: 'latest',
    sort: 'asc',
    address,
  })
  const url = new URL(instance.apiUrl)
  url.search = parameters.toString()
  let contractCreationCode: string = ''
  await axios
    .get(url.toString())
    .then((response: any) => {
      const data = response.data
      for (const tx of data.result) {
        // find contract creation tx
        if (tx.to === '') {
          contractCreationCode = tx.input
          break
        }
      }
    })
    .catch((error: any) => {
      throw new Error(error)
    })
  if (contractCreationCode === '') {
    throw new Error(`No contract creation code found for contract at address ${address}`)
  }
  return contractCreationCode
}
