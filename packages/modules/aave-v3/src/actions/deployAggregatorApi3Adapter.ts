import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import {
  DeployAggregatorApi3AdapterSubAction,
  DeployAggregatorApi3AdapterSubActionParams,
} from '@actions/subactions/deployAggregatorApi3Adapter'

export const DeployAggregatorApi3AdapterActionParamsSchema = z.object({
  aggregatorApi3AdapterConfigs: z
    .array(
      z.object({
        name: z.string().describe('Name of the price pair'),
        dataFeedProxy: zodAddressNonZero.describe('Address of Api3 DataFeedProxy'),
      }),
    )
    .describe('List of the AggregatorApi3Adapter Configs'),
}) satisfies z.ZodType<DeployAggregatorApi3AdapterSubActionParams>

export type DeployAggregatorApi3AdapterActionParams = z.infer<typeof DeployAggregatorApi3AdapterActionParamsSchema>

export type DeployAggregatorApi3AdapterData = {
  params: DeployAggregatorApi3AdapterActionParams
  signer: Record<string, InfinitWallet>
}

export class DeployAggregatorApi3AdapterAction extends Action<DeployAggregatorApi3AdapterData> {
  constructor(data: DeployAggregatorApi3AdapterData) {
    validateActionData(data, DeployAggregatorApi3AdapterActionParamsSchema, ['deployer'])
    super(DeployAggregatorApi3AdapterAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params
    // return subactions
    return [new DeployAggregatorApi3AdapterSubAction(deployer, params)]
  }
}
