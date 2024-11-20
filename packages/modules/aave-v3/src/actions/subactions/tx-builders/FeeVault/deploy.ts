import { Address, Hex, encodeDeployData, getAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployFeeVaultTxBuilderParams {
  wrappedNativeToken: Address
  admin: Address
  treasury: Address
}

type FeeInfo = {
  admin: Address
  treasury: Address
  feeBps: bigint
}

export class DeployFeeVaultTxBuilder extends TxBuilder {
  private wrappedNativeToken: Address
  private initCapitalDefaultAdmin: Address = '0x0b5e09bfff17b7ab0765dd077e69982cd554c567'
  private initCapitalFeeBps: bigint = 1_000n
  private feeInfos: FeeInfo[]

  constructor(client: InfinitWallet, params: DeployFeeVaultTxBuilderParams) {
    super(DeployFeeVaultTxBuilder.name, client)
    this.wrappedNativeToken = getAddress(params.wrappedNativeToken)
    this.feeInfos = [
      {
        admin: this.initCapitalDefaultAdmin,
        treasury: this.initCapitalDefaultAdmin,
        feeBps: this.initCapitalFeeBps,
      },
      {
        admin: getAddress(params.admin),
        treasury: getAddress(params.treasury),
        feeBps: 9_000n,
      },
    ]
  }

  async buildTx(): Promise<TransactionData> {
    const feeVaultArtifact = await readArtifact('FeeVault')

    const deployData: Hex = encodeDeployData({
      abi: feeVaultArtifact.abi,
      bytecode: feeVaultArtifact.bytecode as Hex,
      args: [this.wrappedNativeToken, this.feeInfos],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    // check that sum of feeBps is 10_000
    const sumFeeBps = this.feeInfos.reduce((acc, feeInfo) => acc + feeInfo.feeBps, 0n)
    if (sumFeeBps !== 10_000n) throw new Error('total feeBps must be 10_000')
  }
}
