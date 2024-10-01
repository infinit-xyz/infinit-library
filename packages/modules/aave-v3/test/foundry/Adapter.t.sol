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

    // --- FANTOM ---
    //https://docs.aave.com/developers/deployed-contracts/v3-mainnet
    address AAVE_ORACLE_FANTOM = 0xfd6f3c1845604C8AE6c6E402ad17fb9885160754;
    address WETH_FANTOM = 0x74b23882a30290451A17c44f4F05243b6b58C76d;
    //https://docs.bandchain.org/develop/supported-blockchains/
    IStdReference BAND_REF = IStdReference(0xDA7a001b254CD22e46d3eAB04d937489c93174C3);
    IAggregator wethEACAggregatorProxyFantom;
    AggregatorBandAdapter bandAdaptor;
    // ---

    uint256 fantomFork;
    uint256 arbitrumFork;

    function setUp() public {
        fantomFork = vm.createFork(vm.rpcUrl("wss://fantom-rpc.publicnode.com"));
        arbitrumFork = vm.createFork("wss://arbitrum-one.publicnode.com");

        vm.selectFork(arbitrumFork);
        wethEACAggregatorProxyArbitrum = IAggregator(IAaveOracle(AAVE_ORACLE_ARBITRUM).getSourceOfAsset(WETH_ARBITRUM));
        api3Adaptor = new AggregatorApi3Adapter(API3_ETH_USD_DAPI_PROXY);
        pythAdaptor = new AggregatorPythAdapter(PYTH, PYTH_WETH_USD_PRICE_FEED_ID);

        vm.selectFork(fantomFork);
        wethEACAggregatorProxyFantom = IAggregator(IAaveOracle(AAVE_ORACLE_FANTOM).getSourceOfAsset(WETH_FANTOM));
        bandAdaptor = new AggregatorBandAdapter(BAND_REF, "ETH", "USD");
    }

    function testApi3() public {
        vm.selectFork(arbitrumFork);
        int256 price1 = wethEACAggregatorProxyArbitrum.latestAnswer();
        int256 price2 = api3Adaptor.latestAnswer();
        console.log("Chainlink Price: ", price1);
        console.log("Api3 Price: ", price2);
        // price should not be diff than 1%
        assertApproxEqRel(price1, price2, 1e16);
    }

    function testPyth() public {
        vm.selectFork(arbitrumFork);
        int256 price1 = wethEACAggregatorProxyArbitrum.latestAnswer();
        int256 price2 = pythAdaptor.latestAnswer();
        console.log("Chainlink Price: ", price1);
        console.log("Pyth Price: ", price2);
        // price should not be diff than 8%
        assertApproxEqRel(price1, price2, 8e16);
    }

    function testBand() public {
        vm.selectFork(fantomFork);
        int256 price1 = wethEACAggregatorProxyFantom.latestAnswer();
        int256 price2 = bandAdaptor.latestAnswer();
        console.log("Chainlink Price: ", price1);
        console.log("Band Price: ", price2);
        // price should not be diff than 1%
        assertApproxEqRel(price1, price2, 1e16);
    }
}
