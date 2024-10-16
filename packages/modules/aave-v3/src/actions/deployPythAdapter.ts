import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero, zodHex } from '@infinit-xyz/core/internal'

import { DeployPythAdapterSubAction, DeployPythAdapterSubActionParams } from '@actions/subactions/deployPythAdapter'

export const DeployPythAdapterActionParamsSchema = z.object({
  pyth: zodAddressNonZero,
  pythAdapterConfigs: z
    .array(
      z.object({
        name: z.string().describe('Name of the price id'),
        priceId: zodHex.describe('Price ID of the price pair'),
      }),
    )
    .describe('List of the PythAdapter Configs. Access https://www.pyth.network/developers/price-feed-ids to find the price id'),
}) satisfies z.ZodType<DeployPythAdapterSubActionParams>

export type DeployPythAdapterActionParams = z.infer<typeof DeployPythAdapterActionParamsSchema>

export type DeployPythAdapterData = {
  params: DeployPythAdapterActionParams
  signer: Record<string, InfinitWallet>
}

export class DeployPythAdapterAction extends Action<DeployPythAdapterData> {
  constructor(data: DeployPythAdapterData) {
    validateActionData(data, DeployPythAdapterActionParamsSchema, ['deployer'])
    super(DeployPythAdapterAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params
    // return subactions
    return [new DeployPythAdapterSubAction(deployer, params)]
  }
}
