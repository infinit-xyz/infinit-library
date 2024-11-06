import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddressNonZero, zodHex } from '@infinit-xyz/core/internal'

import { SetMerkleRootSubAction, SetMerkleRootSubActionParams } from '@actions/on-chain/subactions/setMerkleRoot'

import { TokenRegistry } from '@/src/type'

export const SetMerkleRootActionParamsSchema = z.object({
  accumulativeMerkleDistributor: zodAddressNonZero.describe(`accumulative merkle distributor`),
  root: zodHex.describe(`merkle root`),
})

export type SetMerkleRootActionParams = z.infer<typeof SetMerkleRootActionParamsSchema>

export type SetMerkleRootActionData = {
  params: SetMerkleRootActionParams
  signer: Record<'owner', InfinitWallet>
}

export class SetMerkleRootAction extends Action<SetMerkleRootActionData, TokenRegistry> {
  constructor(data: SetMerkleRootActionData) {
    validateActionData(data, SetMerkleRootActionParamsSchema, ['owner'])
    super(SetMerkleRootAction.name, data)
  }

  protected getSubActions(): SubAction[] {
    const deployer = this.data.signer['owner']
    const params = this.data.params
    const SetMerkleRootParams: SetMerkleRootSubActionParams = {
      accumulativeMerkleDistributor: params.accumulativeMerkleDistributor,
      root: params.root,
    }
    return [new SetMerkleRootSubAction(deployer, SetMerkleRootParams)]
  }
}
