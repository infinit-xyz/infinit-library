import { z } from 'zod'

import { Action, InfinitWallet, SubAction } from '@infinit-xyz/core'
import { ValidateInputValueError } from '@infinit-xyz/core/errors'
import { validateActionData, zodAddress } from '@infinit-xyz/core/internal'

import { SetAssetOracleSourcesSubAction } from '@actions/subactions/setAssetOracleSources'

import { AaveV3Registry } from '@/src/type'

export const SetAssetOracleSourcesActionParamsSchema = z.object({
  assets: z.array(zodAddress).describe(`The addresses of the underlying assets of the lending pool e.g. ['0x123...abc']`),
  sources: z.array(zodAddress).describe(`The addresses of the price sources e.g. ['0x123...abc']`),
})

export type SetAssetOracleSourcesActionParams = z.infer<typeof SetAssetOracleSourcesActionParamsSchema>

export type SetAssetOracleSourcesData = {
  params: SetAssetOracleSourcesActionParams
  signer: Record<string, InfinitWallet>
}

export class SetAssetOracleSourcesAction extends Action<SetAssetOracleSourcesData> {
  constructor(data: SetAssetOracleSourcesData) {
    validateActionData(data, SetAssetOracleSourcesActionParamsSchema, ['poolAdmin'])
    super(SetAssetOracleSourcesAction.name, data)
  }
  protected getSubActions(registry: AaveV3Registry): SubAction[] {
    if (!registry.aaveOracle) {
      throw new ValidateInputValueError('registry: aaveOracle not found')
    }
    const poolAdmin = this.data.signer['poolAdmin']
    const params = {
      ...this.data.params,
      oracle: registry.aaveOracle,
    }

    return [new SetAssetOracleSourcesSubAction(poolAdmin, params)]
  }
}
