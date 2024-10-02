import { AaveV3Registry, LendingPool } from "@/src/type";
import { getArtifacts } from "@/src/utils/artifact";
import { InfinitCallback } from "@infinit-xyz/core";
import { ContractInfo, verifyContract } from "@infinit-xyz/core/internal";
import { Etherscan } from "@nomicfoundation/hardhat-verify/src/internal/etherscan.js";
import { Address, Chain, createPublicClient, http, PublicClient } from "viem";

type BlockExplorerParams = {
    apiKey?: string
    apiUrl: string
    url: string
}

export class AaveV3Verifier {
  etherscan: Etherscan
  client: PublicClient
    constructor(chain: Chain, rpcEndpoint: string, params: BlockExplorerParams) {
        params.apiKey = params.apiKey ?? "API_KEY_NOT_PROVIDED"
        this.etherscan = new Etherscan(params.apiKey!, params.apiUrl, params.url)
        this.client = createPublicClient({
            chain, 
            transport: http(rpcEndpoint)
        })
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
    
    public async verify(registry: AaveV3Registry, callback?: InfinitCallback) {
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
        const artifacts = await getArtifacts()
        for (const contract of contracts) {
            await verifyContract(this.client, this.etherscan, artifacts, contract, callback)
        }
    }
}
