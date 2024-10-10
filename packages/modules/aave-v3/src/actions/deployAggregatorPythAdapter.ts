import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero, zodHex } from '@infinit-xyz/core/internal'

import {
  DeployAggregatorPythAdapterSubAction,
  DeployAggregatorPythAdapterSubActionParams,
} from '@actions/subactions/deployAggregatorPythAdapter'

export const DeployAggregatorPythAdapterActionParamsSchema = z.object({
  pyth: zodAddressNonZero,
  aggregatorPythAdapterConfigs: z
    .array(
      z.object({
        name: z.string().describe('Name of the price pair'),
        priceId: zodHex.describe('Price ID of the price pair'),
      }),
    )
    .describe('List of the AggregatorPythAdapter Configs'),
}) satisfies z.ZodType<DeployAggregatorPythAdapterSubActionParams>

export type DeployAggregatorPythAdapterActionParams = z.infer<typeof DeployAggregatorPythAdapterActionParamsSchema>

export type DeployAggregatorPythAdapterData = {
  params: DeployAggregatorPythAdapterActionParams
  signer: Record<string, InfinitWallet>
}

export class DeployAggregatorPythAdapterAction extends Action<DeployAggregatorPythAdapterData> {
  constructor(data: DeployAggregatorPythAdapterData) {
    validateActionData(data, DeployAggregatorPythAdapterActionParamsSchema, ['deployer'])
    super(DeployAggregatorPythAdapterAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params
    // return subactions
    return [new DeployAggregatorPythAdapterSubAction(deployer, params)]
  }
}
