import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero } from '@infinit-xyz/core/internal'

import { TransferProxyAdminOwnerSubAction, TransferProxyAdminOwnerSubActionParams } from '@actions/subactions/transferProxyAdminOwner'

import { UniswapV3Registry } from '@/src/type'

export const TransferProxyAdminOwnerActionParamsSchema = z.object({
  proxyAdmin: zodAddressNonZero.describe(`Address of the proxy admin contract`),
  newOwner: zodAddressNonZero.describe(`Address of the owner of the proxy admin`),
}) satisfies z.ZodType<TransferProxyAdminOwnerSubActionParams>

export type TransferProxyAdminOwnerActionParams = z.infer<typeof TransferProxyAdminOwnerActionParamsSchema>

export type TransferProxyAdminOwnerActionData = {
  params: TransferProxyAdminOwnerActionParams
  signer: Record<'proxyAdminOwner', InfinitWallet>
}

export class TransferProxyAdminOwnerAction extends Action<TransferProxyAdminOwnerActionData, UniswapV3Registry> {
  constructor(data: TransferProxyAdminOwnerActionData) {
    validateActionData(data, TransferProxyAdminOwnerActionParamsSchema, ['proxyAdminOwner'])

    super(TransferProxyAdminOwnerAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const owner = this.data.signer['proxyAdminOwner']
    const params = this.data.params
    return [new TransferProxyAdminOwnerSubAction(owner, params)]
  }
}
