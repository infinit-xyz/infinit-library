pragma solidity ^0.8.10;

import {SafeMath} from "@aave/core-v3/contracts/dependencies/openzeppelin/contracts/SafeMath.sol";
import {IAggregator} from "./interfaces/IAggregator.sol";
import {IPyth} from "./interfaces/IPyth.sol";

contract AggregatorPythAdapter is IAggregator {
    using SafeMath for uint256;

    address immutable PYTH;
    bytes32 immutable PRICE_ID;

    constructor(address _pyth, bytes32 _priceId) {
        PYTH = _pyth;
        PRICE_ID = _priceId;
    }

    function decimals() external pure returns (uint8) {
        return 8;
    }

    function latestAnswer() external view returns (int256) {
        (int64 price,, int32 expo,) = IPyth(PYTH).getPriceUnsafe(PRICE_ID);
        uint256 expoUint = uint256(int256(-expo));
        uint256 price_e8 = uint256(uint64(price)).mul(10e8).div(10 ** expoUint);
        return int256(price_e8);
    }

    function latestTimestamp() external view returns (uint256) {
        (,,, uint64 publishTime) = IPyth(PYTH).getPriceUnsafe(PRICE_ID);
        return uint256(publishTime);
    }
}
