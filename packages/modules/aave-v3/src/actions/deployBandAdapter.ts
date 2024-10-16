import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { DeployBandAdapterSubAction, DeployBandAdapterSubActionParams } from '@actions/subactions/deployBandAdapter'

export const DeployBandAdapterActionParamsSchema = z.object({
  ref: zodAddressNonZero,
  bandAdapterConfigs: z
    .array(
      z.object({
        name: z.string().describe('The name of the adapter, this name will be used exclusively to retrieve the deployed address from the registry for subsequent use'),
        base: z.string().describe('String of the base'),
        quote: z.string().describe('String of the quote'),
      }),
    )
    .describe(
      'List of the BandAdapter Configs. Access https://data.bandprotocol.com to find the base and quote, for example, "ETH/USD" is the base/quote for ETH and USD.',
    ),
}) satisfies z.ZodType<DeployBandAdapterSubActionParams>

export type DeployBandAdapterActionParams = z.infer<typeof DeployBandAdapterActionParamsSchema>

export type DeployBandAdapterData = {
  params: DeployBandAdapterActionParams
  signer: Record<string, InfinitWallet>
}

export class DeployBandAdapterAction extends Action<DeployBandAdapterData> {
  constructor(data: DeployBandAdapterData) {
    validateActionData(data, DeployBandAdapterActionParamsSchema, ['deployer'])
    super(DeployBandAdapterAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params
    // return subactions
    return [new DeployBandAdapterSubAction(deployer, params)]
  }
}
