import { name as coreName, version as coreVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { GetContractInfoError, VerifyContractError } from '@errors/contractVerifier'

describe('VerifyContractError', () => {
  const fakeContractName = 'FAKE_NAME'
  const fakeContractAddress = zeroAddress

  test('should match snapshot', () => {
    expect(new VerifyContractError(fakeContractName, fakeContractAddress)).toMatchInlineSnapshot(`
        [VerifyContractError: Failed to verify contract ${fakeContractName} on the block explorer at contract address: ${fakeContractAddress}

        ${coreName}: ${coreVersion}]
    `)
  })

  test('should match snapshot with additional error', () => {
    const fakeError = new Error('FAKE_ERROR')

    expect(new VerifyContractError(fakeContractName, fakeContractAddress, fakeError)).toMatchInlineSnapshot(`
      [VerifyContractError: Failed to verify contract ${fakeContractName} on the block explorer at contract address: ${fakeContractAddress}
      Error: ${fakeError}

      ${coreName}: ${coreVersion}]
  `)
  })
})

describe('GetContractInfoError', () => {
  const fakeContractAddress = zeroAddress

  test('should match snapshot', () => {
    expect(new GetContractInfoError(fakeContractAddress)).toMatchInlineSnapshot(`
        [GetContractInfoError: Failed to get contract information for ${fakeContractAddress}

        ${coreName}: ${coreVersion}]
    `)
  })

  test('should match snapshot with additional error', () => {
    const fakeError = new Error('FAKE_ERROR')

    expect(new GetContractInfoError(fakeContractAddress, fakeError)).toMatchInlineSnapshot(`
      [GetContractInfoError: Failed to get contract information for ${fakeContractAddress}
      Error: ${fakeError}

      ${coreName}: ${coreVersion}]
  `)
  })
})
