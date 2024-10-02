import { UniswapV3Registry } from "@/src/type";
import { getArtifacts } from "@/src/utils/artifact";
import { InfinitCallback } from "@infinit-xyz/core";
import { ContractInfo, verifyContract } from "@infinit-xyz/core/internal";
import { Etherscan } from "@nomicfoundation/hardhat-verify/src/internal/etherscan.js";
import { Chain, createPublicClient, http, PublicClient } from "viem";

type BlockExplorerParams = {
    apiKey?: string
    apiUrl: string
    url: string
}

export class UniswapV3Verifier {
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
    
    public async verify(registry: UniswapV3Registry, callback?: InfinitCallback) {
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
        // get artifacts
        const artifacts = await getArtifacts()
        for (const contract of contracts) {
            await verifyContract(this.client, this.etherscan, artifacts, contract, callback)
        }
    }
}
