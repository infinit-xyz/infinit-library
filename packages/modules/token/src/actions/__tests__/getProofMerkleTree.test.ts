import { describe, expect, test } from 'vitest'

import { ValidateInputValueError, ValueNotFoundError } from '@infinit-xyz/core/errors'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { GetProofMerkleTreeAction } from '@actions/getProofMerkleTree'

import { TokenRegistry } from '@/src/type'

describe('GetProofMerkleTreeAction', () => {
  const mockRegistry: TokenRegistry = {}

  describe('run', () => {
    test('should throw error if user not found in the reward list', async () => {
      const action = new GetProofMerkleTreeAction({
        params: {
          userRewardMapping: {
            [TEST_ADDRESSES.bob]: '10',
            [TEST_ADDRESSES.tester2]: '0',
          },
          userAddress: TEST_ADDRESSES.tester,
        },
        signer: {},
      })

      await expect(() => action.run(mockRegistry)).rejects.toThrowError(
        new ValueNotFoundError(`${TEST_ADDRESSES.tester} not found in the reward list`),
      )
    })

    test("should throw error if user's reward is zero", async () => {
      const action = new GetProofMerkleTreeAction({
        params: {
          userRewardMapping: {
            [TEST_ADDRESSES.bob]: '10',
            [TEST_ADDRESSES.tester]: '1',
            [TEST_ADDRESSES.tester2]: '0',
          },
          userAddress: TEST_ADDRESSES.tester2,
        },
        signer: {},
      })

      await expect(() => action.run(mockRegistry)).rejects.toThrowError(
        new ValidateInputValueError(`Reward of ${TEST_ADDRESSES.tester2} is 0`),
      )
    })

    test('should run action successfully', async () => {
      const action = new GetProofMerkleTreeAction({
        params: {
          userRewardMapping: {
            [TEST_ADDRESSES.bob]: '10',
            [TEST_ADDRESSES.tester]: '1',
            [TEST_ADDRESSES.tester2]: '0',
          },
          userAddress: TEST_ADDRESSES.bob,
        },
        signer: {},
      })

      const registry = await action.run(mockRegistry)
      const expectedRegistry = {
        ...registry,
        merkleTree: {
          ...registry.merkleTree,
          root: '0x3dbc5fd91fdc6a572ce889ebbc726bd5678d1a32165f0db32cded07c9a77c7c4',
          merkle: {
            ...registry.merkleTree?.merkle,
            [TEST_ADDRESSES.bob]: {
              amount: '10',
              proof: ['0x501517036a8c1fce5bd062c4ccba23045287462e8b50f7bd1c0794083488e9ce'],
            },
          },
        },
      }

      expect(registry).toStrictEqual(expectedRegistry)
    })
  })
})
