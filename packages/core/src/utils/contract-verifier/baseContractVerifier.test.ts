import { describe, expect, test, vi } from 'vitest'

import { PublicClient } from 'viem'

import { Artifacts } from 'hardhat/types'

import { BaseContractVerifier } from './baseContractVerifier'
import { verifyContract } from './helper'
import { BlockExplorerParams, ContractInfo, ContractVerifierCallback } from './type'

vi.mock('./helper')

class MockContractVerifier extends BaseContractVerifier<object> {
  protected async getContracts(): Promise<ContractInfo[]> {
    return [
      { address: '0x123', constructorArgs: [] },
      { address: '0x123', constructorArgs: [] },
    ]
  }

  protected async getArtifacts(): Promise<Artifacts> {
    return {} as Artifacts
  }
}

describe('BaseContractVerifier', () => {
  test('should create an instance of BaseContractVerifier', () => {
    const client = vi.fn() as unknown as PublicClient
    const params: BlockExplorerParams = { apiUrl: 'https://api.url', url: 'https://url' }
    const verifier = new MockContractVerifier(client, params)

    expect(verifier).toBeInstanceOf(BaseContractVerifier)
  })

  test('should call verifyContract for each contract', async () => {
    const client = vi.fn() as unknown as PublicClient
    const params: BlockExplorerParams = { apiUrl: 'https://api.url', url: 'https://url' }
    const verifier = new MockContractVerifier(client, params)

    const callback: ContractVerifierCallback = vi.fn()
    const verifyContractSpy = vi.mocked(verifyContract)

    await verifier.verify({}, callback)

    expect(verifyContractSpy).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenCalledWith('contractVerificationInfo', { totalContracts: 2 })
  })
})
