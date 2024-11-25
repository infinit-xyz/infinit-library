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

export type deployApi3ProxyOracleReaderActionData = {
  params: {}
  signer: Record<'deployer', InfinitWallet>
}

export class DeployLsdApi3ProxyOracleReaderAction extends Action<deployApi3ProxyOracleReaderActionData, InitCapitalRegistry> {
  constructor(data: deployApi3ProxyOracleReaderActionData) {
    validateActionData(data, z.object({}), ['deployer'])
    super(DeployLsdApi3ProxyOracleReaderAction.name, data)
  }
  protected getSubActions(registry: InitCapitalRegistry): ((message: any) => SubAction)[] {
    const deployer = this.data.signer['deployer']

    // return subactions
    return [
      // deploy implementation
      () => {
        if (!registry.accessControlManager) throw new ValidateInputValueError('registry: accessControlManager not found')
        return new DeployLsdApi3ProxyOracleReaderSubAction(deployer, {
          accessControlManager: registry.accessControlManager,
        })
      },
      // deploy transparent proxy and set implementation
      (message: DeployLsdApi3ProxyOracleReaderMsg) => {
        if (!registry.proxyAdmin) throw new ValidateInputValueError('registry: proxyAdmin not found')
        return new DeployLsdApi3ProxyOracleProxySubAction(deployer, {
          lsdApi3ProxyOracleReaderImpl: message.lsdApi3ProxyOracleReaderImpl,
          proxyAdmin: registry.proxyAdmin,
        })
      },
      // initialize lsd api3 proxy oracle reader
      (message: DeployLsdApi3ProxyOracleReaderProxyMsg) => {
        if (!registry.api3ProxyOracleReaderProxy) throw new ValidateInputValueError('registry: api3ProxyOracleReaderProxy not found')
        return new InitializeLsdApi3ProxyOracleReaderSubAction(deployer, {
          api3ProxyOracleReader: registry.api3ProxyOracleReaderProxy,
          lsdApi3ProxyOracleReaderProxy: message.lsdApi3ProxyOracleReaderProxy,
        })
      },
    ]
  }
}
