import { describe, expect, test } from 'vitest'

import { getContractCreationCode } from '../getContractCreationCode'
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan'

describe('getCreationCodeFromBlockExplorer', () => {
  const apiKey = 'U19FHTSVAE2MTBTG89IWKF6ERWW9VX9IY4'
  const apiUrl = 'https://api-sepolia.arbiscan.io/api'
  const url = 'https://sepolia.arbiscan.io'

  const instance = new Etherscan(apiKey, apiUrl, url)
  const address = '0x9a3c2b73adac0f85e04ea049df31ffc2a8e35401'
  const invalidAddress = '0x87646Ac012AC9ffbBc3A37ec516Bd0d661b408ed'

  test('deployed by eoa', async () => {
    // note: also check the snapshot with the actual value on block explorer for 1st time
    expect(getContractCreationCode(instance, address)).resolves.toMatchSnapshot()
  })

  test('deployed by contract', async () => {
    const expectedError = 'No contract creation code found for contract at address 0x87646Ac012AC9ffbBc3A37ec516Bd0d661b408ed'
    expect(getContractCreationCode(instance, invalidAddress)).rejects.toThrowError(expectedError)
  })
})
