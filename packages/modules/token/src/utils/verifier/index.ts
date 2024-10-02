import { TokenRegistry } from "@/src/type";
import { InfinitCallback } from "@infinit-xyz/core";
import { ContractInfo, verifyContract } from "@infinit-xyz/core/internal";
import { Etherscan } from "@nomicfoundation/hardhat-verify/src/internal/etherscan.js";
import { getArtifacts } from "@utils/artifact";
import { Address, Chain, createPublicClient, http, PublicClient } from "viem";

type BlockExplorerParams = {
    apiKey?: string
    apiUrl: string
    url: string
}

export class TokenVerifier {
  etherscan: Etherscan
  client: PublicClient
    constructor(chain: Chain, rpcEndpoint: string, params: BlockExplorerParams) {
        params.apiKey = params.apiKey ?? "API_KEY_NOT_PROVIDED" // note: test that we can use default value
        this.etherscan = new Etherscan(params.apiKey!, params.apiUrl, params.url)
        this.client = createPublicClient({
            chain, 
            transport: http(rpcEndpoint)
        })
    }
    
    public async verify(registry: TokenRegistry, callback?: InfinitCallback) {
        if (!this.etherscan) return
        const {accumulativeMerkleDistributors, tokens} = registry
        const contracts: ContractInfo[] = []

        if (tokens) {
            for (const address of Object.keys(tokens)) {
                contracts.push({ address: address as Address })
            }
        }
        if (accumulativeMerkleDistributors) {
            for (const [proxyAddress, {implementation}] of Object.entries(accumulativeMerkleDistributors)) {
                contracts.push({ address: proxyAddress as Address })
                contracts.push({ address: implementation })
            }
        }
        const artifacts = await getArtifacts()
        for (const contract of contracts) {
            await verifyContract(this.client, this.etherscan, artifacts, contract, callback)
        }
    }
}
