import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { DeployApi3AdapterSubAction, DeployApi3AdapterSubActionParams } from '@actions/subactions/deployApi3Adapter'

export const DeployApi3AdapterActionParamsSchema = z.object({
  api3AdapterConfigs: z
    .array(
      z.object({
        name: z
          .string()
        .describe('The name of the adapter, this name will be used exclusively to retrieve the deployed address from the registry for subsequent use'),
        dataFeedProxy: zodAddressNonZero.describe('Address of Api3 DataFeedProxy.'),
      }),
    )
    .describe('List of the Api3Adapter Configs. Access https://market.api3.org to find the DataFeedProxy'),
}) satisfies z.ZodType<DeployApi3AdapterSubActionParams>

export type DeployApi3AdapterActionParams = z.infer<typeof DeployApi3AdapterActionParamsSchema>

export type DeployApi3AdapterData = {
  params: DeployApi3AdapterActionParams
  signer: Record<string, InfinitWallet>
}

export class DeployApi3AdapterAction extends Action<DeployApi3AdapterData> {
  constructor(data: DeployApi3AdapterData) {
    validateActionData(data, DeployApi3AdapterActionParamsSchema, ['deployer'])
    super(DeployApi3AdapterAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params
    // return subactions
    return [new DeployApi3AdapterSubAction(deployer, params)]
  }
}
