import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData } from '@infinit-xyz/core/internal'

import {
  DeployLsdApi3ProxyOracleReaderMsg,
  DeployLsdApi3ProxyOracleReaderSubAction,
} from '@actions/subactions/deployLsdApi3ProxyOracleReader'
import {
  DeployLsdApi3ProxyOracleProxySubAction,
  DeployLsdApi3ProxyOracleReaderProxyMsg,
} from '@actions/subactions/deployLsdApi3ProxyOracleReaderProxy'
import { InitializeLsdApi3ProxyOracleReaderSubAction } from '@actions/subactions/initializeLsdApi3ProxyOracleReader'

import { InitCapitalRegistry } from '@/src/type'

export type deployLsdApi3ProxyOracleReaderActionData = {
  params: {}
  signer: Record<'deployer', InfinitWallet>
}

export class DeployLsdApi3ProxyOracleReaderAction extends Action<deployLsdApi3ProxyOracleReaderActionData, InitCapitalRegistry> {
  constructor(data: deployLsdApi3ProxyOracleReaderActionData) {
    validateActionData(data, z.object({}), ['deployer'])
    super(DeployLsdApi3ProxyOracleReaderAction.name, data)
  }
  protected getSubActions(registry: InitCapitalRegistry): ((message: any) => SubAction)[] {
    const deployer = this.data.signer['deployer']

    // validate registry
    if (!registry.accessControlManager) throw new ValidateInputValueError('registry: accessControlManager not found')
    if (!registry.proxyAdmin) throw new ValidateInputValueError('registry: proxyAdmin not found')
    if (!registry.api3ProxyOracleReaderProxy) throw new ValidateInputValueError('registry: api3ProxyOracleReaderProxy not found')

    const accessControlManager = registry.accessControlManager
    const proxyAdmin = registry.proxyAdmin
    const api3ProxyOracleReaderProxy = registry.api3ProxyOracleReaderProxy

    // return subactions
    return [
      // deploy implementation
      () => {
        return new DeployLsdApi3ProxyOracleReaderSubAction(deployer, {
          accessControlManager: accessControlManager,
        })
      },
      // deploy transparent proxy and set implementation
      (message: DeployLsdApi3ProxyOracleReaderMsg) => {
        return new DeployLsdApi3ProxyOracleProxySubAction(deployer, {
          lsdApi3ProxyOracleReaderImpl: message.lsdApi3ProxyOracleReaderImpl,
          proxyAdmin: proxyAdmin,
        })
      },
      // initialize lsd api3 proxy oracle reader
      (message: DeployLsdApi3ProxyOracleReaderProxyMsg) => {
        return new InitializeLsdApi3ProxyOracleReaderSubAction(deployer, {
          api3ProxyOracleReader: api3ProxyOracleReaderProxy,
          lsdApi3ProxyOracleReaderProxy: message.lsdApi3ProxyOracleReaderProxy,
        })
      },
    ]
  }
}
