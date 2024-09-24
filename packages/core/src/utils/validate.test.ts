import { describe, expect, test } from 'vitest'
import { ZodError, z } from 'zod'

import { InfinitWallet } from '@/infinit-wallet'
import { validateActionData } from '@/utils/validate'
import { zodAddress } from '@/utils/zod'
import { ValidateInputValueError } from '@errors/index'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('utils/validate.ts', () => {
  const bob = '0x0000000000000000000000000000000000000B0b'
  const tester = '0xFF1137243698CaA18EE364Cc966CF0e02A4e6327'
  const client = new TestInfinitWallet(TestChain.arbitrum, tester) as unknown as InfinitWallet

  describe('validateActionData', () => {
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
          new ZodError([
            {
              code: 'custom',
              message: "'undefined' is not a valid address",
              fatal: true,
              path: ['address'],
            },
            {
              code: 'invalid_type',
              expected: 'bigint',
              received: 'undefined',
              path: ['bigint'],
              message: 'Required',
            },
            {
              code: 'invalid_type',
              expected: 'string',
              received: 'null',
              path: ['string'],
              message: 'Expected string, received null',
            },
          ]).message,
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
        new ValidateInputValueError(
          new ZodError([
            {
              code: 'custom',
              message: "'0xNOTADDRESS' is not a valid address",
              fatal: true,
              path: ['address'],
            },
          ]).message,
        ),
      )
    })
  })
})
