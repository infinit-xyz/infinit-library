import { Action, InfinitCallback, InfinitWallet, SubAction } from "@infinit-xyz/core";
import { AaveV3Registry, LendingPool } from "../type";

import { ContractInfo, verifyContract } from "@/src/utils/verifer";
import { validateActionData } from "@infinit-xyz/core/internal";
import { Etherscan } from "@nomicfoundation/hardhat-verify/etherscan";
import { Address } from "viem";
import { z } from "zod";

export const VerifyAaveV3ActionParamsSchema = z.object({
    apiKey: z.string().describe('block explorer api key'),
    apiUrl: z.string().describe('block explorer api url'),
    url: z.string().describe('block explorer url'),
})

export type VerifyAaveV3ActionParams = z.infer<typeof VerifyAaveV3ActionParamsSchema>

export type VerifyAaveV3ActionData = {
    params: VerifyAaveV3ActionParams
    signer: Record<'deployer', InfinitWallet>
}


export class VerifyAaveV3Action extends Action<VerifyAaveV3ActionData, AaveV3Registry> {
    instance: Etherscan
        
    constructor(data: VerifyAaveV3ActionData) {
        validateActionData(data, VerifyAaveV3ActionParamsSchema, ['deployer'])
        super(VerifyAaveV3Action.name, data)
        this.instance = new Etherscan(data.params.apiKey, data.params.apiUrl, data.params.url)
    }

    protected getSubActions(): SubAction[] {
        return []
    }

    private async getLendingPoolContractInfos(poolConfiguratorProxy: Address, lendingPools: Record<string, LendingPool>) {
        const contracts: ContractInfo[] = []
        for (const info of Object.values(lendingPools)) {
            for (const [contractName, address] of Object.entries(info)) {
                if (contractName === 'underlyingToken') continue
                contracts.push({
                    address,
                    constructorArgs: contractName !== 'interestRateStrategy' ? [poolConfiguratorProxy] : undefined
                })
            }
        }
        return contracts
    }

    private async getReserveInterestRateStrategyContractInfos(reserveInterestRateStrategies: Record<string, Address>) {
        const contracts: ContractInfo[] = []
        for (const address of Object.values(reserveInterestRateStrategies)) {
            contracts.push({ address })
        }
        return contracts
    }

    public override async run(registry: AaveV3Registry, callback?: InfinitCallback): Promise<AaveV3Registry> {
        const client = this.data.signer['deployer']
        const { lendingPools, reserveInterestRateStrategies, poolProxy, poolConfiguratorProxy, rewardsControllerProxy, ...contractToAddressRegistry } = registry
        
        let contracts: ContractInfo[] = []
        for (const address of Object.values(contractToAddressRegistry)) {
            contracts.push({ address })
        }
        if (registry.poolAddressesProvider) {
            if (poolProxy) {
                contracts.push({
                    address: poolProxy,
                    constructorArgs: [registry.poolAddressesProvider]
                })
            }
            if (poolConfiguratorProxy) {
                contracts.push({
                    address: poolConfiguratorProxy,
                    constructorArgs: [registry.poolAddressesProvider]
                })
            }
        }
        if (lendingPools && registry.poolConfiguratorProxy) {
            contracts = contracts.concat(await this.getLendingPoolContractInfos( registry.poolConfiguratorProxy, lendingPools))
        }
        if (reserveInterestRateStrategies) {
            contracts = contracts.concat(await this.getReserveInterestRateStrategyContractInfos( reserveInterestRateStrategies))
        }

        for (const contract of contracts) {
            await verifyContract(client, this.instance, contract, callback)
        }
        return registry
    }
}
