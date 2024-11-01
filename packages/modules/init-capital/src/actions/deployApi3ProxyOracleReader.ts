import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import {
  DeployApi3ProxyOracleReaderSubAction,
  DeployApi3ProxyOracleReaderSubActionParams,
} from '@actions/subactions/deployApi3ProxyOracleReader'

import { InitCapitalRegistry } from '@/src/type'

export const DeployApi3ProxyOracleReaderActionParamsSchema = z.object({
  accessControlManager: zodAddressNonZero,
}) satisfies z.ZodType<DeployApi3ProxyOracleReaderSubActionParams>

export type DeployApi3ProxyOracleReaderActionParams = z.infer<typeof DeployApi3ProxyOracleReaderActionParamsSchema>

export type deployApi3ProxyOracleReaderActionData = {
  params: DeployApi3ProxyOracleReaderActionParams
  signer: Record<string, InfinitWallet>
}

export class DeployApi3ProxyOracleReaderAction extends Action<deployApi3ProxyOracleReaderActionData, InitCapitalRegistry> {
  constructor(data: deployApi3ProxyOracleReaderActionData) {
    validateActionData(data, DeployApi3ProxyOracleReaderActionParamsSchema, ['deployer'])
    super(DeployApi3ProxyOracleReaderAction.name, data)
  }
  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['deployer']
    const params = this.data.params

    // return subactions
    return [new DeployApi3ProxyOracleReaderSubAction(deployer, params)]
  }
}
