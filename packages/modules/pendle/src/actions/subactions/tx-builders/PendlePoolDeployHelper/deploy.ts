import { Address, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputZeroAddressError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export interface DeployPendlePoolDeployHelperTxBuilderParams {
  router: Address
  yieldContractFactory: Address
  marketFactor: Address
}

export class DeployPendlePoolDeployHelperTxBuilder extends TxBuilder {
  public router: Address
  public yieldContractFactory: Address
  public marketFactor: Address

  constructor(client: InfinitWallet, params: DeployPendlePoolDeployHelperTxBuilderParams) {
    super(DeployPendlePoolDeployHelperTxBuilder.name, client)
    this.router = getAddress(params.router)
    this.yieldContractFactory = getAddress(params.yieldContractFactory)
    this.marketFactor = getAddress(params.marketFactor)
  }

  async buildTx(): Promise<TransactionData> {
    const pendlePoolDeployHelperArtifact = await readArtifact('PendlePoolDeployHelper')

    const deployData = encodeDeployData({
      abi: pendlePoolDeployHelperArtifact.abi,
      bytecode: pendlePoolDeployHelperArtifact.bytecode,
      args: [this.router, this.yieldContractFactory, this.marketFactor],
    })

    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.router === zeroAddress) throw new ValidateInputZeroAddressError('ROUTER')
    if (this.yieldContractFactory === zeroAddress) throw new ValidateInputZeroAddressError('YIELD_CONTRACT_FACTORY')
    if (this.marketFactor === zeroAddress) throw new ValidateInputZeroAddressError('MARKET_FACTOR')
  }
}
