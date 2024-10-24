import { describe, expect, test, vi } from 'vitest'

import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'

import { GetMerkleTreeProofsOffChainAction, GetMerkleTreeProofsOffChainActionParams } from '@offChainActions/getMerkleTreeProofs'

describe('GetMerkleTreeProofsOffChainAction', () => {
  describe('run', () => {
    test('should run successfully', async () => {
      const action = new GetMerkleTreeProofsOffChainAction()

      const params: GetMerkleTreeProofsOffChainActionParams = {
        userRewardMapping: {
          [TEST_ADDRESSES.bob]: '10',
          [TEST_ADDRESSES.tester]: '1',
        },
      }

      const result = await action.run({}, params)

      expect(result.message).toBe('Generate Merkle Tree Proofs Successfully')
      expect(result.data).toMatchSnapshot()
    })

    test('should throw error if user input 0 successfully', async () => {
      const action = new GetMerkleTreeProofsOffChainAction()

      const params: GetMerkleTreeProofsOffChainActionParams = {
        userRewardMapping: {
          [TEST_ADDRESSES.bob]: '10',
          [TEST_ADDRESSES.tester]: '0',
        },
      }

      await expect(action.run({}, params)).rejects.toThrowError(ValidateInputValueError)
    })

    test('should handle callback correctly', async () => {
      const action = new GetMerkleTreeProofsOffChainAction()

      const params: GetMerkleTreeProofsOffChainActionParams = {
        userRewardMapping: {
          [TEST_ADDRESSES.bob]: '10',
          [TEST_ADDRESSES.tester]: '1',
        },
      }

      const callback = vi.fn()

      await action.run({}, params, callback)

      expect(callback).toHaveBeenCalledWith('start', { message: 'Get Merkle Tree Proofs' })
      expect(callback).toHaveBeenCalledWith('progress', {
        currentStep: 1,
        totalSteps: 2,
        message: 'Validating data',
      })
      expect(callback).toHaveBeenCalledWith('progress', {
        currentStep: 2,
        totalSteps: 2,
        message: 'Generating Merkle Tree Proofs',
      })
      expect(callback).toHaveBeenCalledWith('finish')
    })
  })
})
