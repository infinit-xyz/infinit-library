pragma solidity ^0.8.10;

import {IAggregator} from "./interfaces/IAggregator.sol";
import {IApi3Proxy} from "./interfaces/IApi3Proxy.sol";

contract AggregatorApi3Adapter is IAggregator {
    address immutable DATA_FEED_PROXY;

    constructor(address _dataFeedProxy) {
        DATA_FEED_PROXY = _dataFeedProxy;
    }

    function decimals() external pure returns (uint8) {
        return 8;
    }

    function latestAnswer() external view returns (int256 price_e8) {
        (int224 price,) = IApi3Proxy(DATA_FEED_PROXY).read();
        // Api3 precision is 1e18
        price_e8 = price / 10e10;
    }

    function latestTimestamp() external view returns (uint256 timestamp) {
        (, timestamp) = IApi3Proxy(DATA_FEED_PROXY).read();
    }
}
