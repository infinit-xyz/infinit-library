import { describe, expect, test } from 'vitest'

import { TEST_ADDRESSES } from '@actions/__mocks__/address'

import { MerkleTree } from '@utils/merkleTree'

describe('MerkleTree', () => {
  const userRewardMapping = {
    [TEST_ADDRESSES.bob]: '10',
    [TEST_ADDRESSES.tester2]: '1',
  }
  const merkleTree = new MerkleTree(userRewardMapping)

  test('should generate merkle tree', () => {
    expect(merkleTree).toBeDefined()
  })

  test('should get user proof', () => {
    const proof = merkleTree.getProof(TEST_ADDRESSES.bob)
    expect(proof).toStrictEqual({ proof: ['0x1a5a273d0e0c8fb2ed1bfd5be5d3e9eb8b4a500adc6ded4c6c631675318cab01'], amount: '10' })
  })

  test('should get root', () => {
    const root = merkleTree.getRoot()
    expect(root).toStrictEqual('0xc01db72fd209df572d072b401355810ce6a11a078f8299460420fa5fe3c21103')
  })

  test('should get all proofs', () => {
    const proofs = merkleTree.getAllProofs()

    const expectedProofs = {
      [TEST_ADDRESSES.bob]: {
        amount: '10',
        proof: ['0x1a5a273d0e0c8fb2ed1bfd5be5d3e9eb8b4a500adc6ded4c6c631675318cab01'],
      },
      [TEST_ADDRESSES.tester2]: {
        amount: '1',
        proof: ['0xafc6f8fb50c5343cc92a27103f4957af79694fe75477c9f9cb2234403abb205b'],
      },
    }

    expect(proofs).toStrictEqual(expectedProofs)
  })
})
