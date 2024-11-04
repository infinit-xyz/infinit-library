import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import {
  DeployPythOracleReaderMsg,
  DeployPythOracleReaderSubAction,
  DeployPythOracleReaderSubActionParams,
} from '@actions/subactions/deployPythOracleReader'
import { DeployPythOracleReaderProxyMsg, DeployPythOracleReaderProxySubAction } from '@actions/subactions/deployPythOracleReaderProxy'
import { InitializePythOracleReaderSubAction } from '@actions/subactions/initializePythOracle'

import { InitCapitalRegistry } from '@/src/type'

export const DeployPythOracleReaderActionParamsSchema = z.object({
  accessControlManager: zodAddressNonZero.describe('Access control manager address in the registry'),
  proxyAdmin: zodAddressNonZero.describe('Proxy admin address in the registry'),
  pyth: zodAddressNonZero.describe(
    'Pyth address to be used for fetching oracle data checkout https://docs.pyth.network/price-feeds/contract-addresses/evm',
  ),
}) satisfies z.ZodType<DeployPythOracleReaderSubActionParams>

export type DeployPythOracleReaderActionParams = z.infer<typeof DeployPythOracleReaderActionParamsSchema>

export type deployPythOracleReaderActionData = {
  params: DeployPythOracleReaderActionParams
  signer: Record<string, InfinitWallet>
}

export class DeployPythOracleReaderAction extends Action<deployPythOracleReaderActionData, InitCapitalRegistry> {
  constructor(data: deployPythOracleReaderActionData) {
    validateActionData(data, DeployPythOracleReaderActionParamsSchema, ['deployer'])
    super(DeployPythOracleReaderAction.name, data)
  }
  protected getSubActions(): ((message: any) => SubAction)[] {
    const deployer = this.data.signer['deployer']
    const deployPythOracleReaderActionParams: DeployPythOracleReaderActionParams = this.data.params

    // return subactions
    return [
      // deploy implementation
      () => new DeployPythOracleReaderSubAction(deployer, deployPythOracleReaderActionParams),
      // deploy transparent proxy and set implementation
      (message: DeployPythOracleReaderMsg) =>
        new DeployPythOracleReaderProxySubAction(deployer, {
          pythOracleReaderImpl: message.pythOracleReaderImpl,
          proxyAdmin: this.data.params.accessControlManager,
        }),
      // initialize the proxy
      (message: DeployPythOracleReaderMsg & DeployPythOracleReaderProxyMsg) =>
        new InitializePythOracleReaderSubAction(deployer, {
          pythOracleReaderProxy: message.pythOracleReaderProxy,
          pyth: this.data.params.pyth,
        }),
    ]
  }
}
