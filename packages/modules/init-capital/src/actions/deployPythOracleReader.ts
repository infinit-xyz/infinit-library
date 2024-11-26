import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { DeployPythOracleReaderMsg, DeployPythOracleReaderSubAction } from '@actions/subactions/deployPythOracleReader'
import { DeployPythOracleReaderProxyMsg, DeployPythOracleReaderProxySubAction } from '@actions/subactions/deployPythOracleReaderProxy'
import { InitializePythOracleReaderSubAction } from '@actions/subactions/initializePythOracle'

import { InitCapitalRegistry } from '@/src/type'

export const DeployPythOracleReaderActionParamsSchema = z.object({
  pyth: zodAddressNonZero.describe(
    'Pyth address to be used for fetching oracle data checkout https://docs.pyth.network/price-feeds/contract-addresses/evm',
  ),
})

export type DeployPythOracleReaderActionParams = z.infer<typeof DeployPythOracleReaderActionParamsSchema>

export type DeployPythOracleReaderActionData = {
  params: DeployPythOracleReaderActionParams
  signer: Record<'deployer', InfinitWallet>
}

export class DeployPythOracleReaderAction extends Action<DeployPythOracleReaderActionData, InitCapitalRegistry> {
  constructor(data: DeployPythOracleReaderActionData) {
    validateActionData(data, DeployPythOracleReaderActionParamsSchema, ['deployer'])
    super(DeployPythOracleReaderAction.name, data)
  }
  protected getSubActions(registry: InitCapitalRegistry): ((message: any) => SubAction)[] {
    const deployer = this.data.signer['deployer']

    // validate registry
    if (!registry.accessControlManager) throw new ValidateInputValueError('registry: accessControlManager not found')
    if (!registry.proxyAdmin) throw new ValidateInputValueError('registry: proxyAdmin not found')

    const accessControlmanager = registry.accessControlManager
    const proxyAdmin = registry.proxyAdmin

    // return subactions
    return [
      // deploy implementation
      () =>
        new DeployPythOracleReaderSubAction(deployer, {
          accessControlManager: accessControlmanager,
        }),
      // deploy transparent proxy and set implementation
      (message: DeployPythOracleReaderMsg) =>
        new DeployPythOracleReaderProxySubAction(deployer, {
          pythOracleReaderImpl: message.pythOracleReaderImpl,
          proxyAdmin: proxyAdmin,
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
