import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData } from '@infinit-xyz/core/internal'

import { SetPoolConfigSubAction } from '@actions/subactions/setPoolConfig'
import { SetPoolConfigTxBuilderParams } from '@actions/subactions/tx-builders/Config/setPoolConfig'

import { InitCapitalRegistry } from '@/src/type'

export const SetPoolConfigParamsSchema = z.object({
  batchPoolConfigParams: z.custom<Omit<SetPoolConfigTxBuilderParams, 'config'>[]>().describe(`pool config parameters`),
})

export type SetPoolConfigParams = z.infer<typeof SetPoolConfigParamsSchema>

export type SetPoolConfigActionData = {
  params: SetPoolConfigParams
  signer: Record<'guardian', InfinitWallet>
}

export class SetPoolConfigAction extends Action<SetPoolConfigActionData, InitCapitalRegistry> {
  constructor(data: SetPoolConfigActionData) {
    validateActionData(data, SetPoolConfigParamsSchema, ['guardian'])
    super(SetPoolConfigAction.name, data)
  }

  protected getSubActions(registry: InitCapitalRegistry): SubAction[] {
    const guardian = this.data.signer['guardian']

    // validate registry
    if (!registry.configProxy) throw new ValidateInputValueError('registry: configProxy not found')
    const configProxy = registry.configProxy

    return [
      new SetPoolConfigSubAction(guardian, {
        config: configProxy,
        batchPoolConfigParams: this.data.params.batchPoolConfigParams,
      }),
    ]
  }
}
