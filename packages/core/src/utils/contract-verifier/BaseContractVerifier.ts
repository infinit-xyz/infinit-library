import { PublicClient } from 'viem'

import { Artifacts } from 'hardhat/types'

import { verifyContract } from './helper'
import { BlockExplorerParams, ContractInfo, ContractVerifierCallback } from './type'
import { Etherscan } from '@nomicfoundation/hardhat-verify/etherscan'

/**
 * Abstract base class for contract verification.
 *
 * @template R - The type of the registry object.
 */
export abstract class BaseContractVerifier<R extends object> {
  protected client: PublicClient
  protected etherscan: Etherscan

  /**
   * Creates an instance of BaseContractVerifier.
   *
   * @param client - The public client used for interactions.
   * @param params - The parameters for the block explorer.
   */
  constructor(client: PublicClient, params: BlockExplorerParams) {
    const parsedApiKey = params.apiKey ?? '' // TODO: test that we can use default value

    this.etherscan = new Etherscan(parsedApiKey, params.apiUrl, params.url)
    this.client = client
  }

  /**
   * Abstract method to get the contracts from the registry.
   *
   * @param registry - The registry object.
   * @returns A promise that resolves to an array of contract information.
   */
  protected abstract getContracts(registry: R): Promise<ContractInfo[]>

  /**
   * Abstract method to get the artifacts.
   *
   * @returns A promise that resolves to the artifacts.
   */
  protected abstract getArtifacts(): Promise<Artifacts>

  /**
   * Verifies the contracts in the registry.
   *
   * @param registry - The registry object.
   * @param callback - Optional callback for contract verification events.
   * @returns A promise that resolves when the verification is complete.
   */
  public async verify(registry: R, callback?: ContractVerifierCallback): Promise<void> {
    const contracts = await this.getContracts(registry)
    const artifacts = await this.getArtifacts()

    callback?.('contractVerificationInfo', { totalContracts: contracts.length })

    for (const contract of contracts) {
      await verifyContract(this.client, this.etherscan, artifacts, contract, callback)
    }
  }
}
