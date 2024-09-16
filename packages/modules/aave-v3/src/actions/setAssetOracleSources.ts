import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetAssetOracleSourcesSubAction, SetAssetOracleSourcesSubActionParams } from '@actions/subactions/setAssetOracleSources'

export const SetAssetOracleSourcesActionParamsSchema = z.object({
  oracle: zodAddress.describe(`The address of the oracle contract e.g. '0x123...abc'`),
  assets: z.array(zodAddress).describe(`The addresses of the underlying assets of the lending pool e.g. ['0x123...abc']`),
  sources: z.array(zodAddress).describe(`The addresses of the price sources e.g. ['0x123...abc']`),
}) satisfies z.ZodType<SetAssetOracleSourcesSubActionParams>

export type SetAssetOracleSourcesData = {
  params: SetAssetOracleSourcesSubActionParams
  signer: Record<string, InfinitWallet>
}

export class SetAssetOracleSourcesAction extends Action<SetAssetOracleSourcesData> {
  constructor(data: SetAssetOracleSourcesData) {
    validateActionData(data, SetAssetOracleSourcesActionParamsSchema, ['poolAdmin'])
    super(SetAssetOracleSourcesAction.name, data)
  }
  protected getSubActions(): SubAction[] {
    const poolAdmin = this.data.signer['poolAdmin']
    const params = this.data.params

    return [new SetAssetOracleSourcesSubAction(poolAdmin, params)]
  }
}
