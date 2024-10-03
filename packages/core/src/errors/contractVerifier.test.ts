import { name as coreName, version as coreVersion } from 'package.json'
import { describe, expect, test } from 'vitest'

import { zeroAddress } from 'viem'

import { VerifyContractError } from '@/errors/contractVerifier'

describe('VerifyContractError', () => {
  const fakeContractName = 'FAKE_NAME'
  const faceContractAddress = zeroAddress

  test('should match snapshot', () => {
    expect(new VerifyContractError(fakeContractName, faceContractAddress)).toMatchInlineSnapshot(`
        [VerifyContractError: Failed to verify contract ${fakeContractName} on the block explorer at contract address: ${faceContractAddress}

        ${coreName}: ${coreVersion}]
    `)
  })

  test('should match snapshot with message', () => {
    const fakeMessage = 'FAKE_MESSAGE'

    expect(new VerifyContractError(fakeContractName, faceContractAddress, fakeMessage)).toMatchInlineSnapshot(`
      [VerifyContractError: Failed to verify contract ${fakeContractName} on the block explorer at contract address: ${faceContractAddress}
      Message: ${fakeMessage}

      ${coreName}: ${coreVersion}]
  `)
  })
})
