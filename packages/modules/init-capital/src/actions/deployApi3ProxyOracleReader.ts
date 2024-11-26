import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData } from '@infinit-xyz/core/internal'

import { DeployApi3ProxyOracleReaderMsg, DeployApi3ProxyOracleReaderSubAction } from '@actions/subactions/deployApi3ProxyOracleReader'
import { DeployApi3ProxyOracleProxySubAction } from '@actions/subactions/deployApi3ProxyOracleReaderProxy'

import { InitCapitalRegistry } from '@/src/type'

export type deployApi3ProxyOracleReaderActionData = {
  params: {}
  signer: Record<'deployer', InfinitWallet>
}

export class DeployApi3ProxyOracleReaderAction extends Action<deployApi3ProxyOracleReaderActionData, InitCapitalRegistry> {
  constructor(data: deployApi3ProxyOracleReaderActionData) {
    validateActionData(data, z.object({}), ['deployer'])
    super(DeployApi3ProxyOracleReaderAction.name, data)
  }
  protected getSubActions(registry: InitCapitalRegistry): ((message: any) => SubAction)[] {
    const deployer = this.data.signer['deployer']

    // validate registry
    if (!registry.accessControlManager) throw new ValidateInputValueError('registry: accessControlManager not found')
    if (!registry.proxyAdmin) throw new ValidateInputValueError('registry: proxyAdmin not found')

    const proxyAdmin = registry.proxyAdmin
    const accessControlmanager = registry.accessControlManager

    // return subactions
    return [
      // deploy implementation
      () =>
        new DeployApi3ProxyOracleReaderSubAction(deployer, {
          accessControlManager: accessControlmanager,
        }),
      // deploy transparent proxy and set implementation
      (message: DeployApi3ProxyOracleReaderMsg) =>
        new DeployApi3ProxyOracleProxySubAction(deployer, {
          api3ProxyOracleReaderImpl: message.api3ProxyOracleReaderImpl,
          proxyAdmin: proxyAdmin,
        }),
    ]
  }
}
