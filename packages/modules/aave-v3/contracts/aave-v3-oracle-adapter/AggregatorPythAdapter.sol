pragma solidity ^0.8.10;

import {SafeMath} from '@aave/core-v3/contracts/dependencies/openzeppelin/contracts/SafeMath.sol';
import {SafeCast} from '@aave/core-v3/contracts/dependencies/openzeppelin/contracts/SafeCast.sol';
import {IAggregator} from './interfaces/IAggregator.sol';
import {IPyth} from './interfaces/IPyth.sol';

contract AggregatorPythAdapter is IAggregator {
  using SafeMath for uint256;
  using SafeCast for uint256;
  using SafeCast for int64;
  using SafeCast for int32;

  address immutable PYTH;
  bytes32 immutable PRICE_ID;

  constructor(address _pyth, bytes32 _priceId) {
    PYTH = _pyth;
    PRICE_ID = _priceId;
  }

  function decimals() external pure returns (uint8 precision) {
    precision = 8;
  }

  function latestAnswer() external view returns (int256) {
    (int64 price, , int32 expo, ) = IPyth(PYTH).getPriceUnsafe(PRICE_ID);
    uint256 expoUint = (-expo).toUint256();
    // convert to 1e8 precision
    uint256 price_e8 = price.toUint256().mul(1e8).div(10 ** expoUint);
    return price_e8.toInt256();
  }

  function latestTimestamp() external view returns (uint256) {
    (, , , uint64 publishTime) = IPyth(PYTH).getPriceUnsafe(PRICE_ID);
    return uint256(publishTime);
  }
}
