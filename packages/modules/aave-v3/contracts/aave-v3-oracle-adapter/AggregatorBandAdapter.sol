pragma solidity ^0.8.10;

import {IAggregator} from './interfaces/IAggregator.sol';
import {IStdReference} from './interfaces/IStdReference.sol';

contract AggregatorBandAdapter is IAggregator {
  IStdReference immutable ref;
  string public base;
  string public quote;

  constructor(IStdReference _ref, string memory _base, string memory _quote) {
    ref = _ref;
    base = _base;
    quote = _quote;
  }

  function decimals() external pure returns (uint8 precision) {
    precision = 8;
  }

  function latestAnswer() external view returns (int256 price_e8) {
    IStdReference.ReferenceData memory data = ref.getReferenceData(base, quote);
    // Band precision is 1e18
    price_e8 = int256(data.rate) / 10e10;
  }

  function latestTimestamp() external view returns (uint256 latestUpdated) {
    IStdReference.ReferenceData memory data = ref.getReferenceData(base, quote);
    latestUpdated = data.lastUpdatedBase > data.lastUpdatedQuote
      ? data.lastUpdatedBase
      : data.lastUpdatedQuote;
  }
}
