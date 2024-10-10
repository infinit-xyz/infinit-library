import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import {
  DeployAggregatorBandAdapterSubAction,
  DeployAggregatorBandAdapterSubActionParams,
} from '@actions/subactions/deployAggregatorBandAdapter'

export const DeployAggregatorBandAdapterActionParamsSchema = z.object({
  ref: zodAddressNonZero,
  aggregatorBandAdapterConfigs: z
    .array(
      z.object({
        name: z.string().describe('Name of the price pair'),
        base: z.string().describe('String of the base'),
        quote: z.string().describe('String of the quote'),
      }),
    )
    .describe('List of the AggregatorBandAdapter Configs'),
}) satisfies z.ZodType<DeployAggregatorBandAdapterSubActionParams>

export type DeployAggregatorBandAdapterActionParams = z.infer<typeof DeployAggregatorBandAdapterActionParamsSchema>

export type DeployAggregatorBandAdapterData = {
  params: DeployAggregatorBandAdapterActionParams
  signer: Record<string, InfinitWallet>
}

export class DeployAggregatorBandAdapterAction extends Action<DeployAggregatorBandAdapterData> {
  constructor(data: DeployAggregatorBandAdapterData) {
    validateActionData(data, DeployAggregatorBandAdapterActionParamsSchema, ['deployer'])
    super(DeployAggregatorBandAdapterAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params
    // return subactions
    return [new DeployAggregatorBandAdapterSubAction(deployer, params)]
  }
}
