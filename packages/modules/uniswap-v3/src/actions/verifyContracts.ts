import { Action, InfinitCache, InfinitCallback, InfinitWallet, SubAction } from "@infinit-xyz/core";
import { UniswapV3Registry } from "../type";

import { ContractInfo, verifyContract } from "@/src/utils/verifer";
import { validateActionData } from "@infinit-xyz/core/internal";
import { Etherscan } from "@nomicfoundation/hardhat-verify/etherscan";
import { z } from "zod";

export const VerifyUniswapV3ActionParamsSchema = z.object({
    apiKey: z.string().describe('block explorer api key'),
    apiUrl: z.string().describe('block explorer api url'),
    url: z.string().describe('block explorer url'),
})

export type VerifyUniswapV3ActionParams = z.infer<typeof VerifyUniswapV3ActionParamsSchema>

export type VerifyUniswapV3ActionData = {
    params: VerifyUniswapV3ActionParams
    signer: Record<'deployer', InfinitWallet>
}


export class VerifyUniswapV3Action extends Action<VerifyUniswapV3ActionData, UniswapV3Registry> {
    instance: Etherscan
        
    constructor(data: VerifyUniswapV3ActionData) {
        validateActionData(data, VerifyUniswapV3ActionParamsSchema, ['deployer'])
        super(VerifyUniswapV3Action.name, data)
        this.instance = new Etherscan(data.params.apiKey, data.params.apiUrl, data.params.url)
    }

    protected getSubActions(): SubAction[] {
        return []
    }

    public override async run(registry: UniswapV3Registry, _cache?: InfinitCache, callback?: InfinitCallback): Promise<UniswapV3Registry> {
        const client = this.data.signer['deployer']
        const {pools, ...rest} = registry
        const contracts: ContractInfo[] = []
        for (const address of Object.values(rest)) {
            contracts.push({ address })
        }
        if (pools) {
            for (const pool of pools) {
                contracts.push({ address: pool, constructorArgs: [] })
            }
        }

        for (const contract of contracts) {
            await verifyContract(client, this.instance, contract, callback)
        }
        return registry
    }
}
