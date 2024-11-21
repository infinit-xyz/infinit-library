import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import {
  DeployLsdApi3ProxyOracleReaderMsg,
  DeployLsdApi3ProxyOracleReaderSubAction,
  DeployLsdApi3ProxyOracleReaderSubActionParams,
} from '@actions/subactions/deployLsdApi3ProxyOracleReader'
import { DeployLsdApi3ProxyOracleProxySubAction } from '@actions/subactions/deployLsdApi3ProxyOracleReaderProxy'

import { InitCapitalRegistry } from '@/src/type'

export const DeployApi3ProxyOracleReaderActionParamsSchema = z.object({
  accessControlManager: zodAddressNonZero,
  proxyAdmin: zodAddressNonZero,
}) satisfies z.ZodType<DeployLsdApi3ProxyOracleReaderSubActionParams>

export type DeployApi3ProxyOracleReaderActionParams = z.infer<typeof DeployApi3ProxyOracleReaderActionParamsSchema>

export type deployApi3ProxyOracleReaderActionData = {
  params: DeployApi3ProxyOracleReaderActionParams
  signer: Record<'deployer', InfinitWallet>
}

export class DeployLsdApi3ProxyOracleReaderAction extends Action<deployApi3ProxyOracleReaderActionData, InitCapitalRegistry> {
  constructor(data: deployApi3ProxyOracleReaderActionData) {
    validateActionData(data, DeployApi3ProxyOracleReaderActionParamsSchema, ['deployer'])
    super(DeployLsdApi3ProxyOracleReaderAction.name, data)
  }
  protected getSubActions(): ((message: any) => SubAction)[] {
    const deployer = this.data.signer['deployer']
    const deployApi3ProxyOracleReaderActionParams: DeployApi3ProxyOracleReaderActionParams = this.data.params

    // return subactions
    return [
      // deploy implemLsdentation
      () => new DeployLsdApi3ProxyOracleReaderSubAction(deployer, deployApi3ProxyOracleReaderActionParams),
      // deploy transparent proxy and set implementation
      (message: DeployLsdApi3ProxyOracleReaderMsg) =>
        new DeployLsdApi3ProxyOracleProxySubAction(deployer, {
          lsdApi3ProxyOracleReaderImpl: message.lsdApi3ProxyOracleReaderImpl,
          proxyAdmin: this.data.params.accessControlManager,
        }),
    ]
  }
}
