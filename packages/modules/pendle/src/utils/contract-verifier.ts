import { Address, PublicClient } from 'viem'

import { BaseContractVerifier, BlockExplorerParams, ContractInfo } from '@infinit-xyz/core/internal'

import { Artifacts } from 'hardhat/types'

import { PendleRegistry } from '@/src/type'
import { getArtifacts, readArtifact } from '@/src/utils/artifact'

export class PendleContractVerifier extends BaseContractVerifier<PendleRegistry> {
  constructor(client: PublicClient, params: BlockExplorerParams) {
    super(client, params)
  }

  protected override async getContracts(registry: PendleRegistry): Promise<ContractInfo[]> {
    const contracts: ContractInfo[] = []

    if (registry.pendleYieldContractFactory) {
      const pendleYieldContractFactoryArtifact = await readArtifact('PendleYieldContractFactory')
      const ytCreationCodeContractA: Address = await this.client.readContract({
        address: registry.pendleYieldContractFactory!,
        abi: pendleYieldContractFactoryArtifact.abi,
        functionName: 'ytCreationCodeContractA',
        args: [],
      })
      const ytCreationCodeSizeA: bigint = await this.client.readContract({
        address: registry.pendleYieldContractFactory!,
        abi: pendleYieldContractFactoryArtifact.abi,
        functionName: 'ytCreationCodeSizeA',
        args: [],
      })

      const ytCreationCodeContractB: Address = await this.client.readContract({
        address: registry.pendleYieldContractFactory!,
        abi: pendleYieldContractFactoryArtifact.abi,
        functionName: 'ytCreationCodeContractB',
        args: [],
      })
      const ytCreationCodeSizeB: bigint = await this.client.readContract({
        address: registry.pendleYieldContractFactory!,
        abi: pendleYieldContractFactoryArtifact.abi,
        functionName: 'ytCreationCodeSizeB',
        args: [],
      })

      contracts.push({
        address: registry.pendleYieldContractFactory,
        constructorArgs: [ytCreationCodeContractA, ytCreationCodeSizeA, ytCreationCodeContractB, ytCreationCodeSizeB],
        fqName: 'core-v2/contracts/core/YieldContracts/PendleYieldContractFactory.sol:PendleYieldContractFactory',
      })
    }

    if (registry.pendleMarketFactoryV3) {
      const pendleMarketFactoryV3Artifact = await readArtifact('PendleMarketFactoryV3')
      const yieldContractFactory: Address = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'yieldContractFactory',
        args: [],
      })
      const marketCreationCodeContractA: Address = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'marketCreationCodeContractA',
        args: [],
      })
      const marketCreationCodeSizeA: bigint = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'marketCreationCodeSizeA',
        args: [],
      })
      const marketCreationCodeContractB: Address = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'marketCreationCodeContractB',
        args: [],
      })
      const marketCreationCodeSizeB: bigint = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'marketCreationCodeSizeB',
        args: [],
      })
      const treasury: Address = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'treasury',
        args: [],
      })
      const reserveFeePercent: number = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'reserveFeePercent',
        args: [],
      })
      const vePendle: Address = await this.client.readContract({
        address: registry.pendleMarketFactoryV3!,
        abi: pendleMarketFactoryV3Artifact.abi,
        functionName: 'vePendle',
        args: [],
      })
      contracts.push({
        address: registry.pendleMarketFactoryV3,
        constructorArgs: [
          yieldContractFactory,
          marketCreationCodeContractA,
          marketCreationCodeSizeA,
          marketCreationCodeContractB,
          marketCreationCodeSizeB,
          treasury,
          reserveFeePercent,
          vePendle,
          registry.pendleGaugeControllerMainchainUpgProxy!,
        ],
        fqName: 'core-v2/contracts/core/Market/v3/PendleMarketFactoryV3.sol:PendleMarketFactoryV3',
      })
    }
    const contractMappings: { [key: string]: string } = {
      pendleRouterV4: 'core-v2/contracts/router/PendleRouterV4.sol:PendleRouterV4',
      routerStorageV4: 'core-v2/contracts/router/ActionStorageV4.sol:ActionStorageV4',
      actionAddRemoveLiqV3: 'core-v2/contracts/router/ActionAddRemoveLiqV3.sol:ActionAddRemoveLiqV3',
      actionCallbackV3: 'core-v2/contracts/router/ActionCallbackV3.sol:ActionCallbackV3',
      actionMiscV3: 'core-v2/contracts/router/ActionMiscV3.sol:ActionMiscV3',
      actionSimple: 'core-v2/contracts/router/ActionSimple.sol:ActionSimple',
      actionSwapPTV3: 'core-v2/contracts/router/ActionSwapPTV3.sol:ActionSwapPTV3',
      actionSwapYTV3: 'core-v2/contracts/router/ActionSwapYTV3.sol:ActionSwapYTV3',
      pendleRouterStatic: 'core-v2/contracts/offchain-helpers/router-static/PendleRouterStatic.sol:PendleRouterStatic',
      actionStorageStatic: 'core-v2/contracts/offchain-helpers/router-static/base/ActionStorageStatic.sol:ActionStorageStatic',
      actionInfoStatic: 'core-v2/contracts/offchain-helpers/router-static/base/ActionInfoStatic.sol:ActionInfoStatic',
      actionMarketAuxStatic: 'core-v2/contracts/offchain-helpers/router-static/base/ActionMarketAuxStatic.sol:ActionMarketAuxStatic',
      actionMarketCoreStatic: 'core-v2/contracts/offchain-helpers/router-static/base/ActionMarketCoreStatic.sol:ActionMarketCoreStatic',
      actionMintRedeemStatic: 'core-v2/contracts/offchain-helpers/router-static/base/ActionMintRedeemStatic.sol:ActionMintRedeemStatic',
      actionVePendleStatic: 'core-v2/contracts/offchain-helpers/router-static/base/ActionVePendleStatic.sol:ActionVePendleStatic',
      pendleLimitRouterImpl: 'core-v2/contracts/limit/PendleLimitRouter.sol:PendleLimitRouter',
      proxyAdmin: 'openzeppelin/contracts/proxy/transparent/ProxyAdmin.sol:ProxyAdmin',
      baseSplitCodeFactoryContract: 'core-v2/contracts/offchain-helpers/BaseSplitCodeFactoryContract.sol:BaseSplitCodeFactoryContract',
      oracleLib: 'core-v2/contracts/core/Market/OracleLib.sol:OracleLib',
      pendleGaugeControllerMainchainUpgImpl:
        'core-v2/contracts/LiquidityMining/GaugeController/PendleGaugeControllerMainchainUpg.sol:PendleGaugeControllerMainchainUpg',
      pendlePYLpOracle: 'core-v2/contracts/oracles/PendlePYLpOracle.sol:PendlePYLpOracle',
      pendleSwap: 'core-v2/contracts/router/swap-aggregator/PendleSwap.sol:PendleSwap',
      votingEscrowPendleMainchain:
        'core-v2/contracts/LiquidityMining/VotingEscrow/VotingEscrowPendleMainchain.sol:VotingEscrowPendleMainchain',
      pendleMsgSendEndpointUpgImpl: 'core-v2/contracts/LiquidityMining/CrossChainMsg/PendleMsgSendEndpointUpg.sol:PendleMsgSendEndpointUpg',
      pendleVotingControllerUpgImpl:
        'core-v2/contracts/LiquidityMining/VotingController/PendleVotingControllerUpg.sol:PendleVotingControllerUpg',
      multicall: 'core-v2/contracts/offchain-helpers/Multicall2.sol:Multicall2',
      pendleMulticallV2: 'core-v2/contracts/offchain-helpers/PendleMulticallV2.sol:PendleMulticallV2',
      simulateHelper: 'core-v2/contracts/offchain-helpers/SimulateHelper.sol:SimulateHelper',
      supplyCapReader: 'core-v2/contracts/offchain-helpers/SupplyCapReader.sol:SupplyCapReader',
      pendlePoolDeployHelper: 'core-v2/contracts/offchain-helpers/PendlePoolDeployHelper.sol:PendlePoolDeployHelper',
      pendleGovernanceProxyImpl: 'core-v2/contracts/offchain-helpers/PendleGovernanceProxy.sol:PendleGovernanceProxy',
      pendleBoringOneracle: 'core-v2/contracts/oracles/PendleBoringOneracle.sol:PendleBoringOneracle',
      feeVault: 'fee-vault/contracts/FeeVault.sol:FeeVault',
    }
    contractMappings.pendleGovernanceProxy = 'openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy'
    contractMappings.pendleGaugeControllerMainchainUpgProxy = 'openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy'
    contractMappings.pendleMsgSendEndpointUpgProxy = 'openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy'
    contractMappings.pendleVotingControllerUpgProxy = 'openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol:ERC1967Proxy'
    contractMappings.pendleLimitRouterProxy =
      'openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy'
    contractMappings.pendlePYLpOracleProxy =
      'openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol:TransparentUpgradeableProxy'

    for (const key of Object.keys(registry)) {
      if (key === 'pendleYieldContractFactory') continue
      if (key === 'pendleMarketFactoryV3') continue
      const fqName = contractMappings[key]
      if (!fqName) {
        console.log(`Contract ${key} not found in contractMappings`)
      }
      contracts.push({
        address: registry[key as keyof PendleRegistry]!,
        fqName,
      })
    }

    return contracts
  }

  protected override async getArtifacts(): Promise<Artifacts> {
    const artifacts = await getArtifacts()

    return artifacts
  }
}
