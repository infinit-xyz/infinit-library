import { MockSubAction } from '@/base/__mock__/subAction.mock'
import { MockActionData, MockRegistry } from '@base/__mock__/type.mock'
import { Action } from '@base/action'

export class MockAction extends Action<MockActionData, MockRegistry> {
  constructor(data: MockActionData) {
    super(MockAction.name, data)
  }

  protected override getSubActions(): MockSubAction[] {
    const client = this.data.signer.dev // mock up to use only dev wallet
    return [new MockSubAction(client, true), new MockSubAction(client, true), new MockSubAction(client, true)]
  }
}
