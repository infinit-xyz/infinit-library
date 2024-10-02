import { Address, toHex } from 'viem'

import { InfinitWallet, SubAction, SubActionExecuteResponse } from '@infinit-xyz/core'

import { AddEmergencyAdminACLManagerTxBuilder } from '@actions/subactions/tx-builders/aclManager/addEmergencyAdmin'
import { AddPoolAdminACLManagerTxBuilder } from '@actions/subactions/tx-builders/aclManager/addPoolAdmin'
import { GrantRoleTxBuilder } from '@actions/subactions/tx-builders/aclManager/grantRole'
import { TransferOwnershipTxBuilder } from '@actions/subactions/tx-builders/ownable/transferOwnership'
import { SetACLAdminTxBuilder } from '@actions/subactions/tx-builders/poolAddressesProvider/setACLAdmin'

import { AaveV3Registry } from '@/src/type'

export type DeployAaveV3_Setup2SubActionParams = {
  poolAddressesProviderRegistry: Address
  poolAddressesProvider: Address
  reservesSetupHelper: Address
  emissionManager: Address
  addressesProviderOwner: Address
  addressesProviderRegistryOwner: Address
  aclManager: Address
  aclAdmin: Address
  poolAdmin: Address
  emergencyAdmin: Address
  emissionManagerOwner: Address
  deployer: Address
}

export class DeployAaveV3_Setup2SubAction extends SubAction<DeployAaveV3_Setup2SubActionParams, AaveV3Registry> {
  constructor(client: InfinitWallet, params: DeployAaveV3_Setup2SubActionParams) {
    super(DeployAaveV3_Setup2SubAction.name, client, params)
  }

  protected setTxBuilders(): void {
    // (aclAdminSigner) addEmergencyAdmin
    const addEmergencyAdmin = new AddEmergencyAdminACLManagerTxBuilder(this.client, {
      aclManager: this.params.aclManager,
      emergencyAdmin: this.params.emergencyAdmin,
    })
    this.txBuilders.push(addEmergencyAdmin)

    // add pool admin
    const addPoolAdminACLManager = new AddPoolAdminACLManagerTxBuilder(this.client, {
      aclManager: this.params.aclManager,
      poolAdmin: this.params.poolAdmin,
    })
    this.txBuilders.push(addPoolAdminACLManager)

    // revoke deployer add pool admin
    const revokeDeployerPoolAdminACLManager = new AddPoolAdminACLManagerTxBuilder(this.client, {
      aclManager: this.params.aclManager,
      poolAdmin: this.params.poolAdmin,
    })
    this.txBuilders.push(revokeDeployerPoolAdminACLManager)
    // set acl admin
    const setACLAdminSubAction = new SetACLAdminTxBuilder(this.client, {
      poolAddressesProvider: this.params.poolAddressesProvider,
      aclAdmin: this.params.aclAdmin,
    })
    this.txBuilders.push(setACLAdminSubAction)

    // grant role `DEFAULT_ADMIN` to aclAdmin
    const grantDefaultAdmin = new GrantRoleTxBuilder(this.client, {
      aclManager: this.params.aclManager,
      role: toHex(0x00, { size: 32 }),
      account: this.params.aclAdmin,
    })
    this.txBuilders.push(grantDefaultAdmin)

    // (deployer) revoke `DEFAULT_ADMIN` role
    const deployerRevokeDefaultAdminRole = new GrantRoleTxBuilder(this.client, {
      aclManager: this.params.aclManager,
      role: toHex(0x00, { size: 32 }),
      account: this.params.deployer,
    })
    this.txBuilders.push(deployerRevokeDefaultAdminRole)

    // transfer ownership pool poolAddressesProvider
    const poolAddressesProviderTransferOwnership = new TransferOwnershipTxBuilder(this.client, {
      ownableContract: this.params.poolAddressesProvider,
      newOwner: this.params.addressesProviderOwner,
    })
    this.txBuilders.push(poolAddressesProviderTransferOwnership)

    // transfer ownership pool poolAddressesProviderRegistry
    const poolAddressesProviderRegistryTransferOwnership = new TransferOwnershipTxBuilder(this.client, {
      ownableContract: this.params.poolAddressesProviderRegistry,
      newOwner: this.params.addressesProviderRegistryOwner,
    })
    this.txBuilders.push(poolAddressesProviderRegistryTransferOwnership)

    // transfer ownership pool poolAddressesProvider
    const emissionManagerTransferOwnership = new TransferOwnershipTxBuilder(this.client, {
      ownableContract: this.params.emissionManager,
      newOwner: this.params.emissionManagerOwner,
    })
    this.txBuilders.push(emissionManagerTransferOwnership)
  }

  public async updateRegistryAndMessage(registry: AaveV3Registry): Promise<SubActionExecuteResponse<AaveV3Registry>> {
    return { newRegistry: registry, newMessage: {} }
  }
}
