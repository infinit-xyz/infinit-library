import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { AcceptDefaultAdminTransferSubAction } from '@actions/subactions/acceptDefaultAdminTransfer'
import { AddGovernorSubAction } from '@actions/subactions/addGovernor'
import { AddGuardianSubAction } from '@actions/subactions/addGuardian'
import { DeployInitCapitalContracts1SubAction, DeployInitCapitalMsg } from '@actions/subactions/deployInitCapitalContracts1'
import { DeployInitCapitalContracts2SubAction, DeployInitCapitalMsg_2 } from '@actions/subactions/deployInitCapitalContracts2'
import { DeployInitCapitalContracts3SubAction, DeployInitCapitalMsg_3 } from '@actions/subactions/deployInitCapitalContracts3'
import { DeployInitCapitalContracts4SubAction, DeployInitCapitalMsg_4 } from '@actions/subactions/deployInitCapitalContracts4'
import { DeployInitCapitalContracts5SubAction, DeployInitCapitalMsg_5 } from '@actions/subactions/deployInitCapitalContracts5'
import { DeployInitCapitalContracts6SubAction, DeployInitCapitalMsg_6 } from '@actions/subactions/deployInitCapitalContracts6'
import { DeployInitCoreImplMsg, DeployInitCoreImplSubAction } from '@actions/subactions/deployInitCoreImpl'
import { DeployInitCoreProxyMsg, DeployInitCoreProxySubAction } from '@actions/subactions/deployInitCoreProxy'

import { BeginDefaultAdminTransferSubAction } from '@/src/actions/subactions/beginDefaultAdminTransfer'
import { TransferProxyAdminOwnerSubAction } from '@/src/actions/subactions/transferProxyAdminOwner'
import { InitCapitalRegistry } from '@/src/type'

export const DeployInitCapitalActionParamsSchema = z.object({
  proxyAdminOwner: zodAddress.describe(`Address of the owner of the proxy admin`),
  wrappedNativeToken: zodAddress.describe(`Address of the wrapped native token (e.g., WETH)`),
  posManagerNftName: z.string().describe(`Name of the position NFT token`),
  posManagerNftSymbol: z.string().describe(`Symbol of the position NFT token`),
  maxCollCount: z.number().describe(`Maximum number of collateral tokens can be used in a position`),
  maxLiqIncentiveMultiplier: z.bigint().describe(`Maximum liquidation incentive multiplier`),
  governor: zodAddress.describe(`Address of account who will be granted the governor role`),
  guardian: zodAddress.describe(`Address of account who will be granted the guardian role`),
  feeAdmin: zodAddress.describe(`Address of account who can control the fee vault`),
  treasury: zodAddress.describe(`Address of account who receive the fee from the fee vault`),
})

export type DeployInitCapitalActionParams = z.infer<typeof DeployInitCapitalActionParamsSchema>

export type DeployInitCapitalActionData = {
  params: DeployInitCapitalActionParams
  signer: Record<'deployer' | 'accessControlManagerOwner', InfinitWallet>
}

export class DeployInitCapitalAction extends Action<DeployInitCapitalActionData, InitCapitalRegistry> {
  constructor(data: DeployInitCapitalActionData) {
    validateActionData(data, DeployInitCapitalActionParamsSchema, ['deployer'])
    super(DeployInitCapitalAction.name, data)
  }

