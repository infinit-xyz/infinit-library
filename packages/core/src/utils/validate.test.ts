import { describe, expect, test } from 'vitest'
import { ZodError, z } from 'zod'

import { MOCK_ZOD_ERROR, MOCK_ZOD_ERROR_UNDEFINED } from './__mocks__/validate.test.constant'
import { formatZodError, validateActionData } from '@/utils/validate'
import { zodAddress } from '@/utils/zod'
import { ValidateInputValueError } from '@errors/index'
import { InfinitWallet } from '@infinit-wallet/index'
import { TestChain, TestInfinitWallet } from '@infinit-xyz/test'

describe('utils/validate.ts', () => {
  const bob = '0x0000000000000000000000000000000000000B0b'
  const tester = '0xFF1137243698CaA18EE364Cc966CF0e02A4e6327'
  const client = new TestInfinitWallet(TestChain.arbitrum, tester) as unknown as InfinitWallet

  describe('validateActionData', () => {
    const MockActionSchema = z.object({
      address: zodAddress,
      decimals: z.bigint(),
      symbol: z.string(),
      fakeList: z.array(z.object({ isFake: z.boolean() })),
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
        decimals: 0n,
        symbol: '',
        fakeList: [{ isFake: true }],
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
          decimals: undefined!,
          symbol: null!,
          fakeList: [{ isFake: undefined! }],
          array: [],
        },
        signer: {
          signer1: client,
          signer2: client,
          signer3: client,
        },
      }
      expect(() => validateActionData(invalidData, MockActionSchema, ['signer1', 'signer2', 'signer3'])).toThrowError(
        new ValidateInputValueError(formatZodError(MOCK_ZOD_ERROR_UNDEFINED)),
      )
    })

    test('should failed validate address', () => {
      const invalidData = {
        params: {
          address: '0xNOTADDRESS',
          decimals: 0n,
          symbol: '',
          fakeList: [{ isFake: 'some text'! }],
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
          formatZodError(
            new ZodError([
              {
                code: 'custom',
                message: "'0xNOTADDRESS' is not a valid address",
                fatal: true,
                path: ['address'],
              },
              {
                code: 'invalid_type',
                expected: 'boolean',
                received: 'string',
                path: ['fakeList', 0, 'isFake'],
                message: 'Expected boolean, received string',
              },
            ]),
          ),
        ),
      )
    })
  })
})

describe('formatZodError', () => {
  test('should format zod error', () => {
    const formattedZodError = formatZodError(MOCK_ZOD_ERROR)

    expect(formattedZodError).toStrictEqual(
      `- Field: address\n` +
        `  Error: 'undefined' is not a valid address\n` +
        `\n` +
        `- Field: decimals\n` +
        `  Error: Required\n` +
        `\n` +
        `- Field: symbol\n` +
        `  Error: Expected string, received null\n` +
        `\n` +
        `- Field: fakeList[0]["isFake"]\n` +
        `  Error: Expected boolean, received string`,
    )
  })
})
