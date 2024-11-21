import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import {
  DeployLsdApi3ProxyOracleReaderMsg,
  DeployLsdApi3ProxyOracleReaderSubAction,
  DeployLsdApi3ProxyOracleReaderSubActionParams,
} from '@actions/subactions/deployLsdApi3ProxyOracleReader'
import {
  DeployLsdApi3ProxyOracleProxySubAction,
  DeployLsdApi3ProxyOracleReaderProxyMsg,
} from '@actions/subactions/deployLsdApi3ProxyOracleReaderProxy'
import { InitializeLsdApi3ProxyOracleReaderSubAction } from '@actions/subactions/initializeLsdApi3ProxyOracleReader'

import { InitCapitalRegistry } from '@/src/type'

export const DeployLsdApi3ProxyOracleReaderActionParamsSchema = z.object({
  accessControlManager: zodAddressNonZero,
  proxyAdmin: zodAddressNonZero,
  api3ProxyOracleReader: zodAddressNonZero,
}) satisfies z.ZodType<DeployLsdApi3ProxyOracleReaderSubActionParams>

export type DeployLsdApi3ProxyOracleReaderActionParams = z.infer<typeof DeployLsdApi3ProxyOracleReaderActionParamsSchema>

export type deployApi3ProxyOracleReaderActionData = {
  params: DeployLsdApi3ProxyOracleReaderActionParams
  signer: Record<'deployer', InfinitWallet>
}

export class DeployLsdApi3ProxyOracleReaderAction extends Action<deployApi3ProxyOracleReaderActionData, InitCapitalRegistry> {
  constructor(data: deployApi3ProxyOracleReaderActionData) {
    validateActionData(data, DeployLsdApi3ProxyOracleReaderActionParamsSchema, ['deployer'])
    super(DeployLsdApi3ProxyOracleReaderAction.name, data)
  }
  protected getSubActions(): ((message: any) => SubAction)[] {
    const deployer = this.data.signer['deployer']
    const deployApi3ProxyOracleReaderActionParams: DeployLsdApi3ProxyOracleReaderActionParams = this.data.params

    // return subactions
    return [
      // deploy implementation
      () => new DeployLsdApi3ProxyOracleReaderSubAction(deployer, deployApi3ProxyOracleReaderActionParams),
      // deploy transparent proxy and set implementation
      (message: DeployLsdApi3ProxyOracleReaderMsg) =>
        new DeployLsdApi3ProxyOracleProxySubAction(deployer, {
          lsdApi3ProxyOracleReaderImpl: message.lsdApi3ProxyOracleReaderImpl,
          proxyAdmin: this.data.params.accessControlManager,
        }),
      // initialize lsd api3 proxy oracle reader
      (message: DeployLsdApi3ProxyOracleReaderProxyMsg) =>
        new InitializeLsdApi3ProxyOracleReaderSubAction(deployer, {
          api3ProxyOracleReader: this.data.params.api3ProxyOracleReader,
          lsdApi3ProxyOracleReaderProxy: message.lsdApi3ProxyOracleReaderProxy,
        }),
    ]
  }
}
