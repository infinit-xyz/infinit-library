// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import {Test, console, stdError} from "forge-std/Test.sol";
import {IAggregator} from "../../contracts/aave-v3-oracle-adapter/interfaces/IAggregator.sol";
import {IApi3Proxy} from "../../contracts/aave-v3-oracle-adapter/interfaces/IApi3Proxy.sol";
import {IStdReference} from "../../contracts/aave-v3-oracle-adapter/interfaces/IStdReference.sol";
import {AggregatorApi3Adapter} from "../../contracts/aave-v3-oracle-adapter/AggregatorApi3Adapter.sol";
import {AggregatorPythAdapter} from "../../contracts/aave-v3-oracle-adapter/AggregatorPythAdapter.sol";
import {AggregatorBandAdapter} from "../../contracts/aave-v3-oracle-adapter/AggregatorBandAdapter.sol";

interface IAaveOracle {
    function getSourceOfAsset(address) external returns (address);
}

contract AdapterTest is Test {
    // --- Arbitrum ---
    //https://docs.aave.com/developers/deployed-contracts/v3-mainnet
    address AAVE_ORACLE_ARBITRUM = 0xb56c2F0B653B2e0b10C9b928C8580Ac5Df02C7C7;
    address WETH_ARBITRUM = 0x82aF49447D8a07e3bd95BD0d56f35241523fBab1;
    //https://market.api3.org/
    address API3_ETH_USD_DAPI_PROXY = 0xf624881ac131210716F7708C28403cCBe346cB73;
    //https://docs.pyth.network/price-feeds/contract-addresses/evm
    address PYTH = 0xff1a0f4744e8582DF1aE09D5611b887B6a12925C;
    //https://www.pyth.network/developers/price-feed-ids
    bytes32 PYTH_WETH_USD_PRICE_FEED_ID = 0x9d4294bbcd1174d6f2003ec365831e64cc31d9f6f15a2b85399db8d5000960f6;
    IAggregator wethEACAggregatorProxyArbitrum;
    AggregatorApi3Adapter api3Adaptor;
    AggregatorPythAdapter pythAdaptor;

    // --- BSC ---
    //https://docs.aave.com/developers/deployed-contracts/v3-mainnet
    address AAVE_ORACLE_BSC = 0x39bc1bfDa2130d6Bb6DBEfd366939b4c7aa7C697;
    address WETH_BSC = 0x2170Ed0880ac9A755fd29B2688956BD959F933F8;
    //https://docs.bandchain.org/develop/supported-blockchains/
    IStdReference BAND_REF = IStdReference(0xDA7a001b254CD22e46d3eAB04d937489c93174C3);
    IAggregator wethEACAggregatorProxyBSC;
    AggregatorBandAdapter bandAdaptor;
    // ---

    uint256 bscFork;
    uint256 arbitrumFork;

    function setUp() public {
        bscFork = vm.createFork(vm.rpcUrl("wss://bsc-rpc.publicnode.com"));
        arbitrumFork = vm.createFork("wss://arbitrum-one.publicnode.com");

        vm.selectFork(arbitrumFork);
        wethEACAggregatorProxyArbitrum = IAggregator(IAaveOracle(AAVE_ORACLE_ARBITRUM).getSourceOfAsset(WETH_ARBITRUM));
        api3Adaptor = new AggregatorApi3Adapter(API3_ETH_USD_DAPI_PROXY);
        pythAdaptor = new AggregatorPythAdapter(PYTH, PYTH_WETH_USD_PRICE_FEED_ID);

        vm.selectFork(bscFork);
        wethEACAggregatorProxyBSC = IAggregator(IAaveOracle(AAVE_ORACLE_BSC).getSourceOfAsset(WETH_BSC));
        bandAdaptor = new AggregatorBandAdapter(BAND_REF, "ETH", "USD");
    }

    function testApi3() public {
        vm.selectFork(arbitrumFork);
        int256 price = wethEACAggregatorProxyArbitrum.latestAnswer();
        int256 price2 = api3Adaptor.latestAnswer();
        console.log("Chainlink Price: ", price);
        console.log("Api3 Price: ", price2);
    }

    function testPyth() public {
        vm.selectFork(arbitrumFork);
        int256 price = wethEACAggregatorProxyArbitrum.latestAnswer();
        int256 price2 = pythAdaptor.latestAnswer();
        console.log("Chainlink Price: ", price);
        console.log("Pyth Price: ", price2);
    }

    function testBand() public {
        vm.selectFork(bscFork);
        int256 price = wethEACAggregatorProxyBSC.latestAnswer();
        int256 price2 = bandAdaptor.latestAnswer();
        console.log("Chainlink Price: ", price);
        console.log("Band Price: ", price2);
    }
}