  protected getSubActions(): ((message: any) => SubAction)[] {
    const deployer: InfinitWallet = this.data.signer['deployer']
    const accessControlManagerOwner: InfinitWallet = this.data.signer['accessControlManagerOwner']
    const params = this.data.params

    return [
      () => new DeployInitCapitalContracts1SubAction(deployer, {}),
      (message: DeployInitCapitalMsg) =>
        new BeginDefaultAdminTransferSubAction(deployer, {
          accessControlManager: message.accessControlManager,
          newOwner: accessControlManagerOwner.walletClient.account.address,
        }),
      (message: DeployInitCapitalMsg) =>
        new DeployInitCapitalContracts2SubAction(deployer, {
          accessControlManager: message.accessControlManager,
        }),
      (message: DeployInitCapitalMsg & DeployInitCapitalMsg_2) =>
        new DeployInitCapitalContracts3SubAction(deployer, {
          proxyAdmin: message.proxyAdmin,
          initOracleImpl: message.initOracleImpl,
          configImpl: message.configImpl,
          liqIncentiveCalculatorImpl: message.liqIncentiveCalculatorImpl,
          posManagerImpl: message.posManagerImpl,
        }),
      (message: DeployInitCapitalMsg & DeployInitCapitalMsg_2 & DeployInitCapitalMsg_3) =>
        new DeployInitCoreImplSubAction(deployer, {
          posManagerProxy: message.posManagerProxy,
          accessControlManager: message.accessControlManager,
        }),
      (message: DeployInitCapitalMsg & DeployInitCapitalMsg_2 & DeployInitCapitalMsg_3 & DeployInitCoreImplMsg) =>
        new DeployInitCoreProxySubAction(deployer, {
          proxyAdmin: message.proxyAdmin,
          initCoreImpl: message.initCoreImpl,
        }),

      (message: DeployInitCapitalMsg & DeployInitCapitalMsg_2 & DeployInitCapitalMsg_3 & DeployInitCoreImplMsg & DeployInitCoreProxyMsg) =>
        new DeployInitCapitalContracts4SubAction(deployer, {
          accessControlManager: message.accessControlManager,
          initCoreProxy: message.initCoreProxy,
          wrappedNativeToken: message.accessControlManager,
          feeAdmin: params.feeAdmin,
          treasury: params.treasury,
        }),
      (
        message: DeployInitCapitalMsg &
          DeployInitCapitalMsg_2 &
          DeployInitCapitalMsg_3 &
          DeployInitCoreImplMsg &
          DeployInitCoreProxyMsg &
          DeployInitCapitalMsg_4,
      ) =>
        new DeployInitCapitalContracts5SubAction(deployer, {
          proxyAdmin: message.proxyAdmin,
          initCoreProxy: message.initCoreProxy,
          wrappedNativeToken: params.wrappedNativeToken,
          riskManagerImpl: message.riskManagerImpl,
          moneyMarketHookImpl: message.moneyMarketHookImpl,
        }),
      (
        message: DeployInitCapitalMsg &
          DeployInitCapitalMsg_2 &
          DeployInitCapitalMsg_3 &
          DeployInitCoreImplMsg &
          DeployInitCoreProxyMsg &
          DeployInitCapitalMsg_4 &
          DeployInitCapitalMsg_5 &
          DeployInitCapitalMsg_6,
      ) =>
        new TransferProxyAdminOwnerSubAction(deployer, {
          proxyAdmin: message.proxyAdmin,
          newOwner: params.proxyAdminOwner,
        }),
      (
        message: DeployInitCapitalMsg &
          DeployInitCapitalMsg_2 &
          DeployInitCapitalMsg_3 &
          DeployInitCoreImplMsg &
          DeployInitCoreProxyMsg &
          DeployInitCapitalMsg_4 &
          DeployInitCapitalMsg_5,
      ) =>
        new DeployInitCapitalContracts6SubAction(deployer, {
          initCoreProxy: message.initCoreProxy,
          posManagerProxy: message.posManagerProxy,
          accessControlManager: message.accessControlManager,
          nftName: params.posManagerNftName,
          nftSymbol: params.posManagerNftSymbol,
          maxCollCount: params.maxCollCount,
          configProxy: message.configProxy,
          initOracleProxy: message.initOracleProxy,
          riskManagerProxy: message.riskManagerProxy,
          moneyMarketHookProxy: message.moneyMarketHookProxy,
          liqIncentiveCalculatorProxy: message.liqIncentiveCalculatorProxy,
          maxLiqIncentiveMultiplier: params.maxLiqIncentiveMultiplier,
        }),
      (
        message: DeployInitCapitalMsg &
          DeployInitCapitalMsg_2 &
          DeployInitCapitalMsg_3 &
          DeployInitCoreImplMsg &
          DeployInitCoreProxyMsg &
          DeployInitCapitalMsg_4 &
          DeployInitCapitalMsg_5 &
          DeployInitCapitalMsg_6,
      ) =>
        new AcceptDefaultAdminTransferSubAction(accessControlManagerOwner, {
          accessControlManager: message.accessControlManager,
        }),
      (
        message: DeployInitCapitalMsg &
          DeployInitCapitalMsg_2 &
          DeployInitCapitalMsg_3 &
          DeployInitCoreImplMsg &
          DeployInitCoreProxyMsg &
          DeployInitCapitalMsg_4 &
          DeployInitCapitalMsg_5 &
          DeployInitCapitalMsg_6,
      ) =>
        new AddGuardianSubAction(accessControlManagerOwner, {
          accessControlManager: message.accessControlManager,
          guardian: params.guardian,
        }),
      (
        message: DeployInitCapitalMsg &
          DeployInitCapitalMsg_2 &
          DeployInitCapitalMsg_3 &
          DeployInitCoreImplMsg &
          DeployInitCoreProxyMsg &
          DeployInitCapitalMsg_4 &
          DeployInitCapitalMsg_5 &
          DeployInitCapitalMsg_6,
      ) =>
        new AddGovernorSubAction(accessControlManagerOwner, {
          accessControlManager: message.accessControlManager,
          governor: params.governor,
        }),
    ]
  }
}
