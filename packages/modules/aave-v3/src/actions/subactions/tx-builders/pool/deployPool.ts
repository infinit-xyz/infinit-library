import { Libraries, resolveBytecodeWithLinkedLibraries } from '@nomicfoundation/hardhat-viem/internal/bytecode.js'
import { Address, Hex, encodeDeployData, getAddress, zeroAddress } from 'viem'

import { InfinitWallet, TransactionData, TxBuilder } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'

import { readArtifact } from '@/src/utils/artifact'

export type DeployPoolParams = {
  poolAddressesProvider: Address
  aaveProtocolDataProvider: Address
  liquidationLogic: Address
  supplyLogic: Address
  eModeLogic: Address
  flashLoanLogic: Address
  borrowLogic: Address
  bridgeLogic: Address
  poolLogic: Address
}

/**
 * @remarks
 * don't deploy this contract on L2
 */
export class DeployPool extends TxBuilder {
  private poolAddressesProvider: Address
  private liquidationLogic: Address
  private supplyLogic: Address
  private eModeLogic: Address
  private flashLoanLogic: Address
  private borrowLogic: Address
  private bridgeLogic: Address
  private poolLogic: Address

  constructor(client: InfinitWallet, params: DeployPoolParams) {
    super(DeployPool.name, client)
    this.poolAddressesProvider = getAddress(params.poolAddressesProvider)
    this.liquidationLogic = getAddress(params.liquidationLogic)
    this.supplyLogic = getAddress(params.supplyLogic)
    this.eModeLogic = getAddress(params.eModeLogic)
    this.flashLoanLogic = getAddress(params.flashLoanLogic)
    this.borrowLogic = getAddress(params.borrowLogic)
    this.bridgeLogic = getAddress(params.bridgeLogic)
    this.poolLogic = getAddress(params.poolLogic)
  }
  async buildTx(): Promise<TransactionData> {
    const poolArtifact = await readArtifact('Pool')

    const libraries: Libraries<Address> = {
      LiquidationLogic: this.liquidationLogic,
      SupplyLogic: this.supplyLogic,
      EModeLogic: this.eModeLogic,
      FlashLoanLogic: this.flashLoanLogic,
      BorrowLogic: this.borrowLogic,
      BridgeLogic: this.bridgeLogic,
      PoolLogic: this.poolLogic,
    }
    const bytecode: Hex = await resolveBytecodeWithLinkedLibraries(poolArtifact, libraries)
    const deployData = encodeDeployData({ abi: poolArtifact.abi, bytecode: bytecode, args: [this.poolAddressesProvider] })
    const tx: TransactionData = {
      data: deployData,
      to: null,
    }
    return tx
  }

  public async validate(): Promise<void> {
    if (this.poolAddressesProvider === zeroAddress) throw new ValidateInputValueError('PoolAddressesProvider cannot be zero address')
    if (this.liquidationLogic === zeroAddress) throw new ValidateInputValueError('LiquidationLogic cannot be zero address')
    if (this.supplyLogic === zeroAddress) throw new ValidateInputValueError('SupplyLogic cannot be zero address')
    if (this.eModeLogic === zeroAddress) throw new ValidateInputValueError('EModeLogic cannot be zero address')
    if (this.flashLoanLogic === zeroAddress) throw new ValidateInputValueError('FlashLoanLogic cannot be zero address')
    if (this.borrowLogic === zeroAddress) throw new ValidateInputValueError('BorrowLogic cannot be zero address')
    if (this.bridgeLogic === zeroAddress) throw new ValidateInputValueError('BridgeLogic cannot be zero address')
    if (this.poolLogic === zeroAddress) throw new ValidateInputValueError('PoolLogic cannot be zero address')
  }
}
