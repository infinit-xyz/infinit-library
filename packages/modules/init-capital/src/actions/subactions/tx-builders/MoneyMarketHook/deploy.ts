import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployMoneyMarketHookTxBuilderParams {
  initCore: Address
  wrappedNativeToken: Address
  accessControlManager: Address
}

export class DeployMoneyMarketHookTxBuilder extends TxBuilder {
  private initCore: Address
  private wrappedNativeToken: Address
  private accessControlManager: Address

  constructor(client: InfinitWallet, params: DeployMoneyMarketHookTxBuilderParams) {
    super(DeployMoneyMarketHookTxBuilder.name, client)
    this.initCore = getAddress(params.initCore)
    this.wrappedNativeToken = getAddress(params.wrappedNativeToken)
    this.accessControlManager = getAddress(params.accessControlManager)
  }

  async buildTx(): Promise<TransactionData> {
    const moneyMarketHookArtifact = await readArtifact('MoneyMarketHook')

    const deployData: Hex = encodeDeployData({
      abi: moneyMarketHookArtifact.abi,
      bytecode: moneyMarketHookArtifact.bytecode as Hex,
      args: [this.initCore, this.wrappedNativeToken, this.accessControlManager],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.initCore === zeroAddress) throw new ValidateInputZeroAddressError('INIT_CORE')
    if (this.wrappedNativeToken === zeroAddress) throw new ValidateInputZeroAddressError('WRAPPED_NATIVE_TOKEN')
    if (this.accessControlManager === zeroAddress) throw new ValidateInputZeroAddressError('ACCESS_CONTROL_MANAGER')
  }
}
