import { Address, Hex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'
import { ContractNotFoundError } from '@infinit-xyz/core/errors'

import { DeployATokenTxBuilder } from '@actions/subactions/tx-builders/aToken/deployAToken'
import { DeployDelegationAwareATokenTxBuilder } from '@actions/subactions/tx-builders/delegationAwareAToken/deployDelegationAwareAToken'
import { DeployL2EncoderTxBuilder } from '@actions/subactions/tx-builders/l2Encoder/deployL2Encoder'
import { DeployStableDebtTokenTxBuilder } from '@actions/subactions/tx-builders/stableDebtToken/deployStableDebtToken'
import { DeployVariableDebtTokenTxBuilder } from '@actions/subactions/tx-builders/variableDebtToken/deployVariableDebtToken'
import { DeployWrappedTokenGatewayV3TxBuilder } from '@actions/subactions/tx-builders/wrappedTokenGatewayV3/deployWrappedTokenGatewayV3'

import { AaveV3Registry } from '@/src/type'

export type DeployAaveV3Contracts_5SubActionParams = {
  poolAddressesProvider: Address
  wrappedNativeToken: Address
  wrappedTokenGatewayOwner: Address
  poolProxy: Address
}

export type DeployAaveV3Contracts_5SubActionMsg = {
  wrappedTokenGatewayV3: Address
  l2Encoder: Address
  aToken: Address
  delegationAwareAToken: Address
  stableDebtToken: Address
  variableDebtToken: Address
}

export class DeployAaveV3Contracts_5SubAction extends SubAction<
  DeployAaveV3Contracts_5SubActionParams,
  AaveV3Registry,
  DeployAaveV3Contracts_5SubActionMsg
> {
  constructor(client: InfinitWallet, params: DeployAaveV3Contracts_5SubActionParams) {
    super(DeployAaveV3Contracts_5SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // deploy native token gateway deploy  4 pool proxy
    const deployWrappedTokenGatewayV3TxBuilder = new DeployWrappedTokenGatewayV3TxBuilder(this.client, {
      wrappedNativeTokenAddress: this.params.wrappedNativeToken,
      owner: this.params.wrappedTokenGatewayOwner,
      pool: this.params.poolProxy,
    })
    this.txBuilders.push(deployWrappedTokenGatewayV3TxBuilder)

    // deploy L2 encoder
    const deployL2EncoderTxBuilder = new DeployL2EncoderTxBuilder(this.client, { poolProxy: this.params.poolProxy })
    this.txBuilders.push(deployL2EncoderTxBuilder)

    // deploy Atoken
    const deployAToken = new DeployATokenTxBuilder(this.client, { pool: this.params.poolProxy })
    this.txBuilders.push(deployAToken)

    // deploy delegation aware Atoken
    const deployDelegationAwareAToken = new DeployDelegationAwareATokenTxBuilder(this.client, { pool: this.params.poolProxy })
    this.txBuilders.push(deployDelegationAwareAToken)

    // deploy stable debt token
    const deployStableDebtToken = new DeployStableDebtTokenTxBuilder(this.client, { pool: this.params.poolProxy })
    this.txBuilders.push(deployStableDebtToken)

    // deploy stable variable token
    const deployVariableDebtToken = new DeployVariableDebtTokenTxBuilder(this.client, { pool: this.params.poolProxy })
    this.txBuilders.push(deployVariableDebtToken)
  }

  public async updateRegistryAndMessage(
    registry: AaveV3Registry,
    txHashes: Hex[],
  ): Promise<SubActionExecuteResponse<AaveV3Registry, DeployAaveV3Contracts_5SubActionMsg>> {
    const [
      deployWrappedTokenGatewayV3Hash,
      deployL2EncoderHash,
      deployATokenImplHash,
      deployDelegationAwareAToken,
      deployStableDebtToken,
      deployVariableDebtToken,
    ] = txHashes
    const { contractAddress: wrappedTokenGatewayV3 } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployWrappedTokenGatewayV3Hash,
    })
    if (!wrappedTokenGatewayV3) {
      throw new ContractNotFoundError(deployWrappedTokenGatewayV3Hash, 'wrappedTokenGatewayV3')
    }
    registry['wrappedTokenGatewayV3'] = wrappedTokenGatewayV3

    const { contractAddress: l2Encoder } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployL2EncoderHash })
    if (!l2Encoder) {
      throw new ContractNotFoundError(deployL2EncoderHash, 'l2Encoder')
    }
    registry['l2Encoder'] = l2Encoder

    const { contractAddress: aTokenImpl } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployATokenImplHash })
    if (!aTokenImpl) {
      throw new ContractNotFoundError(deployATokenImplHash, 'AToken')
    }
    registry['aTokenImpl'] = aTokenImpl

    const { contractAddress: delegationAwareAToken } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployDelegationAwareAToken,
    })
    if (!delegationAwareAToken) {
      throw new ContractNotFoundError(deployDelegationAwareAToken, 'delegationAwareAToken')
    }
    registry['delegationAwareATokenImpl'] = delegationAwareAToken

    const { contractAddress: stableDebtToken } = await this.client.publicClient.waitForTransactionReceipt({ hash: deployStableDebtToken })
    if (!stableDebtToken) {
      throw new ContractNotFoundError(deployStableDebtToken, 'stableDebtToken')
    }
    registry['stableDebtTokenImpl'] = stableDebtToken

    const { contractAddress: variableDebtToken } = await this.client.publicClient.waitForTransactionReceipt({
      hash: deployVariableDebtToken,
    })
    if (!variableDebtToken) {
      throw new ContractNotFoundError(deployVariableDebtToken, 'variableDebtToken')
    }
    registry['variableDebtTokenImpl'] = variableDebtToken

    const newMessage = {
      wrappedTokenGatewayV3: wrappedTokenGatewayV3,
      l2Encoder: l2Encoder,
      aToken: aTokenImpl,
      delegationAwareAToken: delegationAwareAToken,
      stableDebtToken: stableDebtToken,
      variableDebtToken: variableDebtToken,
    }

    return { newRegistry: registry, newMessage: newMessage }
  }
}
