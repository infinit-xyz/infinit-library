import { describe, expect, test } from 'vitest'
import { z } from 'zod'

import { InfinitWallet } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { TEST_ADDRESSES } from '@actions/__mock__/address'

import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('ActionUtils', () => {
  const bob = TEST_ADDRESSES.bob
  const tester = '0xFF1137243698CaA18EE364Cc966CF0e02A4e6327'
  const client = new TestInfinitWallet(TestChain.arbitrum, tester)

  describe('run', () => {
    const MockActionSchema = z.object({
      address: zodAddress,
      bigint: z.bigint(),
      string: z.string(),
      array: z.array(
        z.object({
          boolean: z.boolean(),
        }),
      ),
    })

    type MockActionParams = z.infer<typeof MockActionSchema>

    type MockData = {
      params: MockActionParams
      signer: Record<string, InfinitWallet>
    }

    const data: MockData = {
      params: {
        address: bob,
        bigint: 0n,
        string: '',
        array: [{ boolean: true }, { boolean: false }],
      },
      signer: {
        signer1: client,
        signer2: client,
        signer3: client,
      },
    }

    test('should validate successfully', () => {
      validateActionData(data, MockActionSchema, ['signer1', 'signer2', 'signer3'])
    })

    test('should failed validate signer', () => {
      expect(() => validateActionData(data, MockActionSchema, ['signer1', 'invalidSigner', 'signer3'])).toThrowError(
        `'invalidSigner' signer doesn't exist`,
      )
    })

    test('should failed validate undefined or null params', () => {
      const invalidData: MockData = {
        params: {
          address: undefined!,
          bigint: undefined!,
          string: null!,
          array: [],
        },
        signer: {
          signer1: client,
          signer2: client,
          signer3: client,
        },
      }
      expect(() => validateActionData(invalidData, MockActionSchema, ['signer1', 'signer2', 'signer3'])).toThrowError(
        new ValidateInputValueError(
          `- Field: address\n` +
            `  Error: 'undefined' is not a valid address\n` +
            `\n` +
            `- Field: bigint\n` +
            `  Error: Required\n` +
            `\n` +
            `- Field: string\n` +
            `  Error: Expected string, received null`,
        ),
      )
    })

    test('should failed validate address', () => {
      const invalidData: MockData = {
        params: {
          address: '0xNOTADDRESS',
          bigint: 0n,
          string: '',
          array: [{ boolean: true }, { boolean: false }],
        },
        signer: {
          signer1: client,
          signer2: client,
          signer3: client,
        },
      }
      expect(() => validateActionData(invalidData, MockActionSchema, ['signer1', 'signer2', 'signer3'])).toThrowError(
        `Please check your input params\n` + `- Field: address\n` + `  Error: '0xNOTADDRESS' is not a valid address`,
      )
    })
  })
})
