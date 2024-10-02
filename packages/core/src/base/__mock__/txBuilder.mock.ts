import { TxBuilder } from '@base/txBuilder'

import { InfinitCallback, TransactionData } from '@/types'

import { ValidateInputValueError } from '@errors/index'
import { InfinitWallet } from '@infinit-wallet/index'

export class MockTxBuilder extends TxBuilder {
  success: boolean

  constructor(client: InfinitWallet, success = true) {
    super(MockTxBuilder.name, client)

    this.success = success
  }

  public async validate(): Promise<void> {
    if (!this.success) throw new ValidateInputValueError('VALIDATION_FAILED')
  }

  protected async buildTx(_callback?: InfinitCallback): Promise<TransactionData> {
    return { to: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', data: '0x0' } as TransactionData
  }
}
