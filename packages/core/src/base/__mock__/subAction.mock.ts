import { SubAction } from '@base/subAction'

import { MockTxBuilder } from './txBuilder.mock'
import { MockRegistry, MockSubActionParams } from './type.mock'
import { ValidateInputValueError } from '@errors/index'
import { InfinitWallet } from '@infinit-wallet/index'

export class MockSubAction extends SubAction<MockSubActionParams, MockRegistry> {
  constructor(client: InfinitWallet, status: boolean) {
    super(MockSubAction.name, client, { status: status })
  }

  public override async internalValidate(): Promise<void> {
    if (this.params.status === false) {
      throw new ValidateInputValueError('Validation failed')
    }
  }

  protected setTxBuilders(): void {
    this.txBuilders = [new MockTxBuilder(this.client), new MockTxBuilder(this.client)]
  }

  protected async updateRegistryAndMessage(registry: MockRegistry, _txHashes: string[]): Promise<{ newRegistry: MockRegistry }> {
    return { newRegistry: registry }
  }
}
