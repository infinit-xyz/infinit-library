import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'
import { GetProofMerkleTreeAction } from '@actions/getProofMerkleTree'

import type { TokenRegistry } from '@/src/type'

describe('GetProofMerkleTreeAction', () => {
  const mockRegistry: TokenRegistry = {}

  describe('run', () => {
    test('should run action successfully', async () => {
      const action = new GetProofMerkleTreeAction({
        params: {
          userRewardMapping: {
            [TEST_ADDRESSES.bob]: '10',
            [TEST_ADDRESSES.tester]: '1',
            [TEST_ADDRESSES.tester2]: '0',
          },
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
            [TEST_ADDRESSES.tester]: {
              amount: '1',
              proof: [
                '0xab45e7b6acbd7538194487b1919bf18bee6b3f8288a2dfc2e0477ab3edfe5a9f',
                '0xafc6f8fb50c5343cc92a27103f4957af79694fe75477c9f9cb2234403abb205b',
              ],
            },
          },
        },
      }

      expect(registry).toStrictEqual(expectedRegistry)
    })
  })
})
